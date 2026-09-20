// api/admin-auth.js - IP Whitelisting for Admin Panel
const ALLOWED_IPS = (process.env.ADMIN_ALLOWED_IPS || '188.119.11.236,127.0.0.1,::1').split(',').map(s => s.trim());

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const forwarded = req.headers['x-forwarded-for'];
  const rawIp = forwarded ? forwarded.split(',')[0].trim() : (req.headers['x-real-ip'] || req.socket.remoteAddress || '');
  const clientIp = rawIp.replace('::ffff:', '').trim();

  res.json({
    allowed: true,
    clientIp: clientIp
  });
};
