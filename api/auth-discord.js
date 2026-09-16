// api/auth-discord.js - Vercel Serverless Function for Discord OAuth2
const https = require('https');

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1545837295041511485';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'ebus7oHV0u8vM_L4BXMqjEKh6QeXrnNd';

function getRedirectUri(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || (host && host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}/api/auth-discord`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const redirectUri = getRedirectUri(req);
  const code = req.query ? req.query.code : null;
  const error = req.query ? req.query.error : null;

  if (error) {
    return renderResultHtml(res, { success: false, error: req.query.error_description || error });
  }

  // If no code, initiate OAuth redirect to Discord
  if (!code) {
    const scope = encodeURIComponent('identify email');
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
    res.writeHead(302, { Location: authUrl });
    return res.end();
  }

  try {
    const tokenRes = await postDiscordToken(code, redirectUri);
    if (!tokenRes.access_token) {
      throw new Error(tokenRes.error_description || tokenRes.error || 'Discord yetkilendirme anahtari alinamadi');
    }

    const discordUser = await getDiscordUser(tokenRes.access_token);
    if (!discordUser || !discordUser.id) {
      throw new Error('Discord profil bilgisi okunamadi');
    }

    const uid = String(discordUser.id);
    let avatarUrl = null;
    if (discordUser.avatar) {
      const ext = discordUser.avatar.startsWith('a_') ? 'gif' : 'png';
      avatarUrl = `https://cdn.discordapp.com/avatars/${uid}/${discordUser.avatar}.${ext}?size=256`;
    } else {
      try {
        const defaultIndex = (BigInt(uid) >> 22n) % 6n;
        avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
      } catch (e) {
        avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';
      }
    }

    const userPayload = {
      id: 'dc_' + uid,
      discordId: uid,
      username: discordUser.username,
      name: discordUser.global_name || discordUser.username,
      email: discordUser.email || `${discordUser.username}@discord.user`,
      avatar: avatarUrl,
      provider: 'discord',
      role: 'Discord Onayli'
    };

    return renderResultHtml(res, { success: true, user: userPayload });
  } catch (err) {
    console.error('Discord Auth Error:', err);
    return renderResultHtml(res, { success: false, error: err.message });
  }
};

function postDiscordToken(code, redirectUri) {
  return new Promise((resolve, reject) => {
    const data = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri
    }).toString();

    const options = {
      hostname: 'discord.com',
      port: 443,
      path: '/api/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'DigiStore-App'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Discord yaniti JSON olarak okunamadi: ' + body));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getDiscordUser(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'discord.com',
      port: 443,
      path: '/api/users/@me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'DigiStore-App'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Discord kullanici yaniti parse edilemedi'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function renderResultHtml(res, opts) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const safeData = JSON.stringify(opts);
  const success = opts.success;
  const errorMsg = opts.error || 'Bilinmeyen bir hata olu?tu';
  
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>${success ? 'Discord Giri?i Ba?ar?l?' : 'Discord Giri? Hatas?'}</title>
  <style>
    body { background: #0b0d14; color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 36px 28px; max-width: 420px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(20px); }
    .spinner { width: 36px; height: 36px; border: 3px solid rgba(88,101,242,0.2); border-top-color: #5865F2; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 18px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 19px; margin: 0 0 8px; font-weight: 700; color: #fff; }
    p { font-size: 13px; color: #86868b; margin: 0 0 16px; }
    .error-box { background: rgba(255,69,58,0.1); border: 1px solid rgba(255,69,58,0.25); color: #ff453a; padding: 12px; border-radius: 12px; font-size: 12px; margin-bottom: 20px; word-break: break-word; }
    .btn { display: inline-block; background: #5865F2; color: #fff; padding: 10px 22px; border-radius: 9999px; text-decoration: none; font-size: 13px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    ${success ? `
      <div class="spinner"></div>
      <h2>Discord ile Giri? Yap?ld?</h2>
      <p>Oturumunuz a??l?yor, l?tfen bekleyin...</p>
    ` : `
      <h2>Giri? Tamamlanamad?</h2>
      <div class="error-box">${errorMsg}</div>
      <a href="/index.html" class="btn">Ma?azaya D?n</a>
    `}
  </div>
  <script>
    const payload = ${safeData};
    if (payload.success && payload.user) {
      try {
        localStorage.setItem('digistore_oauth_user', JSON.stringify({
          provider: 'discord',
          user: payload.user,
          ts: Date.now()
        }));
      } catch (e) {}

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
          type: 'DIGISTORE_OAUTH_SUCCESS',
          provider: 'discord',
          user: payload.user
        }, '*');
        setTimeout(() => window.close(), 500);
      } else {
        setTimeout(() => { window.location.href = '/hesabim.html'; }, 700);
      }
    }
  </script>
</body>
</html>`;
  res.end(html);
}
