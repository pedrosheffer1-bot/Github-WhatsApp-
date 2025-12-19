const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // Isso vai usar o caminho automático que configuramos no Termux
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/data/data/com.termux/files/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-extensions',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Importante para o Termux
            '--disable-gpu'
        ],
        headless: true // Garanta que está como true
    }
});
