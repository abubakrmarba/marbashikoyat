const { Telegraf, Markup } = require('telegraf');

const { BOT_TOKEN, WEBAPP_URL } = process.env;

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) =>
  ctx.reply(
    'Assalomu alaykum! 👋\n\n' +
      'Bu bot orqali rahbariyatga shikoyat yoki taklif yuborishingiz mumkin.\n\n' +
      '🔒 Shaxsingiz to\'liq anonim qoladi: ismingiz, username yoki ID raqamingiz ' +
      'hech qayerga yuborilmaydi va saqlanmaydi.\n\n' +
      'Pastdagi tugmani bosing 👇',
    Markup.keyboard([[Markup.button.webApp('✍️ Shikoyat yozish', WEBAPP_URL)]]).resize()
  )
);

bot.on('message', (ctx) =>
  ctx.reply('Shikoyat yozish uchun "✍️ Shikoyat yozish" tugmasini bosing.')
);

module.exports = bot;
