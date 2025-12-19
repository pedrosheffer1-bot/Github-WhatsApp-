
module.exports = {
  apps: [{
    name: "finance-pro-bot",
    script: "./node_modules/.bin/ts-node",
    args: "whatsapp-bot.ts",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
