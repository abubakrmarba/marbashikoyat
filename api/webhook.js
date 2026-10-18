const bot = require('../lib/bot');

// Telegram yangilanishlarni shu manzilga yuboradi
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(200).send('Webhook ishlayapti');

  // Faqat Telegram'dan kelgan so'rovlarni qabul qilamiz
  if (
    process.env.WEBHOOK_SECRET &&
    req.headers['x-telegram-bot-api-secret-token'] !== process.env.WEBHOOK_SECRET
  ) {
    return res.status(401).send('unauthorized');
  }

  try {
    await bot.handleUpdate(req.body);
  } catch (e) {
    console.error('Update xatosi:', e.message);
  }
  res.status(200).send('ok');
};
