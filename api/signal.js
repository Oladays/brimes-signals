export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const MAIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  const FIREBASE_URL = process.env.FIREBASE_DB_URL;

  try {
    const { subject, plain } = req.body;

    const formatToWAT = (text) => {
      return text.replace(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g,
        (match) => {
          const date = new Date(match);
          const wat = new Date(date.getTime() + 60 * 60 * 1000);
          const end = new Date(wat.getTime() + 5 * 60 * 1000);
          const fmt = (d) =>
            `${d.getUTCHours().toString().padStart(2,'0')}:${d.getUTCMinutes().toString().padStart(2,'0')}`;
          return `${fmt(wat)} – ${fmt(end)} WAT`;
        }
      );
    };

    const cleanBody = formatToWAT(plain?.trim() || 'Check the chart.');
    const message = `📊 *BRIMES Trading Signal*\n\n${cleanBody}`;

    const chatIds = [MAIN_CHAT_ID];

    try {
      const fbRes = await fetch(`${FIREBASE_URL}/channelRequests.json`);
      const data = await fbRes.json();
      if (data) {
        Object.values(data).forEach(ch => {
          if (ch.status === 'approved' && ch.chatId) {
            chatIds.push(ch.chatId);
          }
        });
      }
    } catch (fbErr) {
      console.error('Firebase fetch failed, sending to main channel only:', fbErr);
    }

    const results = await Promise.allSettled(
      chatIds.map(chatId =>
        fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
          })
        })
      )
    );

    const failed = results.filter(r => r.status === 'rejected').length;

    return res.status(200).json({
      success: true,
      sentTo: chatIds.length,
      failed
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
