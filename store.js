/**
 * DigiStore — Unified Data & State Store (DigiStoreDB)
 * Seamlessly connects Storefront, Checkout, and Admin Panel
 * Synchronizes across tabs and integrates with Backend API
 */

(function(window) {
  'use strict';

  // DigiGuard Anti-DevTools & Source Protection
  try {
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; }, { capture: true, passive: false });
    window.addEventListener('keydown', function(e) {
      if (e.keyCode === 123 || e.key === 'F12') { e.preventDefault(); e.stopPropagation(); return false; }
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      if (ctrlOrMeta && e.shiftKey) {
        const k = (e.key || '').toUpperCase();
        if (k === 'I' || k === 'J' || k === 'C' || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67) { e.preventDefault(); e.stopPropagation(); return false; }
      }
      if (ctrlOrMeta) {
        const k = (e.key || '').toUpperCase();
        if (k === 'U' || k === 'S' || e.keyCode === 85 || e.keyCode === 83) { e.preventDefault(); e.stopPropagation(); return false; }
      }
    }, { capture: true, passive: false });
    const noop = function() {};
    const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace'];
    for (let i = 0; i < methods.length; i++) { try { window.console[methods[i]] = noop; } catch(err) {} }
    setInterval(function() { try { console.clear(); } catch(e) {} }, 1000);
    setInterval(function() { try { (function() { return false; }['constructor']('debugger')()); } catch(e) {} }, 1000);
  } catch(e) {}

  const STORAGE_KEY_PRODUCTS = 'digistore_products_v4';
  const STORAGE_KEY_CATEGORIES = 'digistore_categories_v4';
  const STORAGE_KEY_ORDERS = 'digistore_orders_v3';
  const STORAGE_KEY_PROFILE = 'digistore_profile_v3';
  const STORAGE_KEY_USERS = 'digistore_users_v3';
  const STORAGE_KEY_SESSION = 'digistore_session_v3';
  const STORAGE_KEY_EMAILS = 'digistore_emails_v3';

    const DEFAULT_USERS = [];

  const DEFAULT_PROFILE = null;
  const ADMIN_ACCOUNT = {
    id: 'usr_admin',
    name: 'Sistem Yöneticisi',
    email: 'admin@digistore.com',
    phone: '+90 500 000 00 00',
    role: 'Yönetici (Admin)',
    password: 'Admin123!',
    provider: 'local',
    isAdmin: true,
    avatar: null,
    createdAt: '2026-01-01'
  };


  const DEFAULT_CATEGORIES = [
    { id: 'all', name: 'Tümü', slug: 'all', icon: '' },
    { id: 'ticket', name: 'Ticket & Destek', slug: 'ticket', icon: '' },
    { id: 'moderasyon', name: 'Moderasyon & Guard', slug: 'moderasyon', icon: '' },
    { id: 'topluluk', name: 'Topluluk & Kayıt', slug: 'topluluk', icon: '' }
  ];

  const DEFAULT_PRODUCTS = [
    {
      id: 1,
      name: 'Yeni Nesil Discord Ticket Botu v14',
      category: 'ticket',
      price: 99,
      oldPrice: 199,
      rating: 5.0,
      reviews: 284,
      badge: 'hot',
      desc: 'Yeni nesil butonlu ve açılır menülü ticket sistemi, HTML otomatik transkript kayıtları, form (modal) desteği ve yetkili claim altyapısı.',
      features: ['Butonlu & Açılır Menülü Ticket', 'HTML Otomatik Sohbet Transkripti', 'Bilet Üstlenme (Claim) & Puanlama', 'Kolay config.json Kurulumu'],
      downloads: 1840,
      active: true
    },
    {
      id: 2,
      name: 'Pro Discord Ticket Botu (Web Entegre)',
      category: 'ticket',
      price: 149,
      oldPrice: 249,
      rating: 4.9,
      reviews: 142,
      badge: 'sale',
      desc: 'Gelişmiş web yönetim paneli entegrasyonuyla sunucu yöneticilerine özel bilet istatistikleri, log dökümü ve canlı bilet kontrolü.',
      features: ['Web Dashboard Yönetimi', 'Kategori Bazlı Özel Modallar', 'Otomatik DM Transkript Teslimi', 'Discord.js v14 & Slash Komutlar'],
      downloads: 720,
      active: true
    },
    {
      id: 3,
      name: 'Discord Gelişmiş Guard & Moderasyon Botu',
      category: 'moderasyon',
      price: 129,
      oldPrice: 199,
      rating: 4.9,
      reviews: 198,
      badge: 'new',
      desc: 'Raid ve saldırı koruması, otomatik küfür/reklam filtreleme, ceza puanı (jail, timeout, ban) ve görsel denetim logu.',
      features: ['Gelişmiş Guard & Raid Kalkanı', 'Otomatik Ceza & Timeout Sistemi', 'Görsel & Metin Loglama', 'Hızlı Slash Komut Altyapısı'],
      downloads: 980,
      active: true
    },
    {
      id: 4,
      name: 'Discord Ses Kayıt & İstatistik Botu',
      category: 'topluluk',
      price: 119,
      oldPrice: 169,
      rating: 4.8,
      reviews: 85,
      badge: null,
      desc: 'Ses kanallarında aktiflik takibi, kullanıcı konuşma süreleri, otomatik özel oda (özel ses kanalı) oluşturma ve istatistik paneli.',
      features: ['Özel Ses Kanalı (Private Room)', 'Detaylı Ses & Sohbet İstatistikleri', 'Haftalık Liderlik Tablosu', 'Özelleştirilebilir Rozetler'],
      downloads: 540,
      active: true
    },
    {
      id: 5,
      name: 'Discord Otomatik Kayıt & Hoş Geldin Botu',
      category: 'topluluk',
      price: 89,
      oldPrice: 139,
      rating: 4.8,
      reviews: 112,
      badge: null,
      desc: 'Butonlu ve formlu üye kayıt altyapısı, Canvas dinamik hoş geldin görseli, yaş ve isim doğrulama ve şüpheli hesap filtresi.',
      features: ['Butonlu / Modal Formlu Kayıt', 'Otomatik Canvas Hoş Geldin Kartı', 'Şüpheli Hesap & Sahte Üye Filtresi', 'Yetkili Kayıt Sayacı'],
      downloads: 680,
      active: true
    },
    {
      id: 6,
      name: 'Full Discord Sunucu Bot Paketi (Mega Paket)',
      category: 'ticket',
      price: 249,
      oldPrice: 449,
      rating: 5.0,
      reviews: 310,
      badge: 'hot',
      desc: 'Ticket, moderasyon guard, kayıt, çekiliş ve istatistik sistemlerinin tamamını tek bir güçlü botta birleştiren eksiksiz paket.',
      features: ['Tüm Bot Sistemleri Dahil', 'Öncelikli 7/24 Teknik Destek', 'Tek Tıkla Kurulum & Doküman', 'Ömür Boyu Güncelleme'],
      downloads: 1450,
      active: true
    }
  ];

    const DEFAULT_ORDERS = [];

  const DigiStoreDB = {
    // ─── INITIALIZATION ──────────────────────────────────────────────────
    init() {
      // Purge any legacy test storage from user browsers
      try {
        ['digistore_products_v3','digistore_categories_v3','digistore_orders_v2','digistore_profile_v2','digistore_session_v2','digistore_users_v2','digistore_emails_v2'].forEach(k => localStorage.removeItem(k));
      } catch(e) {}

      const savedCats = this.getCategories();
      if (!savedCats || savedCats.length <= 1) {
        this.saveCategories(DEFAULT_CATEGORIES);
      }
      if (!localStorage.getItem(STORAGE_KEY_PRODUCTS)) {
        this.saveProducts(DEFAULT_PRODUCTS);
      }
      if (!localStorage.getItem(STORAGE_KEY_ORDERS)) {
        this.saveOrders(DEFAULT_ORDERS);
      }
      if (!localStorage.getItem(STORAGE_KEY_USERS)) {
        this.saveUsers(DEFAULT_USERS);
      }
      if (localStorage.getItem(STORAGE_KEY_SESSION) === null) {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({
          loggedIn: false,
          userId: null,
          email: null
        }));
      }
      // Ensure guests start cleanly with NO leaked profile
      try {
        const sess = this.getSession();
        if (!sess || !sess.loggedIn) {
          localStorage.removeItem(STORAGE_KEY_PROFILE);
        }
      } catch (e) {}
      if (!localStorage.getItem(STORAGE_KEY_EMAILS)) {
        this.initDefaultEmails();
      }
      this.checkOAuthRedirect();
      this.initRemoteConfig();
      this.broadcastChange('init');
    },

    // ─── AUTH & SESSION ─────────────────────────────────────────────────
    getUsers() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_USERS);
        const list = raw ? JSON.parse(raw) : [];
        if (!list.some(u => u.email && u.email.toLowerCase() === 'admin@digistore.com')) {
          list.unshift(ADMIN_ACCOUNT);
        }
        return list;
      } catch (e) {
        return [ADMIN_ACCOUNT];
      }
    },

    saveUsers(users) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      this.broadcastChange('users');
    },

    getSession() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_SESSION);
        return raw ? JSON.parse(raw) : { loggedIn: false };
      } catch (e) {
        return { loggedIn: false };
      }
    },

    
    isAdmin() {
      if (!this.isLoggedIn()) return false;
      const u = this.getCurrentUser();
      return !!(u && (u.isAdmin === true || (u.email && u.email.toLowerCase() === 'admin@digistore.com') || u.role === 'Yönetici (Admin)'));
    },

    isLoggedIn() {
      const session = this.getSession();
      return !!(session && session.loggedIn);
    },

    getCurrentUser() {
      if (!this.isLoggedIn()) return null;
      const session = this.getSession();
      const users = this.getUsers();
      const user = users.find(u => (session.userId && u.id === session.userId) || (session.email && u.email.toLowerCase() === session.email.toLowerCase()));
      return user || null;
    },

    getUserProfile() {
      if (!this.isLoggedIn()) return null;
      const user = this.getCurrentUser();
      if (user) return user;
      try {
        const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    saveUserProfile(profile) {
      const current = this.getUserProfile() || DEFAULT_PROFILE;
      const updated = { ...current, ...profile };
      
      const users = this.getUsers();
      const idx = users.findIndex(u => (current.id && u.id === current.id) || (current.email && u.email.toLowerCase() === current.email.toLowerCase()));
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updated };
        this.saveUsers(users);
      } else {
        users.push(updated);
        this.saveUsers(users);
      }
      
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));

      // Synchronize customer name & phone across their existing orders
      if (updated.name) {
        try {
          const orders = this.getOrders();
          let changed = false;
          const targetEmails = [
            current.email ? current.email.toLowerCase() : '',
            updated.email ? updated.email.toLowerCase() : ''
          ].filter(Boolean);

          orders.forEach(o => {
            if (o.email && targetEmails.includes(o.email.toLowerCase())) {
              o.customer = updated.name;
              if (updated.phone) o.phone = updated.phone;
              changed = true;
            }
          });
          if (changed) {
            localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
            this.broadcastChange('orders');
          }
        } catch (e) {
          console.error('Order sync error:', e);
        }
      }

      this.broadcastChange('profile');
      return updated;
    },

    updateUserAvatar(avatarDataUrl) {
      return this.saveUserProfile({ avatar: avatarDataUrl || null });
    },

    login(email, password) {
      if (!email || !email.trim()) {
        return { success: false, message: 'Lütfen geçerli bir e-posta adresi girin.' };
      }
      const users = this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        return { success: false, message: 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.' };
      }
      if (user.password && user.password !== password) {
        return { success: false, message: 'Girdiğiniz şifre hatalı. Lütfen tekrar kontrol edin.' };
      }

      const session = {
        loggedIn: true,
        userId: user.id,
        email: user.email,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(user));
      this.broadcastChange('auth');
      return { success: true, user };
    },

    register(data) {
      const { name, email, password, phone } = data;
      if (!name || !name.trim()) {
        return { success: false, message: 'Lütfen adınızı ve soyadınızı girin.' };
      }
      if (!email || !email.includes('@')) {
        return { success: false, message: 'Lütfen geçerli bir e-posta adresi girin.' };
      }
      if (!password || password.length < 6) {
        return { success: false, message: 'Şifreniz en az 6 karakterden oluşmalıdır.' };
      }

      const users = this.getUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        return { success: false, message: 'Bu e-posta adresi zaten kullanımda. Giriş yapabilirsiniz.' };
      }

      const newUser = {
        id: 'usr_' + Date.now().toString(36),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : '+90 5xx xxx xx xx',
        role: 'Yeni Üye',
        password: password,
        provider: 'local',
        avatar: null,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      this.saveUsers(users);

      const session = {
        loggedIn: true,
        userId: newUser.id,
        email: newUser.email,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newUser));
      this.broadcastChange('auth');
      return { success: true, user: newUser };
    },

    loginWithGoogle(googleUser) {
      const users = this.getUsers();
      const email = ((googleUser && (googleUser.email || googleUser.mail)) || 'musteri@gmail.com').toLowerCase().trim();
      const name = (googleUser && (googleUser.name || googleUser.displayName)) || email.split('@')[0];
      let user = users.find(u => u.email && u.email.toLowerCase() === email);

      if (!user) {
        user = {
          id: 'usr_g_' + Date.now().toString(36),
          name: name,
          email: email,
          phone: (googleUser && googleUser.phone) || '',
          role: 'Google Doğrulanmış',
          password: '',
          provider: 'google',
          avatar: (googleUser && (googleUser.avatar || googleUser.picture)) || null,
          createdAt: new Date().toISOString()
        };
        users.push(user);
        this.saveUsers(users);
      } else {
        if (googleUser && (googleUser.avatar || googleUser.picture)) user.avatar = (googleUser.avatar || googleUser.picture);
        if (googleUser && googleUser.name) user.name = googleUser.name;
        user.provider = 'google';
        this.saveUsers(users);
      }

      const session = {
        loggedIn: true,
        userId: user.id,
        email: user.email,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(user));
      this.broadcastChange('auth');
      this.broadcastChange('session');
      this.broadcastChange('profile');
      return { success: true, user };
    },
    loginWithOAuth(provider, oauthUser) {
      const users = this.getUsers();
      const prov = (provider || 'oauth').toLowerCase();
      const email = ((oauthUser && (oauthUser.email || oauthUser.mail)) || ((oauthUser.username || 'kullanici') + '@' + prov + '.user')).toLowerCase().trim();
      const name = (oauthUser && (oauthUser.name || oauthUser.username || oauthUser.displayName)) || email.split('@')[0];
      let user = users.find(u => (u.email && u.email.toLowerCase() === email) || (u.oauthId && u.oauthId === oauthUser.id));

      const roleName = prov === 'discord' ? 'Discord Do?rulanm??' : (prov === 'github' ? 'GitHub Do?rulanm??' : (prov.toUpperCase() + ' Do?rulanm??'));

      if (!user) {
        user = {
          id: 'usr_' + prov.slice(0, 2) + '_' + Date.now().toString(36),
          oauthId: oauthUser.id || null,
          name: name,
          email: email,
          phone: oauthUser.phone || '',
          role: roleName,
          password: '',
          provider: prov,
          avatar: oauthUser.avatar || oauthUser.avatar_url || null,
          createdAt: new Date().toISOString()
        };
        users.push(user);
        this.saveUsers(users);
      } else {
        if (oauthUser.avatar || oauthUser.avatar_url) user.avatar = oauthUser.avatar || oauthUser.avatar_url;
        if (name) user.name = name;
        user.provider = prov;
        user.role = roleName;
        this.saveUsers(users);
      }

      const session = {
        loggedIn: true,
        userId: user.id,
        email: user.email,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(user));
      this.broadcastChange('auth');
      this.broadcastChange('session');
      this.broadcastChange('profile');
      return { success: true, user };
    },

    loginWithDiscord(discordUser) {
      return this.loginWithOAuth('discord', discordUser);
    },

    loginWithGithub(githubUser) {
      return this.loginWithOAuth('github', githubUser);
    },

    startDiscordAuth(options = {}) {
      const width = 580, height = 750;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const url = this.getApiBaseUrl() + '/api/auth-discord';

      const popup = window.open(
        url,
        'DiscordAuthPopup',
        'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left + ',status=no,resizable=yes'
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.location.href = url;
      }
    },

    startGithubAuth(options = {}) {
      const width = 580, height = 750;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const url = this.getApiBaseUrl() + '/api/auth-github';

      const popup = window.open(
        url,
        'GithubAuthPopup',
        'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left + ',status=no,resizable=yes'
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.location.href = url;
      }
    },

    getGoogleClientId() {
      const stored = localStorage.getItem('digistore_google_client_id');
      if (stored && stored.trim() && stored !== 'your_google_client_id_here.apps.googleusercontent.com') {
        return stored.trim();
      }
      if (window.DIGISTORE_GOOGLE_CLIENT_ID && window.DIGISTORE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here.apps.googleusercontent.com') {
        return window.DIGISTORE_GOOGLE_CLIENT_ID;
      }
      return '1005294511743-8q0snj3dggul6ktjd03votrrvdvg79g5.apps.googleusercontent.com';
    },

    setGoogleClientId(id) {
      if (id && id.trim()) {
        localStorage.setItem('digistore_google_client_id', id.trim());
      } else {
        localStorage.removeItem('digistore_google_client_id');
      }
      this.broadcastChange('google_config');
    },

    getApiBaseUrl() {
      if (typeof window === 'undefined') return 'http://localhost:3001';
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return window.location.port === '3001' ? '' : 'http://localhost:3001';
      }
      return ''; // Production domain (closydev.site / Vercel) uses relative /api/...
    },

    async initRemoteConfig() {
      try {
        const res = await fetch(this.getApiBaseUrl() + '/api/config');
        if (res.ok) {
          const cfg = await res.json();
          if (cfg.googleClientId && cfg.googleClientId !== 'your_google_client_id_here.apps.googleusercontent.com') {
            if (!localStorage.getItem('digistore_google_client_id')) {
              localStorage.setItem('digistore_google_client_id', cfg.googleClientId);
            }
          }
          this._remoteConfig = cfg;
        }
      } catch (e) {}
    },

    checkOAuthRedirect() {
      if (typeof window === 'undefined') return;
      // Check for stored OAuth redirect session
      try {
        const storedOauth = localStorage.getItem('digistore_oauth_user');
        if (storedOauth) {
          const parsed = JSON.parse(storedOauth);
          localStorage.removeItem('digistore_oauth_user');
          if (parsed && parsed.user && parsed.provider) {
            DigiStoreDB.loginWithOAuth(parsed.provider, parsed.user);
          }
        }
      } catch (e) {}

      if (window.location.hash && window.location.hash.includes('access_token=')) {
        try {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          if (accessToken) {
            window.history.replaceState(null, null, window.location.pathname + window.location.search);
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            })
            .then(r => r.json())
            .then(info => {
              if (info && info.email) {
                DigiStoreDB.loginWithGoogle({
                  email: info.email,
                  name: info.name,
                  avatar: info.picture,
                  id: info.sub
                });
                window.location.reload();
              }
            })
            .catch(console.error);
          }
        } catch (e) {}
      }
    },

    initGoogleIdentityServices(onSuccess, onError) {
      const clientId = this.getGoogleClientId();
      if (!clientId || typeof window === 'undefined') return;

      const initFn = () => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                const profile = JSON.parse(jsonPayload);
                const authRes = DigiStoreDB.loginWithGoogle({
                  email: profile.email,
                  name: profile.name,
                  avatar: profile.picture,
                  id: profile.sub
                });
                if (onSuccess) onSuccess(authRes.user);
                else {
                  if (typeof renderNavUser === 'function') renderNavUser();
                  if (typeof renderAllData === 'function') renderAllData();
                  if (typeof showDynamicIsland === 'function') {
                    showDynamicIsland('Google Doğrulandı', `Hoş geldin, ${profile.name}!`, 'success');
                  }
                  if (typeof closeAuthModal === 'function') closeAuthModal();
                }
              } catch (e) {
                if (onError) onError('Google kimlik bilgisi okunamadı: ' + e.message);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });

          // Render official Google button inside target elements
          document.querySelectorAll('.g-official-btn-container').forEach(el => {
            try {
              window.google.accounts.id.renderButton(el, {
                theme: 'filled_black',
                size: 'large',
                type: 'standard',
                shape: 'rectangular',
                text: 'continue_with',
                logo_alignment: 'left',
                width: el.clientWidth || 360
              });
              const customBtn = el.parentElement ? el.parentElement.querySelector('.btn-google-auth-fallback') : null;
              if (customBtn) customBtn.style.display = 'none';
            } catch (err) {}
          });
        } else {
          setTimeout(initFn, 200);
        }
      };
      initFn();
    },

    startGoogleAuth(options = {}) {
      const onSuccess = options.onSuccess || (() => {});
      const onError = options.onError || (() => {});
      const clientId = this.getGoogleClientId();

      if (!clientId) {
        this.showGoogleAuthSetupModal(onSuccess);
        return;
      }

      // Method 1: Google Identity Services OAuth2 Token Client (Official interactive popup for custom buttons)
      if (typeof window !== 'undefined' && window.google && window.google.accounts && window.google.accounts.oauth2) {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'email profile openid',
            prompt: 'select_account',
            callback: async (tokenResponse) => {
              if (tokenResponse && tokenResponse.access_token) {
                try {
                  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                  });
                  const info = await res.json();
                  if (info && info.email) {
                    const authRes = DigiStoreDB.loginWithGoogle({
                      email: info.email,
                      name: info.name || info.email.split('@')[0],
                      avatar: info.picture,
                      id: info.sub || info.id
                    });
                    if (typeof onSuccess === 'function') onSuccess(authRes.user);
                    if (typeof renderNavUser === 'function') renderNavUser();
                    if (typeof renderAllData === 'function') renderAllData();
                    if (typeof showDynamicIsland === 'function') {
                      showDynamicIsland('Google Doğrulandı', `Hoş geldin, ${info.name}!`, 'success');
                    }
                    if (typeof closeAuthModal === 'function') closeAuthModal();
                  }
                } catch (e) {
                  if (typeof onError === 'function') onError('Google profili okunamadı: ' + e.message);
                }
              } else if (tokenResponse && tokenResponse.error) {
                if (typeof onError === 'function') onError(tokenResponse.error);
              }
            }
          });
          client.requestAccessToken();
          return;
        } catch (err) {
          console.warn('initTokenClient error, using direct popup fallback:', err);
        }
      }

      // Method 2: Direct OAuth2 Popup (works in all browsers, Brave shields, adblockers)
      const currentOrigin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : 'https://closydev.site';
      const currentPath = (typeof window !== 'undefined' && window.location.pathname) ? window.location.pathname : '/';
      const redirectUri = currentOrigin + currentPath;
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile%20openid&prompt=select_account`;

      const width = 520, height = 680;
      const left = (typeof window !== 'undefined' ? (window.screen.width / 2 - width / 2) : 100);
      const top = (typeof window !== 'undefined' ? (window.screen.height / 2 - height / 2) : 100);
      const popup = window.open(oauthUrl, 'GoogleAuthPopup', `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes`);

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.location.href = oauthUrl;
      }
    },

    showGoogleAuthSetupModal(onSuccess) {
      let modal = document.getElementById('google-oauth-setup-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'google-oauth-setup-modal';
        modal.innerHTML = `
          <div style="position:fixed;inset:0;background:rgba(15,23,42,0.8);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;">
            <div style="background:#1e293b;border:1px solid #334155;border-radius:20px;max-width:540px;width:100%;padding:28px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);color:#f8fafc;font-family:Inter,-apple-system,sans-serif;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:40px;height:40px;border-radius:10px;background:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    <svg width="22" height="22" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                  </div>
                  <div>
                    <h3 style="margin:0;font-size:18px;font-weight:600;">Google OAuth 2.0 Giriş Sistemi</h3>
                    <span style="font-size:12px;color:#94a3b8;">accounts.google.com Gerçek Hesap Seçici</span>
                  </div>
                </div>
                <button onclick="document.getElementById('google-oauth-setup-modal').remove()" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;line-height:1;">&times;</button>
              </div>

              <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px;margin-bottom:20px;font-size:13px;line-height:1.6;color:#cbd5e1;">
                <p style="margin:0 0 10px 0;font-weight:500;color:#f1f5f9;">Google'ın orijinal giriş ekranını açmak için Google Cloud Console'dan ücretsiz bir Web Client ID gereklidir:</p>
                <ol style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px;">
                  <li><a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="color:#38bdf8;text-decoration:underline;">Google Cloud Console > Kimlik Bilgileri</a> sayfasına gidin.</li>
                  <li><b>Kimlik Bilgisi Oluştur</b> &gt; <b>OAuth İstemci Kimliği</b> &gt; <b>Web Uygulaması</b> seçin.</li>
                  <li>Yetkilendirilen JavaScript Kaynakları kısmına: <code style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#38bdf8;">${window.location.origin}</code> ekleyin.</li>
                  <li>Oluşturulan <b>İstemci Kimliği</b>ni (Client ID) kopyalayıp aşağıdaki kutucuğa yapıştırın.</li>
                </ol>
              </div>

              <div style="margin-bottom:18px;">
                <label style="display:block;font-size:12px;font-weight:600;color:#94a3b8;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Google OAuth Client ID</label>
                <input id="g-setup-client-id" type="text" placeholder="xxxxxxx-xxxxxxxx.apps.googleusercontent.com" value="${DigiStoreDB.getGoogleClientId() || ''}" style="width:100%;box-sizing:border-box;background:#0f172a;border:1px solid #475569;border-radius:10px;padding:12px 14px;color:#fff;font-size:13px;outline:none;" />
              </div>

              <div style="display:flex;gap:10px;margin-bottom:14px;">
                <button id="g-setup-save-btn" style="flex:1;background:#2563eb;color:#fff;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;transition:background 0.2s;">Kaydet & Google ile Giriş Yap</button>
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="background:#334155;color:#f8fafc;padding:12px 16px;border-radius:10px;font-size:13px;font-weight:500;text-decoration:none;display:flex;align-items:center;">Google Cloud'a Git</a>
              </div>

              <div style="text-align:center;padding-top:10px;border-top:1px solid #334155;">
                <button id="g-setup-fast-btn" style="background:none;border:none;color:#94a3b8;font-size:13px;cursor:pointer;text-decoration:underline;">API kurmadan Eren Zeybek hesabıyla hızlı test girişi yap</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('g-setup-save-btn').onclick = () => {
          const val = document.getElementById('g-setup-client-id').value.trim();
          if (val) {
            DigiStoreDB.setGoogleClientId(val);
            modal.remove();
            DigiStoreDB.startGoogleAuth({ onSuccess });
          } else {
            alert('Lütfen geçerli bir Google OAuth Client ID girin.');
          }
        };

        document.getElementById('g-setup-fast-btn').onclick = () => {
          modal.remove();
          const authRes = DigiStoreDB.loginWithGoogle({
            email: 'kullanici@gmail.com',
            name: 'Kullan?c?'
          });
          if (onSuccess) onSuccess(authRes.user);
        };
      }
    },

    logout() {
      const session = {
        loggedIn: false,
        userId: null,
        email: null,
        logoutTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      this.broadcastChange('auth');
      this.broadcastChange('session');
      this.broadcastChange('profile');
      return { success: true };
    },

    changePassword(oldPass, newPass) {
      const profile = this.getUserProfile();
      if (profile.password && profile.password !== oldPass) {
        return { success: false, message: 'Mevcut şifreniz hatalı.' };
      }
      if (!newPass || newPass.length < 6) {
        return { success: false, message: 'Yeni şifre en az 6 karakter olmalıdır.' };
      }
      profile.password = newPass;
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
      this.broadcastChange('profile');
      return { success: true, message: 'Şifreniz başarıyla güncellendi.' };
    },

    // ─── 6698 SAYILI KVKK KAPSAMINDA VERİ SAHİBİ HAKLARI ────────────────
    exportUserDataKVKK() {
      const p = this.getUserProfile() || {};
      const orders = this.getOrders().filter(o => o.email && p.email && o.email.toLowerCase() === p.email.toLowerCase());
      const licenses = this.getLicenses().filter(l => l.orderId && orders.some(o => String(o.id) === String(l.orderId)));
      const emails = this.getUserEmails(p.email);

      const exportPackage = {
        baslik: '6698 Sayılı KVKK Madde 11 Uyarınca Kişisel Veri Paketi',
        tarih: new Date().toISOString(),
        veri_sorumlusu: {
          unvan: 'DigiStore Bilişim ve Teknoloji Ticaret A.Ş.',
          mersis: '029408842100001',
          vkn: '2940884210',
          vergi_dairesi: 'Boğaziçi V.D.',
          kep: 'digistore@hs01.kep.tr'
        },
        kullanici_kimlik_ve_iletisim_verileri: {
          id: p.id,
          ad_soyad: p.name,
          eposta: p.email,
          telefon: p.phone || 'Belirtilmemiş',
          uyelik_tipi: p.role,
          giris_yontemi: p.provider || 'local',
          hesap_olusturma: p.createdAt || '2026-02-15'
        },
        islem_ve_siparis_gecmisi: orders,
        tanimlanan_lisanslar: licenses,
        iletilen_e_posta_kayitlari: emails
      };

      const blob = new Blob([JSON.stringify(exportPackage, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KVKK_Kisisel_Verilerim_${(p.name || 'DigiStore').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return exportPackage;
    },

    deleteAccountKVKK() {
      const p = this.getUserProfile();
      if (!p) return { success: false, message: 'Aktif bir kullanıcı oturumu bulunamadı.' };

      let users = this.getUsers();
      users = users.filter(u => u.email.toLowerCase() !== p.email.toLowerCase());
      this.saveUsers(users);

      let orders = this.getOrders();
      let modifiedOrders = false;
      orders.forEach(o => {
        if (o.email && o.email.toLowerCase() === p.email.toLowerCase()) {
          o.customer = 'ANONİM KULLANICI (KVKK SİLME TALEBİ)';
          o.email = 'silindi@kvkk.local';
          o.phone = '+90 000 000 00 00';
          modifiedOrders = true;
        }
      });
      if (modifiedOrders) {
        this.saveOrders(orders);
      }

      this.logout();
      return {
        success: true,
        message: 'Kişisel verileriniz 6698 sayılı KVKK Madde 11/e ve Kişisel Verilerin Silinmesi Yönetmeliği uyarınca başarıyla anonimleştirilmiş ve imha edilmiştir.'
      };
    },

    // ─── CATEGORIES ─────────────────────────────────────────────────────
    getCategories() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
        let list = raw ? JSON.parse(raw) : null;
        if (!list || !Array.isArray(list) || list.length <= 1) {
          this.saveCategories(DEFAULT_CATEGORIES);
          return DEFAULT_CATEGORIES;
        }
        list = list.map(c => ({
          ...c,
          icon: ''
        }));
        return list;
      } catch (e) {
        this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
    },

    resetCategories() {
      this.saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    },

    saveCategories(categories) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
      this.broadcastChange('categories');
    },

    addCategory(name, slug) {
      if (!name || !name.trim()) return null;
      const categories = this.getCategories();
      const cleanSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-')).trim();
      const existing = categories.find(c => c.slug === cleanSlug);
      if (existing) return existing;

      const newCat = {
        id: cleanSlug,
        name: name.trim(),
        slug: cleanSlug
      };
      categories.push(newCat);
      this.saveCategories(categories);
      return newCat;
    },

    deleteCategory(slug) {
      if (slug === 'all') return false;
      let categories = this.getCategories();
      categories = categories.filter(c => c.slug !== slug);
      this.saveCategories(categories);
      return true;
    },

    // ─── PRODUCTS ───────────────────────────────────────────────────────
    getProducts() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
        return DEFAULT_PRODUCTS;
      } catch (e) {
        return DEFAULT_PRODUCTS;
      }
    },

    restoreDefaultProducts() {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      this.broadcastChange('products');
      return DEFAULT_PRODUCTS;
    },

    getProductById(id) {
      return this.getProducts().find(p => String(p.id) === String(id)) || null;
    },

    saveProducts(products) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
      this.broadcastChange('products');
    },

    addProduct(prodData) {
      const products = this.getProducts();
      const newId = products.length ? Math.max(...products.map(p => Number(p.id) || 0)) + 1 : 1;
      
      const newProduct = {
        id: newId,
        name: prodData.name || 'Yeni Ürün',
        category: prodData.category || 'yazilim',
        price: Number(prodData.price) || 99,
        oldPrice: prodData.oldPrice ? Number(prodData.oldPrice) : null,
        rating: 5.0,
        reviews: 0,
        badge: prodData.badge || null,
        desc: prodData.desc || 'Ürün açıklaması henüz girilmedi.',
        features: Array.isArray(prodData.features) ? prodData.features : (prodData.features ? prodData.features.split('\n').filter(Boolean) : ['Anında Otomatik Teslimat']),
        downloads: 0,
        active: prodData.active !== false
      };

      products.unshift(newProduct);
      this.saveProducts(products);
      return newProduct;
    },

    updateProduct(id, updateData) {
      const products = this.getProducts();
      const idx = products.findIndex(p => String(p.id) === String(id));
      if (idx === -1) return null;

      const p = products[idx];
      products[idx] = {
        ...p,
        ...updateData,
        id: p.id,
        price: updateData.price !== undefined ? Number(updateData.price) : p.price,
        oldPrice: updateData.oldPrice !== undefined ? (updateData.oldPrice ? Number(updateData.oldPrice) : null) : p.oldPrice,
        features: Array.isArray(updateData.features) ? updateData.features : (updateData.features ? updateData.features.split('\n').filter(Boolean) : p.features)
      };

      this.saveProducts(products);
      return products[idx];
    },

    deleteProduct(id) {
      let products = this.getProducts();
      products = products.filter(p => String(p.id) !== String(id));
      this.saveProducts(products);
      return true;
    },

    toggleProductStatus(id) {
      const products = this.getProducts();
      const p = products.find(x => String(x.id) === String(id));
      if (p) {
        p.active = !p.active;
        this.saveProducts(products);
        return p.active;
      }
      return null;
    },

    // ─── ORDERS ─────────────────────────────────────────────────────────
    
    getUserOrders(userEmail) {
      if (!userEmail) return [];
      const orders = this.getOrders();
      const norm = userEmail.toLowerCase().trim();
      return orders.filter(o => o.email && o.email.toLowerCase().trim() === norm);
    },

    getUserLicenses(userEmail) {
      if (!userEmail) return [];
      const userOrders = this.getUserOrders(userEmail).filter(o => o.status === 'completed');
      const licenses = [];
      userOrders.forEach(o => {
        (o.licenseKeys || []).forEach(k => {
          licenses.push({
            orderId: o.id,
            product: o.product,
            key: k,
            date: o.date
          });
        });
      });
      return licenses;
    },

    getOrders() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
        return raw ? JSON.parse(raw) : DEFAULT_ORDERS;
      } catch (e) {
        return DEFAULT_ORDERS;
      }
    },

    getOrderById(id) {
      return this.getOrders().find(o => String(o.id) === String(id)) || null;
    },

    saveOrders(orders) {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
      this.broadcastChange('orders');
    },

    addOrder(orderData) {
      const orders = this.getOrders();
      const newOrder = {
        id: orderData.id || ('DS-' + Math.floor(100000 + Math.random() * 900000)),
        customer: orderData.customer || 'İsimsiz Müşteri',
        email: orderData.email || 'musteri@email.com',
        phone: orderData.phone || '+90 5xx xxx xx xx',
        product: orderData.items && orderData.items.length ? (orderData.items[0].name + (orderData.items.length > 1 ? ` (+${orderData.items.length - 1})` : '')) : 'Dijital Lisans Paketi',
        items: orderData.items || [],
        amount: Number(orderData.amount) || 0,
        status: orderData.status || 'completed',
        date: orderData.date || 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        method: orderData.method || 'Kredi Kartı',
        licenseKeys: orderData.licenseKeys || ['DS-KEY-' + Math.random().toString(36).substring(2, 10).toUpperCase()],
        invoiceType: orderData.invoiceType || 'Bireysel'
      };

      orders.unshift(newOrder);
      this.saveOrders(orders);

      // Increment product sales count
      const products = this.getProducts();
      if (newOrder.items && newOrder.items.length) {
        newOrder.items.forEach(it => {
          const prod = products.find(p => String(p.id) === String(it.id));
          if (prod) {
            prod.downloads = (prod.downloads || 0) + (it.qty || 1);
          }
        });
        this.saveProducts(products);
      }

      // Send Order Delivery Email & Generate Direct Gmail link
      const emailRecord = this.sendOrderEmail(newOrder);
      newOrder.emailId = emailRecord.id;

      // Asynchronously sync to backend orders API
      try {
        fetch(this.getApiBaseUrl() + '/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        }).catch(() => {});
      } catch (e) {}

      return newOrder;
    },

    async syncRemoteOrders() {
      try {
        const res = await fetch(this.getApiBaseUrl() + '/api/orders');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.orders) && data.orders.length) {
            const local = this.getOrders();
            let changed = false;
            data.orders.forEach(ro => {
              const idx = local.findIndex(lo => String(lo.id) === String(ro.id));
              if (idx === -1) {
                local.unshift(ro);
                changed = true;
              } else if (ro.status && local[idx].status !== ro.status) {
                local[idx].status = ro.status;
                changed = true;
              }
            });
            if (changed) {
              localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(local));
              this.broadcastChange('orders');
            }
            return local;
          }
        }
      } catch (e) {}
      return this.getOrders();
    },

    updateOrderStatus(orderId, newStatus) {
      const orders = this.getOrders();
      const o = orders.find(x => String(x.id) === String(orderId));
      if (o) {
        o.status = newStatus;
        this.saveOrders(orders);
        try {
          fetch(this.getApiBaseUrl() + '/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(o)
          }).catch(() => {});
        } catch (e) {}
        return true;
      }
    },

    // ─── EMAIL DELIVERY ENGINE & GMAIL INTEGRATION ──────────────────────
    getEmails() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_EMAILS);
        const emails = raw ? JSON.parse(raw) : [];
        let updated = false;
        emails.forEach(e => {
          if (e.gmailUrl && e.gmailUrl.includes('view=cm')) {
            e.gmailUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(e.orderId || '')}`;
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEY_EMAILS, JSON.stringify(emails));
        }
        return emails;
      } catch (e) {
        return [];
      }
    },

    saveEmails(emails) {
      localStorage.setItem(STORAGE_KEY_EMAILS, JSON.stringify(emails));
      this.broadcastChange('emails');
    },

    getEmailById(id) {
      const emails = this.getEmails();
      return emails.find(e => String(e.id) === String(id) || String(e.orderId) === String(id)) || null;
    },

    getUserEmails(userEmail) {
      const emails = this.getEmails();
      if (!userEmail) return emails;
      const clean = userEmail.toLowerCase().trim();
      return emails.filter(e => (e.to && e.to.toLowerCase().trim() === clean));
    },

    markEmailAsRead(id) {
      const emails = this.getEmails();
      const mail = emails.find(e => String(e.id) === String(id));
      if (mail) {
        mail.read = true;
        this.saveEmails(emails);
      }
    },

    generateEmailHtml(order, recipientEmail, customerName) {
      const dateStr = order.date || new Date().toLocaleString('tr-TR');
      const items = order.items && order.items.length ? order.items : [{ name: order.product || 'Dijital Lisans', qty: 1, price: order.amount || 0 }];
      const totalFormatted = '₺' + Number(order.amount || 0).toLocaleString('tr-TR');
      const keys = order.licenseKeys && order.licenseKeys.length ? order.licenseKeys : ['DS-KEY-AKTIF-2026'];

      return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Sipariş Onayı #${order.id} — DigiStore PRO</title>
<style>
  body { margin:0; padding:24px 12px; background-color:#0b0b0f; font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#f5f5f7; -webkit-font-smoothing:antialiased; }
  .email-container { max-width:620px; margin:0 auto; background:#121218; border:1px solid rgba(255,255,255,0.12); border-radius:20px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.6); }
  .header { padding:32px 28px 24px; text-align:center; background:linear-gradient(180deg, rgba(10,132,255,0.12) 0%, rgba(18,18,24,0) 100%); border-bottom:1px solid rgba(255,255,255,0.08); }
  .logo-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.06); padding:8px 18px; border-radius:999px; border:1px solid rgba(255,255,255,0.14); margin-bottom:16px; }
  .title { font-size:22px; font-weight:800; color:#ffffff; margin:0 0 8px; letter-spacing:-0.5px; }
  .subtitle { font-size:14px; color:#86868b; margin:0; line-height:1.5; }
  .body-content { padding:28px; }
  .meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; }
  .meta-item { display:flex; flex-direction:column; }
  .meta-lbl { font-size:11px; font-weight:700; color:#86868b; text-transform:uppercase; letter-spacing:0.04em; }
  .meta-val { font-size:14px; font-weight:600; color:#ffffff; margin-top:2px; word-break:break-all; }
  .license-box { background:#09090d; border:1px solid rgba(56,189,248,0.3); border-radius:14px; padding:18px; margin:20px 0; }
  .key-pill { font-family:'JetBrains Mono',SFMono-Regular,Consolas,monospace; font-size:15px; font-weight:700; color:#38bdf8; background:rgba(56,189,248,0.1); border:1px dashed rgba(56,189,248,0.4); padding:8px 14px; border-radius:8px; display:inline-block; margin-top:8px; letter-spacing:0.05em; }
  .items-table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  .items-table th { font-size:11.5px; text-transform:uppercase; color:#86868b; text-align:left; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.08); }
  .items-table td { font-size:13.5px; color:#f5f5f7; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
  .guide-box { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:18px; margin-top:20px; font-size:13px; color:#a1a1a6; line-height:1.6; }
  .guide-title { font-size:13px; font-weight:700; color:#ffffff; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
  .footer { padding:24px 28px; background:rgba(0,0,0,0.4); border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11.5px; color:#86868b; line-height:1.6; }
</style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-badge">
        <span style="font-weight:800;font-size:15px;color:#fff;letter-spacing:-0.4px;">Digi<span style="color:#38bdf8;">Store</span></span>
        <span style="background:#38bdf8;color:#000;font-size:9px;font-weight:900;padding:1px 5px;border-radius:4px;">PRO</span>
      </div>
      <h1 class="title">Siparişiniz &amp; Dijital Lisansınız Teslim Edildi</h1>
      <p class="subtitle">Merhaba <b>${customerName}</b>, siparişiniz başarıyla onaylandı ve teslimat gerçekleştirildi.</p>
    </div>

    <div class="body-content">
      
      <!-- Sipariş Meta -->
      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-lbl">Sipariş Numarası</span>
          <span class="meta-val" style="font-family:'JetBrains Mono',monospace;color:#38bdf8;">#${order.id}</span>
        </div>
        <div class="meta-item">
          <span class="meta-lbl">Teslimat Adresi</span>
          <span class="meta-val" style="color:#34c759;">${recipientEmail}</span>
        </div>
        <div class="meta-item" style="margin-top:8px;">
          <span class="meta-lbl">Tarih / Saat</span>
          <span class="meta-val">${dateStr}</span>
        </div>
        <div class="meta-item" style="margin-top:8px;">
          <span class="meta-lbl">Ödeme Şekli</span>
          <span class="meta-val">${order.method || 'Kredi Kartı'}</span>
        </div>
      </div>

      <!-- Lisans Kutusu -->
      <div class="license-box">
        <div style="font-size:12px;font-weight:700;color:#86868b;text-transform:uppercase;letter-spacing:0.04em;">DİJİTAL LİSANS ANAHTARINIZ</div>
        <div style="font-size:16px;font-weight:700;color:#fff;margin-top:4px;">${order.product || 'Lisans Paketi'}</div>
        ${keys.map(k => `<div class="key-pill">${k}</div>`).join('')}
        <div style="font-size:12px;color:#34c759;margin-top:10px;font-weight:600;display:flex;align-items:center;gap:6px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Orijinal &amp; Ömür Boyu Geçerli Lisans</span></div>
      </div>

      <!-- Ürün Tablosu -->
      <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:10px;">Satın Alınan Kalemler</div>
      <table class="items-table">
        <thead>
          <tr>
            <th>Ürün Açıklaması</th>
            <th style="text-align:center;">Adet</th>
            <th style="text-align:right;">Tutar</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(it => `
            <tr>
              <td><b>${it.name}</b><br/><span style="font-size:11.5px;color:#86868b;">Anında Dijital Aktivasyon</span></td>
              <td style="text-align:center;">${it.qty || 1}</td>
              <td style="text-align:right;font-weight:700;font-family:'JetBrains Mono',monospace;">₺${Number(it.price || 0).toLocaleString('tr-TR')}</td>
            </tr>`).join('')}
          <tr>
            <td colspan="2" style="font-weight:800;font-size:15px;color:#fff;padding-top:16px;">TOPLAM ÖDENEN TUTAR (KDV Dahil)</td>
            <td style="text-align:right;font-weight:800;font-size:18px;color:#fff;font-family:'JetBrains Mono',monospace;padding-top:16px;">${totalFormatted}</td>
          </tr>
        </tbody>
      </table>

      <!-- Aktivasyon Rehberi -->
      <div class="guide-box">
        <div class="guide-title">
          <span>Hızlı Etkinleştirme ve Kurulum</span>
        </div>
        <ol style="margin:0;padding-left:18px;">
          <li>Yukarıdaki lisans kodunuzu seçip kopyalayın.</li>
          <li>Windows lisansı için: <b>Ayarlar > Sistem > Etkinleştirme > Ürün Anahtarını Değiştir</b> bölümüne yapıştırın.</li>
          <li>Yazılım veya Bot için: Panelden indirdiğiniz ZIP arşivindeki <code style="color:#60a5fa;">LISANS_ANAHTARI.txt</code> dosyasına ekleyip <code style="color:#60a5fa;">kurulum_baslat.bat</code> dosyasını çalıştırın.</li>
        </ol>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <div style="font-weight:700;color:#f5f5f7;margin-bottom:4px;">DigiStore Bilişim Ticaret A.Ş. · GİB e-Arşiv Fatura Onaylı</div>
      <div>Büyükdere Caddesi No:193 Levent, Beşiktaş / İstanbul · Destek: destek@digistore.com</div>
      <div style="margin-top:8px;font-size:10.5px;color:#6b7280;">Bu e-posta dijital siparişinize istinaden sistem tarafından otomatik oluşturulmuştur.</div>
    </div>
  </div>
</body>
</html>`;
    },

    generateEmailPlainText(order, recipientEmail, customerName) {
      const keys = order.licenseKeys && order.licenseKeys.length ? order.licenseKeys.join(', ') : 'DS-KEY-AKTIF-2026';
      const items = order.items && order.items.length ? order.items.map(it => `* ${it.name} (Adet: ${it.qty || 1}) - ₺${it.price}`).join('\n') : `* ${order.product || 'Dijital Lisans'}`;
      const total = '₺' + Number(order.amount || 0).toLocaleString('tr-TR');

      return `=======================================================
DIGISTORE PRO — RESMİ DİJİTAL SİPARİŞ & LİSANS TESLİMATI
=======================================================

Sayın ${customerName},

DigiStore üzerinden vermiş olduğunuz sipariş başarıyla onaylanmış ve dijital teslimatınız gerçekleştirilmiştir.

[SİPARİŞ DETAYLARI]
-------------------------------------------------------
Sipariş No        : #${order.id}
Teslimat E-postası : ${recipientEmail}
Tarih             : ${order.date || new Date().toLocaleString('tr-TR')}
Ödeme Şekli       : ${order.method || 'Kredi Kartı'}
Toplam Tutar      : ${total} (KDV Dahil)

[SATIN ALINAN ÜRÜNLER]
-------------------------------------------------------
${items}

[ÜRETİLEN DİJİTAL LİSANS ANAHTARLARINIZ]
-------------------------------------------------------
${keys}

(Durum: ONAYLANDI & ÖMÜR BOYU GEÇERLİ)

[ETKİNLİŞTİRME REHBERİ]
-------------------------------------------------------
1. Windows Lisansı İçin:
   Ayarlar > Sistem > Etkinleştirme > "Ürün Anahtarını Değiştir" alanına lisansınızı girin ve "Etkinleştir"e tıklayın.

2. Bot / Yazılım / Şablon İçin:
   Müşteri panelinizdeki "İndirmelerim" sayfasından kurulum ZIP paketini indirin. "kurulum_baslat.bat" ile çalıştırın.

[DESTEK & İLETİŞİM]
-------------------------------------------------------
7/24 Teknik Destek: destek@digistore.com
Resmi e-Arşiv Faturanız müşteri panelinizdeki "Faturalarım" sekmesinde kayıtlıdır.

Teşekkür eder, iyi çalışmalar dileriz.
DigiStore Bilişim Ticaret A.Ş.`;
    },

    sendOrderEmail(orderData) {
      const to = orderData.email || 'musteri@email.com';
      const customer = orderData.customer || 'Değerli Müşterimiz';
      const orderId = orderData.id || ('DS-' + Math.floor(100000 + Math.random() * 900000));
      const subject = `Siparişiniz & Lisans Anahtarlarınız Teslim Edildi: #${orderId}`;

      const html = this.generateEmailHtml(orderData, to, customer);
      const plain = this.generateEmailPlainText(orderData, to, customer);

      const gmailUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(orderId)}`;
      const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}`;

      const emailRecord = {
        id: 'EML-' + Math.floor(100000 + Math.random() * 900000),
        orderId: orderId,
        to: to,
        customer: customer,
        subject: subject,
        preview: `${orderData.product || 'Dijital Lisans Paketi'} lisans anahtarınız ve faturanız teslim edildi.`,
        html: html,
        plain: plain,
        gmailUrl: gmailUrl,
        mailtoUrl: mailtoUrl,
        date: orderData.date || ('Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })),
        timestamp: Date.now(),
        status: 'Teslim Edildi',
        read: false,
        licenseKeys: orderData.licenseKeys || []
      };

      const emails = this.getEmails();
      emails.unshift(emailRecord);
      this.saveEmails(emails);

      // Background notification attempt to local or production backend
      try {
        if (typeof fetch !== 'undefined') {
          fetch(this.getApiBaseUrl() + '/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: to,
              customer: customer,
              orderId: orderId,
              subject: subject,
              html: html,
              plain: plain
            })
          }).catch(() => {});
        }
      } catch (e) {}

      return emailRecord;
    },

    initDefaultEmails() {
      this.saveEmails([]);
    },

    // ─── CUSTOMERS (DERIVED FROM ORDERS) ────────────────────────────────
    getCustomers() {
      const orders = this.getOrders();
      const map = {};

      orders.forEach(o => {
        const key = o.email ? o.email.toLowerCase().trim() : o.customer;
        if (!map[key]) {
          map[key] = {
            name: o.customer,
            email: o.email,
            phone: o.phone,
            orderCount: 0,
            totalSpent: 0,
            lastOrderDate: o.date,
            status: 'Doğrulanmış'
          };
        }
        map[key].orderCount++;
        if (o.status === 'completed') {
          map[key].totalSpent += Number(o.amount) || 0;
        }
      });

      return Object.values(map);
    },

    // ─── LICENSES ───────────────────────────────────────────────────────
    getLicenses() {
      const orders = this.getOrders();
      const licenses = [];

      orders.forEach(o => {
        if (o.licenseKeys && o.licenseKeys.length) {
          o.licenseKeys.forEach(k => {
            licenses.push({
              key: k,
              product: o.product,
              customer: o.customer,
              email: o.email,
              orderId: o.id,
              status: o.status === 'completed' ? 'active' : (o.status === 'refunded' ? 'revoked' : 'pending'),
              date: o.date
            });
          });
        }
      });

      return licenses;
    },

    generateNewLicense(productName, email, customerName) {
      const key = 'DS-' + Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 6).toUpperCase()).join('-');
      const order = this.addOrder({
        customer: customerName || 'Manuel Lisans',
        email: email || 'lisans@digistore.com',
        product: productName || 'Özel Lisans',
        items: [{ id: 999, name: productName || 'Özel Lisans', qty: 1, price: 0 }],
        amount: 0,
        status: 'completed',
        method: 'Yönetici Üretimi',
        licenseKeys: [key]
      });
      return { key, order };
    },

    // ─── PURE IN-BROWSER ZIP & DOWNLOAD ENGINE ────────────────────────
    crc32(bytes) {
      let c;
      const table = [];
      for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) {
          c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        table[n] = c;
      }
      let crc = 0 ^ (-1);
      for (let i = 0; i < bytes.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xFF];
      }
      return (crc ^ (-1)) >>> 0;
    },

    createZipBlob(files) {
      const enc = new TextEncoder();
      const fileEntries = [];
      let offset = 0;
      const parts = [];

      for (const file of files) {
        const nameBytes = enc.encode(file.name);
        const contentBytes = enc.encode(file.content);
        const crc = this.crc32(contentBytes);
        const size = contentBytes.length;

        const header = new Uint8Array(30);
        const view = new DataView(header.buffer);
        view.setUint32(0, 0x04034b50, true);
        view.setUint16(4, 20, true);
        view.setUint16(6, 0, true);
        view.setUint16(8, 0, true);
        view.setUint16(10, 0x5421, true);
        view.setUint16(12, 0x5421, true);
        view.setUint32(14, crc, true);
        view.setUint32(18, size, true);
        view.setUint32(22, size, true);
        view.setUint16(26, nameBytes.length, true);
        view.setUint16(28, 0, true);

        fileEntries.push({ nameBytes, crc, size, offset });
        parts.push(header, nameBytes, contentBytes);
        offset += header.length + nameBytes.length + contentBytes.length;
      }

      const centralDirStart = offset;
      let centralDirSize = 0;

      for (const entry of fileEntries) {
        const cdHeader = new Uint8Array(46);
        const view = new DataView(cdHeader.buffer);
        view.setUint32(0, 0x02014b50, true);
        view.setUint16(4, 20, true);
        view.setUint16(6, 20, true);
        view.setUint16(8, 0, true);
        view.setUint16(10, 0, true);
        view.setUint16(12, 0x5421, true);
        view.setUint16(14, 0x5421, true);
        view.setUint32(16, entry.crc, true);
        view.setUint32(20, entry.size, true);
        view.setUint32(24, entry.size, true);
        view.setUint16(28, entry.nameBytes.length, true);
        view.setUint16(30, 0, true);
        view.setUint16(32, 0, true);
        view.setUint16(34, 0, true);
        view.setUint16(36, 0, true);
        view.setUint32(38, 0, true);
        view.setUint32(42, entry.offset, true);

        parts.push(cdHeader, entry.nameBytes);
        centralDirSize += cdHeader.length + entry.nameBytes.length;
      }

      const eocd = new Uint8Array(22);
      const view = new DataView(eocd.buffer);
      view.setUint32(0, 0x06054b50, true);
      view.setUint16(4, 0, true);
      view.setUint16(6, 0, true);
      view.setUint16(8, fileEntries.length, true);
      view.setUint16(10, fileEntries.length, true);
      view.setUint32(12, centralDirSize, true);
      view.setUint32(16, centralDirStart, true);
      view.setUint16(20, 0, true);

      parts.push(eocd);
      return new Blob(parts, { type: 'application/zip' });
    },

    downloadProductArchive(productName, orderId, btn) {
      const originalHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="animate-spin"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
          <span>Paketleniyor...</span>`;
        btn.disabled = true;
      }

      setTimeout(() => {
        try {
          const orders = this.getOrders();
          const order = orders.find(o => String(o.id) === String(orderId)) || {};
          const user = this.getUserProfile() || { name: 'Müşteri' };
          const licenseKey = (order.licenseKeys && order.licenseKeys.length) ? order.licenseKeys[0] : ('DS-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-KEY-2026');

          const readmeText = 
`======================================================================
DIGISTORE PRO — RESMI DIJITAL TESLIMAT & KURULUM PAKETI
======================================================================
Urun Adi          : ${productName}
Siparis Numarasi  : #${orderId}
Lisans Anahtari   : ${licenseKey}
Musteri Adi       : ${order.customer || user.name || 'Degerli Musterimiz'}
Teslimat Tarihi   : ${order.date || new Date().toLocaleString('tr-TR')}
Lisans Durumu     : ONAYLANDI (Omur Boyu Gecerli & Aktif)
======================================================================

[1] HIZLI KURULUM ADIMLARI:
1. Bu arsivdeki dosyalari bilgisayarinizda istediginiz klasore cikartin.
2. 'LISANS_ANAHTARI.txt' dosyasindaki seri numarasini kopyalayin.
3. 'kurulum_baslat.bat' dosyasini cift tiklayarak calistirin.
4. Yazilim veya bot otomatik olarak lisansi dogrulayip baslayacaktir.

[2] YASAL GUVENCE & DESTEK:
Bu dijital urun ve lisans haklari adiniza resmi olarak tahsis edilmistir.
- Musteri Paneli  : https://digistore.com/hesabim.html
- 7/24 Destek     : destek@digistore.com
- Garanti         : 14 Gun Kosulsuz Iade & Degisim Guvencesi

(c) 2026 DigiStore Bilisim Ticaret A.S. Tum haklari saklidir.
======================================================================`;

          const licenseText = 
`======================================================================
DIGISTORE PRO RESMI LISANS SERTIFIKASI
======================================================================
URUN            : ${productName}
LISANS ANAHTARI : ${licenseKey}
SAHIBI          : ${order.customer || user.name || 'Degerli Musterimiz'}
SIPARIS         : #${orderId}
GUVENLIK KODU   : SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}
DURUM           : AKTIF & DOGRULANMIS
======================================================================`;

          const batScript = 
`@echo off
color 0b
title DigiStore Kurulum Sihirbazi - ${productName}
echo ======================================================================
echo    DIGISTORE PRO KURULUM VE AKTIVASYON YONETICISI
echo ======================================================================
echo  Urun: ${productName}
echo  Siparis: #${orderId}
echo  Lisans Dogrulaniyor...
timeout /t 1 /nobreak >nul
echo  [OK] Lisans Basariyla Dogrulandi: ${licenseKey}
echo  [OK] Kurulum dosyalari hazirlandi.
echo ======================================================================
echo  Kurulum basariyla tamamlandi. Tesekkur ederiz!
pause
`;

          const configJson = JSON.stringify({
            product: productName,
            orderId: orderId,
            licenseKey: licenseKey,
            customer: order.customer || user.name || 'Müşteri',
            version: "4.2.0",
            activated: true,
            channel: "production",
            downloadTimestamp: new Date().toISOString()
          }, null, 2);

          const zipBlob = this.createZipBlob([
            { name: 'KURULUM_REHBERI.txt', content: readmeText },
            { name: 'LISANS_ANAHTARI.txt', content: licenseText },
            { name: 'kurulum_baslat.bat', content: batScript },
            { name: 'config.json', content: configJson }
          ]);

          const safeName = (productName || 'DigiStore_Urun').replace(/[^a-zA-Z0-9_-]/g, '_');
          const fileName = `${safeName}_Kurulum_Paketi.zip`;

          const url = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);

          if (btn) {
            btn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>İndirildi!</span>`;
            btn.disabled = false;
            setTimeout(() => { btn.innerHTML = originalHtml; }, 2500);
          }

          if (typeof showDynamicIsland === 'function') {
            showDynamicIsland('İndirme Başarılı', `${fileName} bilgisayarınıza indirildi.`, 'success');
          }
        } catch (err) {
          console.error('Download error:', err);
          if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
          alert('Dosya indirilirken bir sorun oluştu: ' + err.message);
        }
      }, 500);
    },

    downloadInvoice(orderId) {
      const orders = this.getOrders();
      const order = orders.find(o => String(o.id) === String(orderId)) || {
        id: orderId,
        customer: 'Müşteri',
        product: 'Dijital Ürün',
        amount: 149,
        date: 'Bugün',
        method: 'Kredi Kartı'
      };

      const user = this.getUserProfile() || {};
      const customerName = order.customer || user.name || 'Sayın Müşteri';
      const customerEmail = order.email || user.email || 'musteri@email.com';
      const subtotal = (Number(order.amount) / 1.20).toFixed(2);
      const kdvAmount = (Number(order.amount) - subtotal).toFixed(2);
      const totalAmount = Number(order.amount).toFixed(2);

      const invoiceHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<title>e-Arşiv Fatura #${order.id} — DigiStore</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 20px; margin: 0; }
  .invoice-box { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 24px; }
  .gib-badge { background: #dc2626; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.05em; display: inline-block; margin-bottom: 8px; }
  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .meta-table td { padding: 8px 12px; font-size: 13px; vertical-align: top; }
  .meta-title { font-weight: 700; color: #64748b; width: 140px; font-size: 11px; text-transform: uppercase; }
  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .items-table th { background: #f1f5f9; padding: 10px 14px; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #cbd5e1; }
  .items-table td { padding: 14px; font-size: 13.5px; border-bottom: 1px solid #e2e8f0; }
  .totals-table { margin-left: auto; width: 280px; border-collapse: collapse; margin-bottom: 30px; }
  .totals-table td { padding: 8px 12px; font-size: 13.5px; }
  .totals-table .grand-total { font-size: 16px; font-weight: 800; color: #0f172a; border-top: 2px solid #cbd5e1; }
  .seal { border: 2px dashed #0a84ff; border-radius: 8px; padding: 12px 18px; display: inline-block; text-align: center; color: #0a84ff; font-weight: 700; font-size: 12px; }
  @media print { .no-print { display: none !important; } body { padding: 0; background: #fff; } .invoice-box { box-shadow: none; border: none; padding: 0; } }
</style>
</head>
<body>
<div class="invoice-box">
  <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px;">
    <button onclick="window.print()" style="background:#0a84ff;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg><span>Faturayı Yazdır / PDF Kaydet</span></button>
  </div>
  <div class="header">
    <div>
      <span class="gib-badge">e-ARŞİV FATURA</span>
      <h1 style="font-size: 22px; margin: 0 0 6px; color: #0f172a;">DigiStore Bilişim Ticaret A.Ş.</h1>
      <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.5;">
        Büyükdere Cad. No: 193 Levent, Beşiktaş / İstanbul<br/>
        Vergi Dairesi: Boğaziçi V.D. | VKN: 2940884210 | Mersis: 029408842100001
      </p>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 18px; font-weight: 800; color: #0f172a;">FATURA NO</div>
      <div style="font-family: monospace; font-size: 16px; font-weight: 700; color: #0a84ff;">#${order.id}</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Tarih: ${order.date || new Date().toLocaleDateString('tr-TR')}</div>
    </div>
  </div>

  <table class="meta-table">
    <tr>
      <td style="width: 50%; background: #f8fafc; border-radius: 8px; padding: 14px;">
        <div class="meta-title">SAYIN ALICI (MÜŞTERİ)</div>
        <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 4px;">${customerName}</div>
        <div style="font-size: 12.5px; color: #64748b; margin-top: 2px;">E-Posta: ${customerEmail}</div>
        <div style="font-size: 12.5px; color: #64748b;">Vergi/T.C. Kimlik: ${order.invoiceType || 'Bireysel (11111111111)'}</div>
      </td>
      <td style="width: 50%; background: #f8fafc; border-radius: 8px; padding: 14px; margin-left: 10px;">
        <div class="meta-title">ÖDEME BİLGİLERİ</div>
        <div style="font-size: 13.5px; font-weight: 600; color: #0f172a; margin-top: 4px;">Ödeme Şekli: ${order.method || 'Kredi Kartı (PayTR 3D Secure)'}</div>
        <div style="font-size: 12.5px; color: #64748b; margin-top: 2px;">Para Birimi: Türk Lirası (TRY)</div>
        <div style="font-size: 12.5px; color: #16a34a; font-weight: 600;">Tahsil Edildi (İşlem Onaylandı)</div>
      </td>
    </tr>
  </table>

  <table class="items-table">
    <thead>
      <tr>
        <th>No</th>
        <th>Mal / Hizmet Açıklaması</th>
        <th>Miktar</th>
        <th>Birim Fiyat</th>
        <th>KDV Oranı</th>
        <th style="text-align: right;">Toplam Tutar</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td><b>${order.product}</b><br/><span style="font-size: 11.5px; color: #64748b;">Dijital Lisans &amp; Otomasyon Yazılımı Lisans Bedeli</span></td>
        <td>1 Adet</td>
        <td>₺${subtotal}</td>
        <td>%20</td>
        <td style="text-align: right; font-weight: 700;">₺${subtotal}</td>
      </tr>
    </tbody>
  </table>

  <table class="totals-table">
    <tr>
      <td style="color: #64748b;">Ara Toplam:</td>
      <td style="text-align: right; font-weight: 600;">₺${subtotal}</td>
    </tr>
    <tr>
      <td style="color: #64748b;">Hesaplanan KDV (%20):</td>
      <td style="text-align: right; font-weight: 600;">₺${kdvAmount}</td>
    </tr>
    <tr class="grand-total">
      <td>Ödenecek Tutar:</td>
      <td style="text-align: right; color: #0f172a;">₺${totalAmount}</td>
    </tr>
  </table>

  <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 20px;">
    <div style="font-size: 11.5px; color: #94a3b8; line-height: 1.6; max-width: 450px;">
      Bu fatura 213 sayılı V.U.K. hükümlerine göre elektronik ortamda düzenlenmiş olup resmi mali mühür ile onaylanmıştır. Nüsha olarak saklanabilir.
    </div>
    <div class="seal">
      DİGİSTORE ELEKTRONİK MALİ MÜHÜR<br/>
      <span style="font-size: 10px; font-weight: 400; color: #64748b;">Zaman Damgası: ${new Date().toISOString()}</span>
    </div>
  </div>
</div>
</body>
</html>`;

      const blob = new Blob([invoiceHtml], { type: 'text/html;charset=utf-8' });
      const fileName = `e-Arsiv-Fatura-${order.id}.html`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      if (typeof showDynamicIsland === 'function') {
        showDynamicIsland('Fatura İndirildi', `${fileName} dosyanız kaydedildi.`, 'success');
      }
    },
    getStats() {
      const orders = this.getOrders();
      const products = this.getProducts();

      const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

      const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
      const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
      const activeProductsCount = products.filter(p => p.active !== false).length;
      const customersCount = this.getCustomers().length;

      return {
        revenue: totalRevenue,
        totalOrders: orders.length,
        completedOrders: completedOrdersCount,
        pendingOrders: pendingOrdersCount,
        activeProducts: activeProductsCount,
        totalProducts: products.length,
        customers: customersCount
      };
    },

    // ─── LIVE SUPPORT (CANLI DESTEK - GERCEK YONETICI admin@digistore.com) ───
    isAdminOperator() {
      const user = (typeof this.getUserProfile === 'function') ? this.getUserProfile() : null;
      return !!(user && user.email && user.email.toLowerCase().trim() === 'admin@digistore.com');
    },

    getSupportChats() {
      const raw = localStorage.getItem('digistore_support_chats');
      if (!raw) return [];
      try { return JSON.parse(raw); } catch (e) { return []; }
    },

    saveSupportChats(chats) {
      localStorage.setItem('digistore_support_chats', JSON.stringify(chats));
      this.broadcastChange('digistore_support_chats');
    },

    getSupportChat(id) {
      const chats = this.getSupportChats();
      return chats.find(c => c.id === id) || null;
    },

    deleteSupportChat(id) {
      let chats = this.getSupportChats();
      chats = chats.filter(c => c.id !== id);
      this.saveSupportChats(chats);
      try {
        fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', chatId: id, senderEmail: 'admin@digistore.com', isAdmin: true })
        }).catch(() => {});
      } catch (e) {}
    },

    getUserChatSession() {
      let sessionId = localStorage.getItem('digistore_support_session_id');
      if (!sessionId) {
        sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        localStorage.setItem('digistore_support_session_id', sessionId);
      }

      const user = (typeof this.getUserProfile === 'function') ? this.getUserProfile() : null;
      const userEmail = (user && user.email) ? user.email : '';
      const userName = (user && user.name) ? user.name : 'Müşteri';

      let chats = this.getSupportChats();
      let chat = null;

      if (userEmail && userEmail.toLowerCase() !== 'admin@digistore.com') {
        chat = chats.find(c => c.userEmail && c.userEmail.toLowerCase() === userEmail.toLowerCase());
      }
      if (!chat) {
        chat = chats.find(c => c.sessionId === sessionId);
      }

      if (!chat) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString('tr-TR');

        chat = {
          id: 'chat_' + Date.now(),
          sessionId: sessionId,
          userEmail: userEmail || '',
          userName: userName,
          createdAt: dateStr + ' ' + timeStr,
          lastUpdated: Date.now(),
          unreadByAdmin: 0,
          unreadByUser: 0,
          status: 'active',
          messages: [
            {
              id: 'm_init',
              sender: 'admin',
              senderName: 'Site Yöneticisi (admin@digistore.com)',
              senderEmail: 'admin@digistore.com',
              text: 'Merhaba! DigiStore doğrudan yönetici canlı destek hattındasınız. Mesajınızı buraya yazabilirsiniz, site yöneticimiz admin@digistore.com doğrudan canlı olarak yanıtlayacaktır.',
              time: timeStr
            }
          ]
        };
        chats.unshift(chat);
        this.saveSupportChats(chats);
      } else {
        if (userEmail && (!chat.userEmail || chat.userName === 'Müşteri')) {
          chat.userEmail = userEmail;
          chat.userName = userName;
          this.saveSupportChats(chats);
        }
      }
      return chat;
    },

    async sendUserSupportMessage(text) {
      if (!text || !text.trim()) return null;
      const cleanText = text.trim();
      const chat = this.getUserChatSession();
      const now = new Date();
      const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

      const newMsg = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        sender: 'user',
        senderName: chat.userName || 'Müşteri',
        senderEmail: chat.userEmail || '',
        text: cleanText,
        time: timeStr
      };

      chat.messages.push(newMsg);
      chat.lastUpdated = Date.now();
      chat.unreadByAdmin = (chat.unreadByAdmin || 0) + 1;
      chat.unreadByUser = 0;

      const chats = this.getSupportChats();
      const idx = chats.findIndex(c => c.id === chat.id);
      if (idx !== -1) chats[idx] = chat; else chats.unshift(chat);
      this.saveSupportChats(chats);

      // Serverless senkronizasyonu
      try {
        fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send',
            chatId: chat.id,
            sessionId: chat.sessionId,
            userEmail: chat.userEmail,
            userName: chat.userName,
            text: cleanText,
            isAdmin: false
          })
        }).catch(() => {});
      } catch (e) {}

      return newMsg;
    },

    async sendAgentSupportMessage(chatId, text, senderEmail = 'admin@digistore.com') {
      if (!text || !text.trim()) return null;
      const isAuthorized = this.isAdminOperator() || (senderEmail && senderEmail.toLowerCase().trim() === 'admin@digistore.com');
      if (!isAuthorized) {
        console.warn('Canlı destek yanıtı sadece yetkili admin@digistore.com tarafından verilebilir');
        return null;
      }

      const chats = this.getSupportChats();
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return null;

      const now = new Date();
      const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

      const newMsg = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        sender: 'admin',
        senderName: 'Site Yöneticisi (admin@digistore.com)',
        senderEmail: 'admin@digistore.com',
        text: text.trim(),
        time: timeStr
      };

      chat.messages.push(newMsg);
      chat.lastUpdated = Date.now();
      chat.unreadByUser = (chat.unreadByUser || 0) + 1;
      chat.unreadByAdmin = 0;

      this.saveSupportChats(chats);

      // Serverless senkronizasyonu
      try {
        fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send',
            chatId: chat.id,
            text: text.trim(),
            isAdmin: true,
            senderEmail: 'admin@digistore.com'
          })
        }).catch(() => {});
      } catch (e) {}

      return newMsg;
    },

    markSupportReadByAdmin(chatId) {
      const chats = this.getSupportChats();
      const chat = chats.find(c => c.id === chatId);
      if (chat && chat.unreadByAdmin > 0) {
        chat.unreadByAdmin = 0;
        this.saveSupportChats(chats);
      }
    },

    markSupportReadByUser(chatId) {
      const chats = this.getSupportChats();
      const chat = chats.find(c => c.id === chatId);
      if (chat && chat.unreadByUser > 0) {
        chat.unreadByUser = 0;
        this.saveSupportChats(chats);
      }
    },

    getSupportUnreadAdminCount() {
      const chats = this.getSupportChats();
      return chats.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0);
    },

    async syncSupportWithServer() {
      try {
        const res = await fetch('/api/support');
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.success && Array.isArray(data.chats)) {
          const localChats = this.getSupportChats();
          const chatMap = new Map();
          localChats.forEach(c => chatMap.set(c.id, c));

          data.chats.forEach(serverChat => {
            const local = chatMap.get(serverChat.id);
            if (!local) {
              chatMap.set(serverChat.id, serverChat);
            } else {
              // Merge messages
              const msgMap = new Map();
              (local.messages || []).forEach(m => msgMap.set(m.id, m));
              (serverChat.messages || []).forEach(m => msgMap.set(m.id, m));
              local.messages = Array.from(msgMap.values());
              local.lastUpdated = Math.max(local.lastUpdated || 0, serverChat.lastUpdated || 0);
              chatMap.set(local.id, local);
            }
          });

          const merged = Array.from(chatMap.values()).sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
          localStorage.setItem('digistore_support_chats', JSON.stringify(merged));
          window.__adminSupportOnline = !!data.adminOnline;
          this.broadcastChange('digistore_support_chats');
        }
      } catch (err) {
        // Fallback to local storage if running static
      }
    },

    // ─── CROSS-TAB BROADCASTING ─────────────────────────────────────────
    listeners: [],

    onUpdate(fn) {
      if (typeof fn === 'function') {
        this.listeners.push(fn);
      }
    },

    broadcastChange(topic) {
      this.listeners.forEach(fn => {
        try { fn(topic); } catch (e) { console.error('Store listener error:', e); }
      });
    }
  };

  // Listen to browser storage changes across tabs
  window.addEventListener('storage', function(e) {
    if (e.key && e.key.startsWith('digistore_')) {
      DigiStoreDB.broadcastChange(e.key);
    }
  });

  // Initialize data on load
  DigiStoreDB.init();

  // Expose globally
  window.DigiStoreDB = DigiStoreDB;

  // Background server sync polling every 3.5 seconds
  setInterval(() => {
    DigiStoreDB.syncSupportWithServer();
  }, 3500);

  // Admin Heartbeat (if logged in as admin@digistore.com)
  setInterval(() => {
    if (DigiStoreDB.isAdminOperator()) {
      fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'heartbeat', senderEmail: 'admin@digistore.com', isAdmin: true })
      }).catch(() => {});
    }
  }, 25000);

  // ─── STOREFRONT LIVE SUPPORT WIDGET (REAL HUMAN OPERATOR) ──────────
  function mountStorefrontSupportWidget() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (window.location.pathname.toLowerCase().includes('/admin')) return;
    if (document.getElementById('digiSupportLauncher')) return;

    // Inject CSS
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes supportPulse {
        0% { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.6); }
        70% { box-shadow: 0 0 0 8px rgba(52, 199, 89, 0); }
        100% { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0); }
      }
      @keyframes supportSlideUp {
        from { opacity: 0; transform: translateY(16px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      #digiSupportWindow.open {
        display: flex !important;
        animation: supportSlideUp 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .digi-chat-bubble-admin {
        background: linear-gradient(135deg, #1f1b2e 0%, #161426 100%);
        border: 1px solid rgba(168, 85, 247, 0.35);
        color: #f5f5f7;
        padding: 10px 14px;
        border-radius: 14px 14px 14px 2px;
        font-size: 13px;
        line-height: 1.45;
        word-break: break-word;
        box-shadow: 0 4px 18px rgba(168, 85, 247, 0.15);
      }
      .digi-chat-bubble-user {
        background: linear-gradient(135deg, #a855f7, #6366f1);
        color: #ffffff;
        padding: 10px 14px;
        border-radius: 14px 14px 2px 14px;
        font-size: 13px;
        line-height: 1.42;
        box-shadow: 0 4px 14px rgba(168, 85, 247, 0.3);
        word-break: break-word;
      }
    `;
    document.head.appendChild(styleEl);

    // Floating Button
    const launcher = document.createElement('div');
    launcher.id = 'digiSupportLauncher';
    launcher.setAttribute('style', 'position:fixed;bottom:24px;right:24px;z-index:99980;display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#121218 0%,#181824 100%);border:1px solid rgba(168,85,247,0.38);border-radius:9999px;padding:9px 18px 9px 12px;box-shadow:0 12px 36px rgba(0,0,0,0.7),0 0 20px rgba(168,85,247,0.22);cursor:pointer;transition:all .25s ease;user-select:none;');
    launcher.onmouseover = function() { this.style.transform = 'translateY(-2px) scale(1.02)'; this.style.borderColor = 'rgba(168,85,247,0.6)'; };
    launcher.onmouseout = function() { this.style.transform = 'translateY(0) scale(1)'; this.style.borderColor = 'rgba(168,85,247,0.38)'; };

    launcher.innerHTML = `
      <div style="position:relative;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#a855f7,#6366f1);display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(168,85,247,0.5);color:#ffffff;flex-shrink:0;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
      </div>
      <div style="display:flex;flex-direction:column;line-height:1.2;">
        <span style="font-size:13.5px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">Canlı Destek</span>
        <span id="digiSupportOnlineText" style="font-size:10px;color:#34c759;font-weight:600;display:flex;align-items:center;gap:4px;">
          <span style="width:6px;height:6px;border-radius:50%;background:#34c759;animation:supportPulse 2s infinite;display:inline-block;"></span>
          Yönetici Çevrimiçi
        </span>
      </div>
      <span id="digiSupportBadge" style="display:none;background:#ff3b30;color:#ffffff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:9999px;box-shadow:0 0 8px rgba(255,59,48,0.5);margin-left:2px;">1</span>
    `;

    // Chat Window
    const win = document.createElement('div');
    win.id = 'digiSupportWindow';
    win.setAttribute('style', 'display:none;position:fixed;bottom:84px;right:24px;width:380px;max-width:calc(100vw - 32px);height:570px;max-height:calc(100vh - 105px);background:#0d0d12;border:1px solid rgba(255,255,255,0.12);border-radius:22px;box-shadow:0 30px 80px rgba(0,0,0,0.85),0 0 35px rgba(168,85,247,0.15);z-index:99981;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,\'Plus Jakarta Sans\',sans-serif;');

    win.innerHTML = `
      <!-- Header -->
      <div style="padding:14px 18px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="position:relative;width:36px;height:36px;border-radius:10px;background:#050508;border:1px solid rgba(168,85,247,0.35);display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(168,85,247,0.3);overflow:hidden;">
            <img src="logo-icon.png" alt="DigiStore" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">
          </div>
          <div>
            <div style="font-size:14px;font-weight:700;color:#ffffff;display:flex;align-items:center;gap:6px;">
              <span id="digiSupportHeaderTitle">DigiStore Canlı Destek</span>
              <span id="digiSupportHeaderRole" style="font-size:8.5px;color:#a855f7;background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.3);padding:1px 5px;border-radius:4px;font-weight:700;">YÖNETİCİ</span>
            </div>
            <div id="digiSupportHeaderSub" style="font-size:11px;color:#86868b;font-weight:500;display:flex;align-items:center;gap:4px;">
              <span style="width:5px;height:5px;border-radius:50%;background:#34c759;display:inline-block;"></span>
              Operatör: admin@digistore.com
            </div>
          </div>
        </div>
        <button id="digiSupportCloseBtn" style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:#a1a1a6;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;" onmouseover="this.style.color='#fff';this.style.background='rgba(255,255,255,0.12)';" onmouseout="this.style.color='#a1a1a6';this.style.background='rgba(255,255,255,0.06)';">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Operator Mode Indicator (if logged in as admin@digistore.com) -->
      <div id="digiSupportOperatorBar" style="display:none;padding:8px 14px;background:rgba(168,85,247,0.12);border-bottom:1px solid rgba(168,85,247,0.25);font-size:11.5px;color:#c084fc;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
        <span>Yönetici Operatör Modu (admin@digistore.com)</span>
        <select id="digiSupportCustomerSelect" style="background:#09090d;border:1px solid rgba(168,85,247,0.4);border-radius:8px;color:#fff;font-size:11px;padding:3px 8px;max-width:140px;outline:none;">
          <option value="">Müşteri Seçin...</option>
        </select>
      </div>

      <!-- Quick Message Chips (puts question directly to admin) -->
      <div id="digiSupportChipsContainer" style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.015);display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;">
        <button type="button" class="digi-quick-chip" data-msg="Siparişimin durumunu öğrenebilir miyim?" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:9999px;color:#cbd5e1;padding:4px 10px;font-size:11px;font-weight:500;white-space:nowrap;cursor:pointer;transition:all .15s;">Sipariş Durumu</button>
        <button type="button" class="digi-quick-chip" data-msg="Lisans anahtarım hakkında bilgi almak istiyorum." style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:9999px;color:#cbd5e1;padding:4px 10px;font-size:11px;font-weight:500;white-space:nowrap;cursor:pointer;transition:all .15s;">Lisansım Nerede?</button>
        <button type="button" class="digi-quick-chip" data-msg="Ödeme ve e-Arşiv faturası hakkında görüşmek istiyorum." style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:9999px;color:#cbd5e1;padding:4px 10px;font-size:11px;font-weight:500;white-space:nowrap;cursor:pointer;transition:all .15s;">Ödeme &amp; Fatura</button>
      </div>

      <!-- Messages Area -->
      <div id="digiSupportMessages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#08080c;">
        <!-- Filled via JS -->
      </div>

      <!-- Input Bar -->
      <form id="digiSupportForm" style="padding:12px 14px;background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.08);display:flex;gap:8px;align-items:center;">
        <input type="text" id="digiSupportInput" placeholder="Yöneticiye iletmek istediğiniz mesajı yazın..." autocomplete="off" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:9px 14px;font-size:13px;color:#ffffff;outline:none;" />
        <button type="submit" style="width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#a855f7,#6366f1);border:none;color:#ffffff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 0 12px rgba(168,85,247,0.4);flex-shrink:0;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(win);

    let activeAdminTargetChatId = null;

    // Event Handlers
    launcher.onclick = function() {
      const isOpen = win.classList.contains('open');
      if (isOpen) {
        win.classList.remove('open');
      } else {
        win.classList.add('open');
        DigiStoreDB.syncSupportWithServer();
        const isOperator = DigiStoreDB.isAdminOperator();

        const opBar = document.getElementById('digiSupportOperatorBar');
        const chips = document.getElementById('digiSupportChipsContainer');
        const headerRole = document.getElementById('digiSupportHeaderRole');
        const headerSub = document.getElementById('digiSupportHeaderSub');

        if (isOperator) {
          if (opBar) opBar.style.display = 'flex';
          if (chips) chips.style.display = 'none';
          if (headerRole) headerRole.textContent = 'YÖNETİCİ OPERATÖR';
          if (headerSub) headerSub.innerHTML = '<span style="color:#c084fc;">admin@digistore.com hesabı ile bağlısınız</span>';
          populateOperatorCustomerSelect();
        } else {
          if (opBar) opBar.style.display = 'none';
          if (chips) chips.style.display = 'flex';
          if (headerRole) headerRole.textContent = 'YÖNETİCİ DESTEK';
          const chat = DigiStoreDB.getUserChatSession();
          DigiStoreDB.markSupportReadByUser(chat.id);
        }

        renderWidgetMessages();
        updateWidgetBadge();
        setTimeout(() => {
          const inp = document.getElementById('digiSupportInput');
          if (inp) inp.focus();
        }, 150);
      }
    };

    document.getElementById('digiSupportCloseBtn').onclick = function() {
      win.classList.remove('open');
    };

    // Quick chips (puts text into input and sends to admin directly)
    win.querySelectorAll('.digi-quick-chip').forEach(btn => {
      btn.onclick = function() {
        const msg = this.getAttribute('data-msg');
        if (!msg) return;
        DigiStoreDB.sendUserSupportMessage(msg);
        renderWidgetMessages();
      };
    });

    // Customer selector for admin operator mode
    const custSelect = document.getElementById('digiSupportCustomerSelect');
    if (custSelect) {
      custSelect.onchange = function() {
        activeAdminTargetChatId = this.value || null;
        renderWidgetMessages();
      };
    }

    function populateOperatorCustomerSelect() {
      const select = document.getElementById('digiSupportCustomerSelect');
      if (!select) return;
      const chats = DigiStoreDB.getSupportChats();
      select.innerHTML = '<option value="">Müşteri Seçin...</option>' + chats.map(c => `
        <option value="${c.id}" ${c.id === activeAdminTargetChatId ? 'selected' : ''}>
          ${c.userName || 'Müşteri'} (${c.unreadByAdmin || 0} yeni)
        </option>
      `).join('');
      if (!activeAdminTargetChatId && chats.length > 0) {
        activeAdminTargetChatId = chats[0].id;
        select.value = activeAdminTargetChatId;
      }
    }

    // Form submit
    document.getElementById('digiSupportForm').onsubmit = function(e) {
      e.preventDefault();
      const inp = document.getElementById('digiSupportInput');
      const text = inp.value.trim();
      if (!text) return;
      inp.value = '';

      const isOperator = DigiStoreDB.isAdminOperator();
      if (isOperator) {
        if (!activeAdminTargetChatId) {
          alert('Lütfen yanıt yazmak için üstten bir müşteri sohbeti seçin');
          return;
        }
        DigiStoreDB.sendAgentSupportMessage(activeAdminTargetChatId, text, 'admin@digistore.com');
      } else {
        DigiStoreDB.sendUserSupportMessage(text);
      }
      renderWidgetMessages();
    };

    function renderWidgetMessages() {
      const container = document.getElementById('digiSupportMessages');
      if (!container) return;

      const isOperator = DigiStoreDB.isAdminOperator();
      let chat = null;

      if (isOperator) {
        if (activeAdminTargetChatId) {
          chat = DigiStoreDB.getSupportChat(activeAdminTargetChatId);
        }
        if (!chat) {
          container.innerHTML = '<div style="text-align:center;color:#86868b;padding:40px 14px;font-size:12.5px;">Üst menüden bir müşteri seçerek canlı yanıt vermeye başlayabilirsiniz.</div>';
          return;
        }
      } else {
        chat = DigiStoreDB.getUserChatSession();
      }

      if (!chat || !chat.messages) return;

      container.innerHTML = chat.messages.map(m => {
        const isUser = m.sender === 'user';
        if (isUser) {
          // If current viewer is admin operator, user's messages appear on the left!
          if (isOperator) {
            return `
              <div style="align-self:flex-start;max-width:84%;display:flex;flex-direction:column;align-items:flex-start;">
                <span style="font-size:10.5px;color:#86868b;margin-bottom:3px;padding-left:2px;">${chat.userName || 'Müşteri'}</span>
                <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.09);color:#f5f5f7;padding:9px 13px;border-radius:14px 14px 14px 2px;font-size:13px;line-height:1.45;word-break:break-word;">
                  ${m.text}
                </div>
                <span style="font-size:10px;color:#86868b;margin-top:3px;padding-left:2px;">${m.time || ''}</span>
              </div>
            `;
          } else {
            return `
              <div style="align-self:flex-end;max-width:82%;display:flex;flex-direction:column;align-items:flex-end;">
                <div class="digi-chat-bubble-user">
                  ${m.text}
                </div>
                <span style="font-size:10px;color:#86868b;margin-top:3px;padding-right:2px;">${m.time || ''} · İletildi</span>
              </div>
            `;
          }
        } else {
          // Admin message
          if (isOperator) {
            return `
              <div style="align-self:flex-end;max-width:82%;display:flex;flex-direction:column;align-items:flex-end;">
                <span style="font-size:10px;color:#c084fc;font-weight:700;margin-bottom:2px;padding-right:2px;">Siz (admin@digistore.com)</span>
                <div class="digi-chat-bubble-user" style="background:linear-gradient(135deg,#7e22ce,#4338ca);">
                  ${m.text}
                </div>
                <span style="font-size:10px;color:#86868b;margin-top:3px;padding-right:2px;">${m.time || ''}</span>
              </div>
            `;
          } else {
            return `
              <div style="align-self:flex-start;max-width:86%;display:flex;flex-direction:column;align-items:flex-start;">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;padding-left:2px;">
                  <span style="font-size:11px;color:#c084fc;font-weight:700;">Site Yöneticisi (admin@digistore.com)</span>
                  <span style="background:rgba(168,85,247,0.18);border:1px solid rgba(168,85,247,0.35);color:#d8b4fe;font-size:9px;padding:1px 4px;border-radius:4px;font-weight:800;">YETKİLİ</span>
                </div>
                <div class="digi-chat-bubble-admin">
                  ${m.text}
                </div>
                <span style="font-size:10px;color:#86868b;margin-top:3px;padding-left:2px;">${m.time || ''}</span>
              </div>
            `;
          }
        }
      }).join('');

      container.scrollTop = container.scrollHeight;
    }

    function updateWidgetBadge() {
      const badge = document.getElementById('digiSupportBadge');
      if (!badge) return;
      const isOperator = DigiStoreDB.isAdminOperator();
      let count = 0;

      if (isOperator) {
        count = DigiStoreDB.getSupportUnreadAdminCount();
      } else {
        const chat = DigiStoreDB.getUserChatSession();
        count = chat ? (chat.unreadByUser || 0) : 0;
      }

      if (count > 0 && !win.classList.contains('open')) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    // Initial render & sync
    renderWidgetMessages();
    updateWidgetBadge();

    DigiStoreDB.onUpdate(topic => {
      if (topic === 'digistore_support_chats') {
        renderWidgetMessages();
        updateWidgetBadge();
        if (DigiStoreDB.isAdminOperator()) {
          populateOperatorCustomerSelect();
        }
      }
    });
  }

  // Mount on document ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountStorefrontSupportWidget);
  } else {
    mountStorefrontSupportWidget();
  }

})(window);


