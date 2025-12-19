cat <<EOF > index.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require('firebase-admin');
require('dotenv').config();

// Inicialização do Cliente WhatsApp Otimizada para Termux
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/data/data/com.termux/files/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process']
    }
});

client.on('qr', (qr) => {
    console.log('--- ESCANEIE O QR CODE ABAIXO ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Finance Other Eyes: Conectado!');
});

client.on('message', async (msg) => {
    if (msg.body.toLowerCase() === 'ping') {
        msg.reply('pong');
    }
});

client.initialize();
EOF
