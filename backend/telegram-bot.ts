
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { GoogleGenAI } from "@google/genai";
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// --- VALIDAÇÃO ---
if (!process.env.API_KEY || !process.env.TELEGRAM_TOKEN) {
    console.error('❌ ERRO: API_KEY ou TELEGRAM_TOKEN ausentes no arquivo .env');
    console.error('Adicione TELEGRAM_TOKEN no seu .env');
    process.exit(1);
}

// --- FIREBASE ---
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    }
} catch (e) { console.warn("⚠️ Firebase off"); }
const db = admin.apps.length ? admin.firestore() : null;

// --- CONFIGURAÇÃO IA ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const SYSTEM_INSTRUCTION = `
Atue como o motor de inteligência do "Finance Pro AI", um controlador de custos premium.
Sua principal função é converter mensagens em dados estruturados.

DIRETRIZES:
- Tom de voz: Luxuoso, minimalista e direto.
- Idioma: Português Brasil.

REGRAS:
1. Extração de Dados: Identifique [Valor], [Categoria], [Descrição] e [Tipo].
2. Formato: Inicie com JSON delimitado por \`\`\`json.
3. Feedback: Confirmação elegante após o JSON.

EXEMPLO:
\`\`\`json
{ "valor": 150.00, "categoria": "Gastronomia", "descricao": "Jantar", "tipo": "despesa", "timestamp": "${new Date().toISOString()}" }
\`\`\`
✅ Finance Pro: R$ 150,00 em Gastronomia registrado. 🥂
`;

// --- FUNÇÃO PROCESSAMENTO ---
async function processInput(text: string, userId: string, isAudio = false, audioBuffer?: Buffer) {
    try {
        let contents: any;
        if (isAudio && audioBuffer) {
            contents = {
                parts: [
                    { inlineData: { data: audioBuffer.toString('base64'), mimeType: 'audio/ogg' } },
                    { text: "Extraia os dados financeiros deste áudio." }
                ]
            };
        } else {
            contents = { parts: [{ text: text }] };
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: contents,
            config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.1 },
        });

        const output = response.text || "";
        const jsonMatch = output.match(/```json\n([\s\S]*?)\n```/);

        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            const feedback = output.replace(jsonMatch[0], "").trim();
            
            if (db) {
                await db.collection('transactions').add({
                    ...data,
                    userId: userId.toString(),
                    source: 'telegram',
                    processedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            return feedback;
        }
        return output;
    } catch (e) {
        console.error(e);
        return "💎 Falha momentânea na conexão neural. Tente novamente.";
    }
}

// --- HANDLERS TELEGRAM ---

bot.start((ctx) => ctx.reply('💎 Finance Pro AI Online. Envie seus gastos ou ganhos.'));

// Handler de Texto
bot.on(message('text'), async (ctx) => {
    const userId = ctx.from.id.toString();
    ctx.sendChatAction('typing');
    const response = await processInput(ctx.message.text, userId);
    ctx.reply(response);
});

// Handler de Áudio (Voice)
bot.on(message('voice'), async (ctx) => {
    const userId = ctx.from.id.toString();
    ctx.sendChatAction('record_voice');
    
    try {
        const fileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        
        const aiResponse = await processInput("", userId, true, buffer);
        ctx.reply(aiResponse);
    } catch (e) {
        ctx.reply("Não foi possível processar o áudio.");
    }
});

console.log('🚀 Telegram Bot Iniciado...');
bot.launch();

// Graceful Stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
