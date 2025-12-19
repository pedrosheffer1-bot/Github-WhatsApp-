import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { GoogleGenAI } from "@google/genai";
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { Buffer } from 'buffer';
import * as fs from 'fs';

// Carrega variáveis de ambiente antes de qualquer coisa
dotenv.config();

console.log('\n=================================================');
console.log('💎 FINANCE PRO AI - TELEGRAM EDITION');
console.log('=================================================\n');

// --- VALIDAÇÃO ---
if (!process.env.API_KEY) {
    console.error('❌ ERRO CRÍTICO: API_KEY do Gemini ausente no .env');
    (process as any).exit(1);
}
if (!process.env.TELEGRAM_TOKEN) {
    console.error('❌ ERRO CRÍTICO: TELEGRAM_TOKEN ausente no .env (Peça ao @BotFather)');
    (process as any).exit(1);
}

// --- FIREBASE SETUP ---
let db: admin.firestore.Firestore | null = null;

try {
    // Verifica se o arquivo de credenciais existe se a variável estiver definida
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!admin.apps.length) {
        if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
            // Modo Produção: Usa o arquivo JSON baixado do Firebase
            console.log('🔥 Conectando ao Firebase via Service Account JSON...');
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL
            });
        } else {
            // Modo Fallback: Tenta pegar do ambiente local ou variável simplificada
            console.log('⚠️ Arquivo de credenciais JSON não encontrado ou não definido.');
            console.log('🔄 Tentando autenticação padrão (Application Default)...');
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                databaseURL: process.env.FIREBASE_DATABASE_URL
            });
        }
    }
    
    db = admin.firestore();
    console.log('✅ Banco de Dados: Conectado');
} catch (e) {
    console.warn("\n⚠️ AVISO: Não foi possível conectar ao Firebase.");
    console.warn("   O bot responderá, mas as transações NÃO serão salvas.");
    console.warn(`   Erro: ${(e as Error).message}\n`);
}

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
1. Extração de Dados: Identifique [Valor], [Categoria], [Descrição] e [Tipo: receita ou despesa].
2. Formato: Inicie OBRIGATORIAMENTE com JSON delimitado por \`\`\`json.
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
                    { text: "Extraia os dados financeiros deste áudio conforme instruções do sistema." }
                ]
            };
        } else {
            contents = { parts: [{ text: text }] };
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: contents,
            config: { 
                systemInstruction: SYSTEM_INSTRUCTION, 
                temperature: 0.1 
            },
        });

        const output = response.text || "";
        const jsonMatch = output.match(/```json\n([\s\S]*?)\n```/);

        if (jsonMatch) {
            try {
                const data = JSON.parse(jsonMatch[1]);
                const feedback = output.replace(jsonMatch[0], "").trim();
                
                if (db) {
                    await db.collection('transactions').add({
                        ...data,
                        userId: userId.toString(), // Salva o ID do Telegram como userId
                        source: 'telegram',
                        processedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    console.log(`💾 Transação Salva: ${data.valor} (${data.categoria})`);
                } else {
                    console.log(`[Simulação] Transação processada: ${data.valor}`);
                }
                return feedback;
            } catch (jsonError) {
                console.error("Erro ao parsear JSON:", jsonError);
                return output; // Retorna o texto original se o JSON falhar
            }
        }
        return output;
    } catch (e) {
        console.error("Erro na AI:", e);
        return "💎 Falha momentânea na conexão neural. Tente novamente.";
    }
}

// --- HANDLERS TELEGRAM ---

bot.start((ctx) => {
    const userName = ctx.from.first_name;
    ctx.reply(`💎 Bem-vindo ao Finance Pro AI, ${userName}.\n\nEnvie ou fale seus gastos para registro imediato.`);
});

// Handler de Texto
bot.on(message('text'), async (ctx) => {
    const userId = ctx.from.id.toString();
    console.log(`📩 Mensagem de ${ctx.from.first_name}: ${ctx.message.text}`);
    
    ctx.sendChatAction('typing');
    const response = await processInput(ctx.message.text, userId);
    ctx.reply(response);
});

// Handler de Áudio (Voice)
bot.on(message('voice'), async (ctx) => {
    const userId = ctx.from.id.toString();
    console.log(`🎤 Áudio recebido de ${ctx.from.first_name}`);
    ctx.sendChatAction('record_voice');
    
    try {
        const fileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        
        const aiResponse = await processInput("", userId, true, buffer);
        ctx.reply(aiResponse);
    } catch (e) {
        console.error("Erro download audio:", e);
        ctx.reply("Não foi possível processar o áudio. Tente novamente.");
    }
});

// Inicia o Bot
bot.launch().then(() => {
    console.log('🚀 Telegram Bot Iniciado com Sucesso!');
}).catch((err) => {
    console.error('❌ Falha ao iniciar Telegram Bot:', err);
});

// Graceful Stop
const stopBot = (reason: string) => {
    console.log(`🛑 Parando bot: ${reason}`);
    bot.stop(reason);
};

(process as any).once('SIGINT', () => stopBot('SIGINT'));
(process as any).once('SIGTERM', () => stopBot('SIGTERM'));
