const crypto = require('crypto');
const { waitUntil } = require('@vercel/functions');
const bot = require('../lib/bot');

const { BOT_TOKEN, ADMIN_CHAT_ID } = process.env;

// ---------- initData tekshiruvi (so'rov haqiqatan Telegram'dan kelganini tasdiqlaydi) ----------
function verifyInitData(initData) {
  if (!initData) return false;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return false;
  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const calc = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  if (calc.length !== hash.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash))) return false;
  const authDate = Number(params.get('auth_date') || 0);
  return Date.now() / 1000 - authDate < 86400; // 24 soatdan eski bo'lsa rad
}

// ---------- Spamdan himoya (faqat xotirada, hech qayerga saqlanmaydi) ----------
// ID tasodifiy tuz bilan xeshlanadi; tuz har yangi instansiyada yangilanadi.
const SALT = crypto.randomBytes(32);
const lastSent = new Map();
const COOLDOWN_MS = 0;

function rateKey(initData) {
  try {
    const user = JSON.parse(new URLSearchParams(initData).get('user') || '{}');
    return crypto.createHmac('sha256', SALT).update(String(user.id)).digest('hex');
  } catch {
    return null;
  }
}

const CATEGORIES = {
  salary: '💰 Ish haqi',
  management: '👔 Rahbariyat',
  conditions: '🏭 Ish sharoiti',
  colleagues: '👥 Hamkasblar',
  safety: '⚠️ Xavfsizlik',
  suggestion: '💡 Taklif',
  other: '📌 Boshqa',
};

const escapeHtml = (s) =>
  String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const { initData, category, branch, text } = req.body || {};

  if (!verifyInitData(initData)) {
    return res.status(401).json({ ok: false, error: 'Iltimos, ilovani bot orqali oching.' });
  }
  const body = String(text || '').trim();
  if (body.length < 10) {
    return res.status(400).json({ ok: false, error: 'Shikoyat kamida 10 ta belgidan iborat bo\'lsin.' });
  }
  if (body.length > 3000) {
    return res.status(400).json({ ok: false, error: 'Matn juda uzun (maks. 3000 belgi).' });
  }

  const key = rateKey(initData);
  const now = Date.now();
  for (const [k, t] of lastSent) if (now - t > COOLDOWN_MS) lastSent.delete(k);
  if (key && lastSent.has(key)) {
    return res.status(429).json({ ok: false, error: 'Iltimos, keyingi shikoyatni biroz keyinroq yuboring.' });
  }
  if (key) lastSent.set(key, now);

  const ticket = crypto.randomBytes(3).toString('hex').toUpperCase();
  const msg =
    `📩 <b>Yangi anonim shikoyat</b> #${ticket}\n\n` +
    `<b>Turkum:</b> ${CATEGORIES[category] || CATEGORIES.other}\n` +
    (branch ? `<b>Bo'lim/filial:</b> ${escapeHtml(String(branch).slice(0, 100))}\n` : '') +
    `\n${escapeHtml(body)}`;

  // Xodimga darhol javob beramiz, xabarni esa 0–20 soniya tasodifiy kechikish bilan
  // yuboramiz (yuborilgan vaqtga qarab kimligini taxmin qilishni qiyinlashtiradi).
  waitUntil(
    (async () => {
      await sleep(Math.floor(Math.random() * 20_000));
      try {
        await bot.telegram.sendMessage(ADMIN_CHAT_ID, msg, { parse_mode: 'HTML' });
      } catch (e) {
        console.error('Yuborishda xato:', e.message);
      }
    })()
  );

  res.status(200).json({ ok: true, ticket });
};
