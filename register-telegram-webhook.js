const fs = require('fs');
const path = require('path');

// 1. Load .env.local variables manually
const envPath = path.join(__dirname, '.env.local');
let token = process.env.TELEGRAM_BOT_TOKEN;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^TELEGRAM_BOT_TOKEN\s*=\s*(.*)$/m);
  if (match && match[1]) {
    token = match[1].trim();
  }
}

if (!token) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Erro: TELEGRAM_BOT_TOKEN não foi encontrado no arquivo .env.local ou nas variáveis de ambiente!');
  process.exit(1);
}

// 2. Read argument
let webhookUrl = process.argv[2];

if (!webhookUrl) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Erro: Você deve passar a URL do Webhook como argumento!');
  console.log('Exemplo:\n  node register-telegram-webhook.js https://sua-url-ngrok.ngrok-free.app/api/telegram\n');
  process.exit(1);
}

// Ensure the endpoint is correct. If the user passed ".../api/telegram-webhook", correct it or keep it as is but warn.
if (webhookUrl.endsWith('/api/telegram-webhook')) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  Aviso: O endpoint padrão do Next.js neste projeto é /api/telegram.');
  console.log('Ajustando automaticamente para: ' + webhookUrl.replace('/api/telegram-webhook', '/api/telegram') + '\n');
  webhookUrl = webhookUrl.replace('/api/telegram-webhook', '/api/telegram');
} else if (!webhookUrl.endsWith('/api/telegram')) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  Aviso: Certifique-se de que a URL termina com /api/telegram para Next.js.');
}

console.log('🤖 Registrando Webhook no Telegram...');
console.log('🔗 URL:', webhookUrl);

fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`)
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      console.log('\n\x1b[32m%s\x1b[0m', '✅ Webhook registrado com sucesso no Telegram!');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('\n\x1b[31m%s\x1b[0m', '❌ Falha ao registrar Webhook:');
      console.error(JSON.stringify(data, null, 2));
    }
  })
  .catch(err => {
    console.error('\n\x1b[31m%s\x1b[0m', '❌ Erro de conexão com a API do Telegram:', err.message);
  });
