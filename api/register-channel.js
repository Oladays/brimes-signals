export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const FIREBASE_URL = process.env.FIREBASE_DB_URL;

  try {
    const { channelName, chatId, username, email, status, submittedAt } = req.body;

    if (!channelName || !chatId || !username || !email) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const safeKey = chatId.replace('-', 'neg');
    const dbPath = `${FIREBASE_URL}/channelRequests/${safeKey}.json`;

    const fbRes = await fetch(dbPath, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channelName,
        chatId,
        username,
        email,
        status: 'pending',
        submittedAt: submittedAt || new Date().toISOString()
      })
    });

    if (!fbRes.ok) {
      const errText = await fbRes.text();
      throw new Error('Firebase error: ' + errText);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
