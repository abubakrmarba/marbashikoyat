const { Telegraf, Markup } = require('telegraf');

const { BOT_TOKEN, WEBAPP_URL } = process.env;

const bot = new Telegraf(BOT_TOKEN);

// Muhim: Mini App inline tugma yoki menyu tugmasi orqali ochilishi kerak.
// Pastki (reply) klaviatura tugmasidan ochilganda Telegram initData bermaydi.
const openButton = Markup.inlineKeyboard([
  [Markup.button.webApp('✍️ Shikoyat yozish', WEBAPP_URL)],
]);

bot.start(async (ctx) => {
  // Eski pastki klaviaturani olib tashlaymiz
  await ctx.reply('🔄', Markup.removeKeyboard()).then((m) =>
    ctx.deleteMessage(m.message_id).catch(() => {})
  );

  // Chat pastidagi "Menu" tugmasini ham Mini App'ga ulaymiz
  await ctx
    .setChatMenuButton({
      type: 'web_app',
      text: 'Shikoyat yozish',
      web_app: { url: WEBAPP_URL },
    })
    .catch(() => {});

  return ctx.reply(
    'Assalomu alaykum! 👋\n\n' +
      'Bu bot orqali rahbariyatga shikoyat yoki taklif yuborishingiz mumkin.\n\n' +
      '🔒 Shaxsingiz to\'liq anonim qoladi: ismingiz, username yoki ID raqamingiz ' +
      'hech qayerga yuborilmaydi va saqlanmaydi.\n\n' +
      'Pastdagi tugmani bosing 👇',
    openButton
  );
});

bot.on('message', (ctx) =>
  ctx.reply('Shikoyat yozish uchun quyidagi tugmani bosing 👇', openButton)
);

module.exports = bot;