export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { toEmail, toName, channelName, status, reason } = req.body;

    if (!toEmail || !channelName || !status) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const isApproved = status === 'approved';

    const message = isApproved
      ? 'Payment confirmed. Your channel is now connected and will receive every signal automatically from now on.'
      : `Your request could not be approved.${reason ? ` Reason: ${reason}` : ' Please contact support for more details.'}`;

    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_8ikpr8l',
        template_id: 'template_3yqwopa',
        user_id: '4oqi_eixXSDZqwnqq',
        accessToken: 'aGkjqnkIx2HmerqJWBUES',
        template_params: {
          to_email: toEmail,
          name: toName || 'there',
          channel_name: channelName,
          status: isApproved ? 'APPROVED ✅' : 'REJECTED ❌',
          message: message
        }
      })
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      throw new Error('EmailJS error: ' + errText);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
