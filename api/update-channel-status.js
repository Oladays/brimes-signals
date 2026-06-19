export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const FIREBASE_URL = process.env.FIREBASE_DB_URL;

  try {
    const { key, status } = req.body;

    if (!key || !status) {
      return res.status(400).json({ error: 'Missing key or status' });
    }

    const fbRes = await fetch(`${FIREBASE_URL}/channelRequests/${key}/status.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(status)
    });

    if (!fbRes.ok) throw new Error('Failed to update status');

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
