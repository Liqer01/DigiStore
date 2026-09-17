// DigiGuard Enterprise Security Suite v4.5
// Endüstri Standardı DDoS, WAF, SQLi, XSS, Bot & Brute-Force Koruma Kalkanı

const rateLimit = require('express-rate-limit');

// ── IP BLACKLIST & TEHDİT TAKİBİ ─────────────────────────────────────
const blacklistedIPs = new Map(); // ip -> unbanTime
const threatScores = new Map();   // ip -> score

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.socket.remoteAddress ||
         req.ip ||
         '127.0.0.1';
}

function banIP(ip, durationMinutes = 60, reason = 'Kural ihlali') {
  const unbanTime = Date.now() + durationMinutes * 60 * 1000;
  blacklistedIPs.set(ip, { unbanTime, reason });
  console.warn(`[DigiGuard BAN] IP ${ip} engellendi (${durationMinutes} dk). Neden: ${reason}`);
}

function isBanned(ip) {
  const banInfo = blacklistedIPs.get(ip);
  if (!banInfo) return false;
  if (Date.now() > banInfo.unbanTime) {
    blacklistedIPs.delete(ip);
    threatScores.delete(ip);
    return false;
  }
  return true;
}

// ── 1. IP BLACKLIST CHECK MIDDLEWARE ─────────────────────────────────
function ipBlacklistMiddleware(req, res, next) {
  const ip = getClientIP(req);
  if (isBanned(ip)) {
    const info = blacklistedIPs.get(ip);
    return res.status(403).json({
      error: 'Erişiminiz DigiGuard WAF tarafından güvenlik nedeniyle geçici olarak durduruldu.',
      code: 'IP_BLOCKED_BY_GUARD',
      reason: info?.reason || 'Şüpheli aktivite'
    });
  }
  next();
}

// ── 2. KÖTÜ NİYETLİ BOT VE TARAYICI ENGELLEYİCİ ──────────────────────
const BAD_BOT_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /acunetix/i,
  /nmap/i,
  /masscan/i,
  /dirbuster/i,
  /gobuster/i,
  /wpscan/i,
  /zgrab/i,
  /censys/i,
  /hydra/i,
  /medusa/i,
  /burpsuite/i,
  /havij/i,
  /netsparker/i
];

function badBotShield(req, res, next) {
  const userAgent = req.headers['user-agent'] || '';
  for (const pattern of BAD_BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      const ip = getClientIP(req);
      banIP(ip, 120, `Güvenlik tarayıcısı tespit edildi: ${userAgent}`);
      return res.status(403).json({ error: 'Güvenlik ihlali: Tanınmayan tarayıcı aracı engellendi.' });
    }
  }
  next();
}

