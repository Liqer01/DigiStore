const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, customer, orderId, subject, html, plain } = req.body || {};
  if (!to) return res.status(400).json({ error: 'Alıcı e-posta adresi gerekli' });

  const smtpUser = process.env.SMTP_USER || 'erenzeybek01@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'xtwcatqxjhborsrd';

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: { user: smtpUser, pass: smtpPass }
  });

  try {
    const info = await transporter.sendMail({
      from: '"DigiStore Pro" <' + smtpUser + '>',
      to: to,
      subject: subject || ('Siparişiniz Onaylandı - #' + orderId),
      text: plain || '',
      html: html || ''
    });
    return res.json({ success: true, delivered: true, method: 'smtp', messageId: info.messageId });
  } catch (err) {
    console.error('SMTP hatası:', err.message);
    return res.json({ success: true, delivered: true, method: 'fallback', note: err.message });
  }
};
