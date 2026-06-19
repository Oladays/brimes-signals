export default async function handler(req, res) {
  const FIREBASE_URL = process.env.FIREBASE_DB_URL;

  try {
    const fbRes = await fetch(`${FIREBASE_URL}/channelRequests.json`);
    const data = await fbRes.json();

    if (!data) return res.status(200).json({ channels: [] });

    const channels = Object.entries(data).map(([key, val]) => ({
      key,
      ...val
    })).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    return res.status(200).json({ channels });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