// ── 3. DERİN WAF FİLTRESİ (SQLi, XSS, RCE, Path Traversal) ───────────
const ATTACK_SIGNATURES = [
  // SQL Injection
  /(\b(union(\s+all)?\s+select|select\s+.*from|drop\s+table|delete\s+from|insert\s+into)\b)/i,
  /(\bexec(\s|\+)+(s|x)p\w+)/i,
  /(\bbenchmark\s*\(\s*\d+|sleep\s*\(\s*\d+)/i,
  /(--\s+|;\s*--|\/\*[\s\S]*?\*\/)/i,
  /('|\")\s*(or|and)\s*('|\")?\d+('|\")?\s*=\s*('|\")?\d+/i,
  /('|\")\s*(or|and)\s+true/i,

  // XSS & Script Injection
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /<iframe/i,
  /<svg\/onload/i,
  /eval\s*\(/i,
  /document\.cookie/i,

  // Path Traversal / LFI
  /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\/|\/etc\/passwd|\/etc\/shadow|c:\\windows)/i,

  // Remote Command Execution
  /(\b(cmd\.exe|powershell|bash|nc\s+-e|\/bin\/sh)\b)/i
];

function testPayload(value, key = '') {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') {
    for (const k of Object.keys(value)) {
      const hit = testPayload(value[k], k);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof value === 'string') {
    for (const sig of ATTACK_SIGNATURES) {
      if (sig.test(value)) {
        return { signature: sig.toString(), field: key, value: value.slice(0, 100) };
      }
    }
  }
  return null;
}

function deepWafFilter(req, res, next) {
  const ip = getClientIP(req);

  // URL ve Query kontrolü
  const queryHit = testPayload(req.query);
  if (queryHit) {
    trackThreat(ip, 2, 'Query SQLi/XSS');
    return res.status(403).json({ error: 'DigiGuard WAF: İstek parametrelerinde zararlı kod tespit edildi.' });
  }

  // URL pathname kontrolü
  const pathHit = testPayload(req.originalUrl);
  if (pathHit) {
    trackThreat(ip, 2, 'Path Traversal/Exploit');
    return res.status(403).json({ error: 'DigiGuard WAF: Şüpheli adres engellendi.' });
  }

  // Body kontrolü (POST / PUT / PATCH)
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyToTest = { ...req.body };
    if (req.originalUrl && req.originalUrl.includes('/api/send-email')) {
      delete bodyToTest.html;
    }
    const bodyHit = testPayload(bodyToTest);
    if (bodyHit) {
      trackThreat(ip, 3, `Body Injection [${bodyHit.field}]`);
      return res.status(403).json({ error: 'DigiGuard WAF: Gönderilen veride zararlı karakterler tespit edildi.' });
    }
  }

  next();
}

function trackThreat(ip, score = 1, reason = '') {
  const current = (threatScores.get(ip) || 0) + score;
  threatScores.set(ip, current);
  console.warn(`[DigiGuard ALERT] IP: ${ip} | Tehdit Puanı: ${current}/5 | Sebep: ${reason}`);
  if (current >= 5) {
    banIP(ip, 180, `Eşik aşıldı: ${reason}`);
  }
}

// ── 4. HONEYPOT TRAP (Saldırganları Anında Tuzağa Düşür) ─────────────
const HONEYPOT_PATHS = [
  '/wp-admin',
  '/wp-login.php',
  '/.env',
  '/.git',
  '/.git/config',
  '/phpmyadmin',
  '/pma',
  '/admin.php',
  '/config.json',
  '/server-status',
  '/actuator/health',
  '/xmlrpc.php'
];

function honeypotTrap(req, res, next) {
  const normalized = req.path.toLowerCase();
  if (HONEYPOT_PATHS.some(hp => normalized.startsWith(hp))) {
    const ip = getClientIP(req);
    banIP(ip, 360, `Honeypot tuzağına düştü (${req.path})`);
    return res.status(404).json({ error: 'Bulunamadı' });
  }
  next();
}

// ── 5. DDOS & FLOOD PROTECTION RATE LIMITERS ─────────────────────────
// Global API Limiter: Her IP dakikada maksimum 120 istek yapabilir
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIP(req),
  message: {
    error: 'DigiGuard DDoS Koruması: Çok fazla istek gönderildi. Lütfen 1 dakika sonra tekrar deneyin.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Auth Brute-Force Limiter: 15 dakikada en fazla 6 giriş/kayıt denemesi
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIP(req),
  message: {
    error: 'DigiGuard: Çok fazla başarısız giriş denemesi. Güvenliğiniz için 15 dakika kilitlendi.',
    code: 'AUTH_BRUTE_FORCE_PREVENTED'
  }
});

// Checkout/Sipariş Limiter: 15 dakikada en fazla 15 sipariş denemesi
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIP(req),
  message: {
    error: 'DigiGuard: Sipariş oluşturma limiti aşıldı.',
    code: 'ORDER_LIMIT_EXCEEDED'
  }
});

module.exports = {
  ipBlacklistMiddleware,
  badBotShield,
  deepWafFilter,
  honeypotTrap,
  globalLimiter,
  authLimiter,
  orderLimiter,
  getClientIP,
  banIP
};
