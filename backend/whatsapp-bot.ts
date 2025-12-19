
import { Client, LocalAuth, Message as WAMessage } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { GoogleGenAI } from "@google/genai";
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

// --- VALIDAÇÃO INICIAL ---
if (!process.env.API_KEY) {
    console.error('❌ ERRO CRÍTICO: API_KEY não encontrada no arquivo .env');
    console.error('Crie um arquivo .env na pasta backend com: API_KEY=sua_chave_aqui');
    (process as any).exit(1);
}

// --- CONFIGURAÇÃO FIREBASE ---
// Tenta usar credencial padrão ou ignora se não tiver (modo dev sem banco)
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    }
} catch (e) {
    console.warn("⚠️ Aviso: Firebase não configurado. Os dados não serão salvos no banco, apenas respondidos no chat.");
}
const db = admin.apps.length ? admin.firestore() : null;

// --- INSTÂNCIA GEMINI ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const SYSTEM_INSTRUCTION = `
Atue como o motor de inteligência do "Finance Pro AI", um controlador de custos premium.
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
✅ Finance Pro: Registro de R$ 150,00 em Gastronomia efetuado. Sua gestão patrimonial permanece impecável. 🥂
`;

// --- CONFIGURAÇÃO DO NAVEGADOR (TERMUX/LINUX/WINDOWS) ---
const termuxChromiumPath = '/data/data/com.termux/files/usr/bin/chromium-browser';
const isTermux = fs.existsSync(termuxChromiumPath);

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        executablePath: isTermux ? termuxChromiumPath : undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // Vital para container/termux
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Reduz uso de memória
            '--disable-extensions',
            '--disable-software-rasterizer'
        ],
        headless: true, // Mude para false se quiser ver o navegador no PC (não funciona no Termux puro)
    }
});

const logger = (msg: string) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

// --- EVENTOS DO CLIENTE ---

client.on('qr', (qr) => {
    console.clear();
    console.log('\n=================================================');
    console.log('💎 FINANCE PRO AI - SISTEMA DE AUTENTICAÇÃO');
    console.log('=================================================\n');
    logger('Escaneie o QR Code abaixo para conectar:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n--------------------------------------------');
    console.log('✅ Finance Pro AI: Conectado e Operacional!');
    if (isTermux) console.log('📱 Modo Termux Mobile: Ativado e Otimizado');
    console.log('--------------------------------------------\n');
});

client.on('disconnected', (reason) => {
    logger(`Cliente desconectado: ${reason}`);
    // Opcional: client.initialize(); // Tentar reconectar
});

// --- LÓGICA DE IA ---

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

            if (db) {
                await db.collection('transactions').add({
                    ...data,
                    source: isAudio ? 'whatsapp_audio' : 'whatsapp_text',
                    processedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                logger(`[Simulação DB] Transação processada: ${data.valor} - ${data.categoria}`);
            }

            return cleanFeedback;
        }

        return output;
    } catch (error) {
        logger(`Erro no processamento AI: ${error}`);
        return "💎 Ocorreu uma interrupção momentânea. Por favor, tente registrar novamente em instantes.";
    }
}

// --- HANDLER DE MENSAGENS ---

client.on('message', async (msg: WAMessage) => {
    if (msg.fromMe) return; // Ignora mensagens enviadas por você mesmo (pode remover se quiser usar como 'anotações')

    // Delay artificial para parecer digitação humana
    await new Promise(r => setTimeout(r, 1000));

    // Áudio
    if (msg.hasMedia && (msg.type === 'audio' || msg.type === 'ptt')) {
        logger(`Recebendo áudio de ${msg.from}...`);
        try {
            const media = await msg.downloadMedia();
            const feedback = await processInput("", true, media.data, media.mimetype);
            await msg.reply(feedback);
        } catch (err) {
            logger('Falha ao processar áudio: ' + err);
            await msg.reply("Não consegui processar seu áudio desta vez.");
        }
    } 
    // Texto
    else if (msg.body) {
        logger(`Recebendo texto de ${msg.from}: "${msg.body.slice(0, 30)}..."`);
        const feedback = await processInput(msg.body);
        await msg.reply(feedback);
    }
});

// Inicialização
logger('Inicializando sistema...');
client.initialize();
