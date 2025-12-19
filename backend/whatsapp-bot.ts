
import { Client, LocalAuth, Message as WAMessage } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { GoogleGenAI } from "@google/genai";
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

/**
 * CONFIGURAÇÃO FIREBASE
 */
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(), 
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    } catch (e) {
        console.error("Erro ao iniciar Firebase. Verifique suas credenciais.", e);
    }
}
const db = admin.firestore();

// Instância Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const SYSTEM_INSTRUCTION = `
Atue como o motor de inteligência do "Finance Other Eyes", um controlador de custos premium.
Sua principal função é converter mensagens (texto ou áudio transcrito) em dados estruturados.

DIRETRIZES:
- Tom de voz: Luxuoso, minimalista e direto.
- Idioma: Português Brasil.

REGRAS:
1. Extração de Dados OBRIGATÓRIA: Identifique [Valor], [Categoria], [Descrição] e [Tipo: receita ou despesa].
2. Formato de Saída: Inicie SEMPRE com um bloco JSON delimitado por \`\`\`json.
3. Feedback Humano: Após o JSON, envie uma confirmação elegante e motivadora com emojis premium.

EXEMPLO DE RESPOSTA:
\`\`\`json
{
  "valor": 150.00,
  "categoria": "Gastronomia",
  "descricao": "Jantar executivo",
  "tipo": "despesa",
  "timestamp": "${new Date().toISOString()}"
}
\`\`\`
✅ Finance Other Eyes: Registro de R$ 150,00 em Gastronomia efetuado. Sua gestão patrimonial permanece impecável. 🥂
`;

/**
 * CONFIGURAÇÃO ESPECÍFICA PARA TERMUX (ANDROID)
 */
const termuxChromiumPath = '/data/data/com.termux/files/usr/bin/chromium-browser';
const isTermux = fs.existsSync(termuxChromiumPath);

const client = new Client({
    puppeteer: {
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});


const logger = (msg: string) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

client.on('qr', (qr) => {
    logger('QR Code gerado. Escaneie para iniciar a sessão:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n--------------------------------------------');
    console.log('✅ Finance Other Eyes: Conectado com Sucesso!');
    if (isTermux) console.log('📱 Modo Termux Mobile Ativado');
    console.log('--------------------------------------------\n');
});

/**
 * Função central de processamento via Gemini
 */
async function processInput(message: string, isAudio = false, audioBase64?: string, mimeType?: string) {
    try {
        let contents: any;

        if (isAudio && audioBase64) {
            contents = {
                parts: [
                    { inlineData: { data: audioBase64, mimeType: mimeType || 'audio/ogg; codecs=opus' } },
                    { text: "Analise este áudio e extraia os dados financeiros conforme as instruções de sistema." }
                ]
            };
        } else {
            contents = { parts: [{ text: message }] };
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.1,
            },
        });

        const output = response.text || "";
        const jsonMatch = output.match(/```json\n([\s\S]*?)\n```/);

        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            const cleanFeedback = output.replace(jsonMatch[0], "").trim();

            await db.collection('transactions').add({
                ...data,
                source: isAudio ? 'whatsapp_audio' : 'whatsapp_text',
                processedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return cleanFeedback;
        }

        return output;
    } catch (error) {
        logger(`Erro no processamento: ${error}`);
        return "💎 Ocorreu uma interrupção em nossa rede de alta performance. Poderia repetir o registro?";
    }
}

client.on('message', async (msg: WAMessage) => {
    if (msg.fromMe) return;

    if (msg.hasMedia && (msg.type === 'audio' || msg.type === 'ptt')) {
        logger('Processando áudio recebido...');
        try {
            const media = await msg.downloadMedia();
            const feedback = await processInput("", true, media.data, media.mimetype);
            msg.reply(feedback);
        } catch (err) {
            logger('Falha ao baixar mídia.');
        }
    } 
    else if (msg.body) {
        logger(`Processando texto de ${msg.from}`);
        const feedback = await processInput(msg.body);
        msg.reply(feedback);
    }
});

client.initialize();
