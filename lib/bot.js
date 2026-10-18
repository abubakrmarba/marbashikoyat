const { Telegraf, Markup } = require('telegraf');

const { BOT_TOKEN, WEBAPP_URL } = process.env;

const bot = new Telegraf(BOT_TOKEN);

// Muhim: Mini App inline tugma yoki menyu tugmasi orqali ochilishi kerak.
// Pastki (reply) klaviatura tugmasidan ochilganda Telegram initData bermaydi.
const openButton = Markup.inlineKeyboard([
  [Markup.button.webApp('📝 Murojaat yuborish', WEBAPP_URL)],
]);

const WELCOME =
  '<b>Xodimlar murojaati xizmati</b>\n\n' +
  'Bu yerda ish jarayoni, sharoit yoki jamoa bo\'yicha shikoyat va takliflaringizni ' +
  'bevosita rahbariyatga yetkazishingiz mumkin.\n\n' +
  '🔒 <b>Maxfiylik kafolatlanadi</b>\n' +
  'Standart holatda murojaat <b>anonim</b> yuboriladi — ismingiz, username yoki ' +
  'Telegram ID\'ingiz hech qayerga uzatilmaydi va saqlanmaydi. Xohlasangiz, ' +
  'ismingizni o\'zingiz qo\'shishingiz mumkin.\n\n' +
  'Boshlash uchun quyidagi tugmani bosing.';

bot.start(async (ctx) => {
  // Eski pastki klaviaturani olib tashlaymiz
  await ctx.reply('…', Markup.removeKeyboard()).then((m) =>
    ctx.deleteMessage(m.message_id).catch(() => {})
  ).catch(() => {});

  // Chat pastidagi "Menu" tugmasini Mini App'ga ulaymiz
  await ctx
    .setChatMenuButton({
      type: 'web_app',
      text: 'Murojaat',
      web_app: { url: WEBAPP_URL },
    })
    .catch(() => {});

  return ctx.reply(WELCOME, { parse_mode: 'HTML', ...openButton });
});

bot.on('message', (ctx) =>
  ctx.reply('Murojaat yuborish uchun quyidagi tugmani bosing.', openButton)
);

module.exports = bot;