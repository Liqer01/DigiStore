// api/auth-github.js - Vercel Serverless Function for GitHub OAuth
const https = require('https');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';

function getRedirectUri(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || (host && host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}/api/auth-github`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const redirectUri = getRedirectUri(req);
  const code = req.query ? req.query.code : null;
  const error = req.query ? req.query.error : null;

  if (error) {
    return renderResultHtml(res, { success: false, error: req.query.error_description || error });
  }

  // If credentials are not configured yet, show the guided setup screen
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return renderSetupGuideHtml(res, redirectUri);
  }

  // If no code, start authorization flow
  if (!code) {
    const scope = encodeURIComponent('read:user user:email');
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
    res.writeHead(302, { Location: authUrl });
    return res.end();
  }

  try {
    const tokenRes = await postGithubToken(code, redirectUri);
    if (!tokenRes.access_token) {
      throw new Error(tokenRes.error_description || tokenRes.error || 'GitHub eri?im anahtar? al?namad?');
    }

    const ghUser = await getGithubUser(tokenRes.access_token);
    if (!ghUser || !ghUser.id) {
      throw new Error('GitHub profil bilgisi al?namad?');
    }

    let email = ghUser.email;
    if (!email) {
      try {
        const emails = await getGithubEmails(tokenRes.access_token);
        if (Array.isArray(emails)) {
          const primary = emails.find(e => e.primary && e.verified) || emails[0];
          if (primary && primary.email) email = primary.email;
        }
      } catch (e) {}
    }

    const userPayload = {
      id: 'gh_' + ghUser.id,
      githubId: String(ghUser.id),
      username: ghUser.login,
      name: ghUser.name || ghUser.login,
      email: email || `${ghUser.login}@users.noreply.github.com`,
      avatar: ghUser.avatar_url,
      provider: 'github',
      role: 'GitHub Onayli'
    };

    return renderResultHtml(res, { success: true, user: userPayload });
  } catch (err) {
    console.error('GitHub Auth Error:', err);
    return renderResultHtml(res, { success: false, error: err.message });
  }
};

function postGithubToken(code, redirectUri) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: code,
      redirect_uri: redirectUri
    });

    const options = {
      hostname: 'github.com',
      port: 443,
      path: '/login/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
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
          reject(new Error('GitHub yan?t? okunamad?: ' + body));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getGithubUser(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: '/user',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'DigiStore-App',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('GitHub kullan?c? profili okunamad?'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function getGithubEmails(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: '/user/emails',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'DigiStore-App',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve([]);
        }
      });
    });

    req.on('error', () => resolve([]));
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
  <title>${success ? 'GitHub Giri?i Ba?ar?l?' : 'GitHub Giri? Hatas?'}</title>
  <style>
    body { background: #0d1117; color: #f0f6fc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
    .card { background: rgba(22,27,34,0.8); border: 1px solid #30363d; border-radius: 24px; padding: 36px 28px; max-width: 420px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.6); backdrop-filter: blur(20px); }
    .spinner { width: 36px; height: 36px; border: 3px solid rgba(240,246,252,0.15); border-top-color: #f0f6fc; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 18px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 19px; margin: 0 0 8px; font-weight: 700; color: #fff; }
    p { font-size: 13px; color: #8b949e; margin: 0 0 16px; }
    .error-box { background: rgba(248,81,73,0.1); border: 1px solid rgba(248,81,73,0.3); color: #f85149; padding: 12px; border-radius: 12px; font-size: 12px; margin-bottom: 20px; word-break: break-word; }
    .btn { display: inline-block; background: #238636; color: #fff; padding: 10px 22px; border-radius: 9999px; text-decoration: none; font-size: 13px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    ${success ? `
      <div class="spinner"></div>
      <h2>GitHub ile Giri? Yap?ld?</h2>
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
          provider: 'github',
          user: payload.user,
          ts: Date.now()
        }));
      } catch (e) {}

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
          type: 'DIGISTORE_OAUTH_SUCCESS',
          provider: 'github',
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

function renderSetupGuideHtml(res, redirectUri) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>GitHub OAuth Kurulumu</title>
  <style>
    body { background: #0d1117; color: #f0f6fc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; box-sizing: border-box; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 20px; padding: 32px; max-width: 520px; width: 100%; box-shadow: 0 25px 60px rgba(0,0,0,0.6); }
    h2 { font-size: 20px; margin: 0 0 12px; color: #ffffff; display: flex; align-items: center; gap: 10px; }
    p { font-size: 13.5px; color: #8b949e; line-height: 1.6; margin: 0 0 18px; }
    ol { margin: 0 0 22px; padding-left: 20px; font-size: 13px; color: #c9d1d9; line-height: 1.7; }
    li { margin-bottom: 8px; }
    code { background: rgba(110,118,129,0.2); padding: 2px 6px; border-radius: 6px; color: #58a6ff; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn-primary { background: #238636; color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(240,246,252,0.1); }
    .btn-primary:hover { background: #2ea043; }
    .btn-secondary { background: #21262d; color: #c9d1d9; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; border: 1px solid #30363d; }
  </style>
</head>
<body>
  <div class="card">
    <h2>
      <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
      GitHub OAuth Yap?land?rmas?
    </h2>
    <p>GitHub ile giri? yapabilmek i?in 1 dakikada bir GitHub OAuth App olu?turup Vercel ?evre de?i?kenlerine ekleyebilirsiniz:</p>
    <ol>
      <li><a href="https://github.com/settings/developers" target="_blank" style="color:#58a6ff;text-decoration:underline;">GitHub Developer Settings</a> sayfas?na gidin ve <b>New OAuth App</b> butonuna t?klay?n.</li>
      <li><b>Application name:</b> <code>Closy Store</code></li>
      <li><b>Homepage URL:</b> <code>https://closydev.site</code></li>
      <li><b>Authorization callback URL:</b> <code>${redirectUri}</code></li>
      <li>Olu?turulan <b>Client ID</b> ve <b>Client Secret</b> kodlar?n? Vercel projenizin <i>Settings &gt; Environment Variables</i> k?sm?na <code>GITHUB_CLIENT_ID</code> ve <code>GITHUB_CLIENT_SECRET</code> ad?yla ekleyin.</li>
    </ol>
    <div class="actions">
      <a href="https://github.com/settings/applications/new" target="_blank" class="btn-primary">OAuth Uygulamas? Olu?tur</a>
      <a href="/index.html" class="btn-secondary">Ma?azaya D?n</a>
    </div>
  </div>
</body>
</html>`;
  res.end(html);
}
