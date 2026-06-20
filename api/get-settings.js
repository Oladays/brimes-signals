export default async function handler(req, res) {
  const FIREBASE_URL = process.env.FIREBASE_DB_URL;

  try {
    const fbRes = await fetch(`${FIREBASE_URL}/settings.json`);
    const data = await fbRes.json();

    return res.status(200).json(data || { price: '', wallet: '' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
