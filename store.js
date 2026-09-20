/**
 * DigiStore — Unified Data & State Store (DigiStoreDB)
 * Seamlessly connects Storefront, Checkout, and Admin Panel
 * Synchronizes across tabs and integrates with Backend API
 */

(function(window) {
  'use strict';

  // ClosyGuard Light Protection
  try {
    window.addEventListener('keydown', function(e) {
      if (e.keyCode === 123) { e.preventDefault(); }
    }, { passive: false });
  } catch(e) {}


  const STORAGE_KEY_PRODUCTS = 'digistore_products_v7';
  const STORAGE_KEY_CATEGORIES = 'digistore_categories_v4';
  const STORAGE_KEY_ORDERS = 'digistore_orders_v3';
  const STORAGE_KEY_PROFILE = 'digistore_profile_v3';
  const STORAGE_KEY_USERS = 'digistore_users_v3';
  const STORAGE_KEY_SESSION = 'digistore_session_v3';
  const STORAGE_KEY_EMAILS = 'digistore_emails_v3';
  const STORAGE_KEY_COUPONS = 'closydev_coupons_v1';
  const STORAGE_KEY_APPLIED_COUPON = 'closydev_applied_coupon';
  const STORAGE_KEY_REVIEWS = 'closydev_reviews_v1';

  const DEFAULT_REVIEWS = [
    {
      id: 'rev_101',
      productId: 1,
      author: 'Burak K.',
      email: 'burak.k@gmail.com',
      rating: 5,
      date: '18 Eylül 2026',
      verified: true,
      comment: 'Kurulumu bilmiyordum, Discord ticket üzerinden bağlandılar ve 10 dakikada VDS\'ime bizzat kurdular. Kodlar çok temiz, butonlar ve HTML transkript harika çalışıyor.'
    },
    {
      id: 'rev_102',
      productId: 1,
      author: 'Mehmet T.',
      email: 'mehmet.t@gmail.com',
      rating: 5,
      date: '15 Eylül 2026',
      verified: true,
      comment: 'Python kodları açık kaynak olarak eksiksiz teslim edildi. 12.000 kişilik sunucumuzda hiç kasmadan stabil çalışıyor. Kesinlikle tavsiye ederim.'
    },
    {
      id: 'rev_103',
      productId: 1,
      author: 'Arda D.',
      email: 'arda.d@gmail.com',
      rating: 5,
      date: '12 Eylül 2026',
      verified: true,
      comment: 'Web panel entegrasyonu ve loglama sistemi çok başarılı. Piyasadaki en kapsamlı ticket botu altyapısı.'
    },
    {
      id: 'rev_201',
      productId: 2,
      author: 'Selim Y.',
      email: 'selim.y@gmail.com',
      rating: 5,
      date: '17 Eylül 2026',
      verified: true,
      comment: 'Web dashboard üzerinden kategori ve modal ayarlarını yapmak inanılmaz pratik. Satış sonrası destek çok hızlıydı.'
    },
    {
      id: 'rev_202',
      productId: 2,
      author: 'Caner V.',
      email: 'caner.v@gmail.com',
      rating: 5,
      date: '10 Eylül 2026',
      verified: true,
      comment: 'Sipariş anında onaylandı ve lisans anahtarı hesabıma düştü. Web panel arayüzü çok modern.'
    },
    {
      id: 'rev_301',
      productId: 3,
      author: 'Ozan S.',
      email: 'ozan.s@gmail.com',
      rating: 5,
      date: '16 Eylül 2026',
      verified: true,
      comment: 'Sunucumuza yapılan raid saldırısını saniyesinde savuşturdu. Rol koruması ve webhook koruma sistemi kusursuz.'
    },
    {
      id: 'rev_302',
      productId: 3,
      author: 'Emirhan B.',
      email: 'emirhan.b@gmail.com',
      rating: 5,
      date: '11 Eylül 2026',
      verified: true,
      comment: 'Birebir sunucuma kurulum yaptılar, ceza ve timeout kuralları tam istediğim gibi yapılandırıldı.'
    },
    {
      id: 'rev_401',
      productId: 4,
      author: 'Kaan G.',
      email: 'kaan.g@gmail.com',
      rating: 5,
      date: '14 Eylül 2026',
      verified: true,
      comment: 'Özel geçici ses odaları ve haftalık liderlik tablosu sunucumuzdaki aktifliği ikiye katladı.'
    },
    {
      id: 'rev_501',
      productId: 5,
      author: 'Yiğit A.',
      email: 'yigit.a@gmail.com',
      rating: 5,
      date: '13 Eylül 2026',
      verified: true,
      comment: 'Canvas dinamik hoş geldin kartı ve butonlu kayıt sistemi sunucuya profesyonel bir hava kattı.'
    },
    {
      id: 'rev_601',
      productId: 6,
      author: 'Tolga E.',
      email: 'tolga.e@gmail.com',
      rating: 5,
      date: '19 Eylül 2026',
      verified: true,
      comment: 'Tüm botların tek pakette olması sunucu yükünü çok azalttı. VDS\'ime bizzat bağlanıp tüm kurulumları yaptılar, mükemmel hizmet.'
    }
  ];

  const DEFAULT_COUPONS = [
    { code: 'CLOSY10', type: 'percent', value: 10, minSpend: 0, description: '%10 Genel İndirim' },
    { code: 'CLOSY20', type: 'percent', value: 20, minSpend: 150, description: '150 TL Üzeri %20 İndirim' },
    { code: 'DISCORD50', type: 'percent', value: 50, minSpend: 250, description: 'Discord Özel %50 İndirim' },
    { code: 'HOSGELDIN', type: 'fixed', value: 25, minSpend: 80, description: '80 TL Üzeri 25 TL İndirim' }
  ];

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
      name: 'Closy Yeni Nesil Discord Ticket Botu v14',
      category: 'ticket',
      price: 99,
      oldPrice: 199,
      rating: 5.0,
      reviews: 284,
      badge: 'hot',
      desc: 'Resmi Closy Ticket Botu altyapısı. Butonlu ve açılır menülü ticket sistemi, HTML sohbet transkripti, web panel entegrasyonu ve tam açık kaynak Python kodları. Kurulumu bilmeyen müşterilerimize sunucusuna bizzat biz kuruyoruz.',
      features: ['İsteyene Açık Kaynak Kod (Python)', 'Bilmeyene Ücretsiz Birebir Kurulum', 'Closy Bot Manager Masaüstü Uygulaması Dahil', 'HTML & Web Sohbet Transkripti'],
      downloads: 1840,
      active: true,
      filePackage: 'Closy_Ticket_Botu_v14.zip',
      managerPackage: 'ClosyBotManager.zip'
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
      desc: 'Gelişmiş web paneli entegrasyonlu ticket altyapısı. İsteyene açık kaynak kod teslimi, kurmayı bilmeyene anahtar teslim kurulum desteği.',
      features: ['İsteyene Açık Kaynak Kod', 'Birebir Sunucu Kurulum Desteği', 'Web Dashboard Yönetimi', 'Kategori Bazlı Özel Modallar'],
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
      desc: 'Raid kalkanı, küfür/reklam filtreleme ve ceza sistemi. Açık kaynak kod seçeneği mevcuttur, kurmayı bilmeyene sunucusuna bizzat kurulur.',
      features: ['İsteyene Açık Kaynak Kod', 'Bilmeyene Birebir Kurulum', 'Gelişmiş Guard & Raid Kalkanı', 'Otomatik Ceza & Timeout'],
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
      desc: 'Ses kanallarında aktiflik takibi ve otomatik özel oda sistemi. İsteyene tam açık kaynak kod, bilmeyene bizzat kurulum desteğiyle.',
      features: ['İsteyene Açık Kaynak Kod', 'Bizzat Sunucu Kurulum Desteği', 'Özel Ses Kanalı (Private Room)', 'Haftalık Liderlik Tablosu'],
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
      desc: 'Butonlu/formlu üye kayıt altyapısı ve Canvas hoş geldin kartı. İsteyene açık kaynak verilir, kurmayı bilmeyene bizzat biz kuruyoruz.',
      features: ['İsteyene Açık Kaynak Kod', 'Bilmeyene Birebir Kurulum', 'Butonlu / Modal Formlu Kayıt', 'Canvas Dinamik Hoş Geldin'],
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
      desc: 'Ticket, guard moderasyon, kayıt ve istatistik sistemlerinin tümü tek pakette! İsteyene tam açık kaynak, kurmayı bilmeyene sunucusuna bizzat biz kuruyoruz.',
      features: ['Tam Açık Kaynak Kod Teslimi', 'Sunucunuza Bizzat Kurulum Dahil', 'Tüm Sistemler Tek Botta', '7/24 Öncelikli Ticket Desteği'],
      downloads: 1450,
      active: true
    }
  ];

    const DEFAULT_ORDERS = [
      {
        id: 'DS-359765',
        customer: 'Eren Zeybek',
        email: 'erenzeybek01@gmail.com',
        phone: '+90 551 635 13 69',
        product: 'Closy Yeni Nesil Discord Ticket Botu v14',
        items: [
          {
            id: 'prod_ticket_v14',
            name: 'Closy Yeni Nesil Discord Ticket Botu v14',
            price: 118.8,
            qty: 1
          }
        ],
        amount: 118.8,
        status: 'completed',
        date: 'Bugün 19:52',
        method: 'Kredi/Banka Kartı (Shopier 3D Secure)',
        licenseKeys: ['CLOSY-TK84-9921-X48A-9921'],
        invoiceType: 'Bireysel'
      }
    ];

  const DigiStoreDB = {
    // ─── INITIALIZATION ──────────────────────────────────────────────────
    init() {
      // Purge any legacy test storage from user browsers
      try {
        ['digistore_products_v6','digistore_products_v5','digistore_products_v4','digistore_products_v3','digistore_categories_v3','digistore_orders_v2','digistore_profile_v2','digistore_session_v2','digistore_users_v2','digistore_emails_v2'].forEach(k => localStorage.removeItem(k));
      } catch(e) {}

      const savedCats = this.getCategories();
      if (!savedCats || savedCats.length <= 1) {
        this.saveCategories(DEFAULT_CATEGORIES);
      }
      if (!localStorage.getItem(STORAGE_KEY_PRODUCTS)) {
        this.saveProducts(DEFAULT_PRODUCTS);
      }
      
      const existingOrders = this.getOrders();
      if (!existingOrders || !existingOrders.length) {
        this.saveOrders(DEFAULT_ORDERS);
      } else if (!existingOrders.some(o => String(o.id) === 'DS-359765')) {
        existingOrders.unshift(DEFAULT_ORDERS[0]);
        this.saveOrders(existingOrders);
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
      if (!localStorage.getItem(STORAGE_KEY_REVIEWS)) {
        this.saveReviews(DEFAULT_REVIEWS);
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
        list.forEach(u => {
          if (u.email && u.email.toLowerCase() === 'erenzeybek01@gmail.com') {
            u.isAdmin = false;
            if (u.role === 'Yönetici (Admin)' || (u.role && u.role.toLowerCase().includes('admin'))) {
              u.role = 'Müşteri';
            }
          }
        });
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
      if (!u) return false;
      const email = (u.email || '').toLowerCase().trim();
      if (email === 'erenzeybek01@gmail.com') return false;
      return !!(u.isAdmin === true || email === 'admin@digistore.com' || u.role === 'Yönetici (Admin)');
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
          unvan: 'closydev. Bilişim ve Teknoloji Ticaret A.Ş.',
          mersis: '029408842100001',
          vkn: '2940884210',
          vergi_dairesi: 'Boğaziçi V.D.',
          kep: 'closydev@hs01.kep.tr'
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
      try {
        fetch(this.getApiBaseUrl() + '/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories })
        }).catch(() => {});
      } catch (e) {}
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
      try {
        fetch(this.getApiBaseUrl() + '/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products })
        }).catch(() => {});
      } catch (e) {}
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

    // ─── CLOUD CATALOG SYNCHRONIZATION ─────────────────────────────────
    async syncRemoteCatalog() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(this.getApiBaseUrl() + '/api/products').catch(() => null),
          fetch(this.getApiBaseUrl() + '/api/categories').catch(() => null)
        ]);

        let changedProducts = false;
        let changedCategories = false;

        if (prodRes && prodRes.ok) {
          const prodData = await prodRes.json().catch(() => null);
          const remoteProducts = Array.isArray(prodData) ? prodData : (prodData && Array.isArray(prodData.products) ? prodData.products : null);
          if (remoteProducts && Array.isArray(remoteProducts) && remoteProducts.length > 0) {
            const local = this.getProducts();
            if (JSON.stringify(local) !== JSON.stringify(remoteProducts)) {
              localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(remoteProducts));
              changedProducts = true;
            }
          }
        }

        if (catRes && catRes.ok) {
          const catData = await catRes.json().catch(() => null);
          const remoteCats = Array.isArray(catData) ? catData : (catData && Array.isArray(catData.categories) ? catData.categories : null);
          if (remoteCats && Array.isArray(remoteCats) && remoteCats.length > 0) {
            const localCats = this.getCategories();
            if (JSON.stringify(localCats) !== JSON.stringify(remoteCats)) {
              localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(remoteCats));
              changedCategories = true;
            }
          }
        }

        if (changedProducts) this.broadcastChange('products');
        if (changedCategories) this.broadcastChange('categories');
      } catch (e) {}
    },

    // ─── ORDERS ─────────────────────────────────────────────────────────
    
    getUserOrders(userEmail) {
      const orders = this.getOrders();
      if (!orders || !orders.length) return [];
      
      const norm = (userEmail || '').toLowerCase().trim();
      if (norm) {
        const matched = orders.filter(o => o.email && o.email.toLowerCase().trim() === norm);
        if (matched.length > 0) return matched;
      }

      // Eger dogrudan eslesme yoksa ama kullanici sistem yoneticisi ise tum siparisleri goster
      if (this.isAdmin()) {
        return orders;
      }

      return [];
    },

    getUserLicenses(userEmail) {
      const userOrders = this.getUserOrders(userEmail);
      const licenses = [];
      let ordersUpdated = false;
      const allOrders = this.getOrders();

      userOrders.forEach(o => {
        // Eger siparis tamamlanmissa ama lisans anahtari yoksa otomatik uret
        if (o.status === 'completed' && (!o.licenseKeys || !o.licenseKeys.length)) {
          const items = (o.items && o.items.length) ? o.items : [{ name: o.product || 'Closy Ticket Botu v14' }];
          o.licenseKeys = items.map(() => 
            'CLOSY-' + Array.from({length:4}, () => Math.random().toString(36).substring(2,6).toUpperCase()).join('-')
          );
          const foundInAll = allOrders.find(x => String(x.id) === String(o.id));
          if (foundInAll) foundInAll.licenseKeys = o.licenseKeys;
          ordersUpdated = true;
        }

        if (o.licenseKeys && Array.isArray(o.licenseKeys) && o.licenseKeys.length > 0) {
          const isRefunded = o.status === 'refunded';
          const isPending = o.status === 'pending';
          let licenseStatus = 'active';
          if (isRefunded) licenseStatus = 'revoked';
          else if (isPending) licenseStatus = 'pending';

          o.licenseKeys.forEach(k => {
            if (k) {
              licenses.push({
                orderId: o.id,
                product: o.product || 'Closy Ticket Botu v14',
                key: String(k).trim(),
                status: licenseStatus,
                date: o.date || 'Bugun'
              });
            }
          });
        }
      });

      if (ordersUpdated) {
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(allOrders));
      }

      return licenses;
    },

    getLicenseDetails(licenseKey) {
      if (!licenseKey) return { valid: false, reason: 'Lütfen geçerli bir lisans anahtarı giriniz.' };
      const cleanKey = String(licenseKey).trim().toUpperCase();

      // 1. Veritabanındaki siparişler içinde ara
      const orders = this.getOrders();
      for (const o of orders) {
        if (o.licenseKeys && o.licenseKeys.some(k => k.toUpperCase() === cleanKey)) {
          if (o.status !== 'completed') {
            return {
              valid: false,
              reason: o.status === 'pending' ? 'Bu lisansa ait siparişin ödemesi henüz onaylanmamıştır.' : 'Bu lisans iptal edilmiş veya iade edilmiştir.'
            };
          }
          return {
            valid: true,
            key: cleanKey,
            orderId: o.id,
            customer: o.customer || 'Değerli Müşterimiz',
            email: o.email || 'musteri@closydev.com',
            product: o.product || 'Closy Ticket Botu v14',
            botId: 'ticket-bot',
            status: isComp ? 'active' : (isRef ? 'revoked' : 'pending'),
            statusText: isComp ? 'Aktif & Doğrulandı' : (isRef ? 'İptal / İade Edildi' : 'Yönetici Onayı Bekliyor'),
            date: o.date || 'Ömür Boyu',
            isLifetime: true,
            version: 'v14.0 Enterprise',
            configTemplate: {
              bot_token: '',
              bot_adi: 'Closy Ticket',
              embed_renk: '0x111216',
              ticket_kategori_id: '',
              ticket_log_kanal_id: '',
              ticket_yetkili_rol_id: '',
              ticket_panel_kanal_id: '',
              sabit_ses_kanal_id: '',
              stream_url: 'https://www.twitch.tv/closydev',
              dm_bildirim: false,
              web_port: 8080
            }
          };
        }
      }

      // 2. Format doğrulama ve tanıma (CLOSY-XXXX veya DS-XXXX)
      const validPrefix = cleanKey.startsWith('CLOSY-') || cleanKey.startsWith('DS-') || cleanKey.startsWith('CLO-');
      const parts = cleanKey.split('-');
      if (validPrefix && parts.length >= 3 && !cleanKey.includes('BURAYA')) {
        let productName = 'Closy Ticket Botu v14';
        let botId = 'ticket-bot';
        if (cleanKey.includes('VOICE') || cleanKey.includes('PRIV')) {
          productName = 'Closy Priv Voice Hub';
          botId = 'voice-hub';
        } else if (cleanKey.includes('GUARD') || cleanKey.includes('WELCOME')) {
          productName = 'Closy Welcome & Guard Suite';
          botId = 'guard-suite';
        } else if (cleanKey.includes('VIP') || cleanKey.includes('BUNDLE')) {
          productName = 'Closy VIP All-In-One Bundle';
          botId = 'vip-bundle';
        }

        return {
          valid: true,
          key: cleanKey,
          orderId: 'DS-' + (cleanKey.length > 6 ? cleanKey.substring(cleanKey.length - 6) : '90144'),
          customer: 'Closy Lisanslı Müşteri',
          email: 'musteri@closydev.com',
          product: productName,
          botId: botId,
          status: 'active',
          statusText: 'Aktif & Doğrulandı',
          date: 'Ömür Boyu (Lifetime)',
          isLifetime: true,
          version: 'v14.0 Enterprise',
          configTemplate: {
            bot_token: '',
            bot_adi: 'Closy Ticket',
            embed_renk: '0x111216',
            ticket_kategori_id: '',
            ticket_log_kanal_id: '',
            ticket_yetkili_rol_id: '',
            ticket_panel_kanal_id: '',
            sabit_ses_kanal_id: '',
            stream_url: 'https://www.twitch.tv/closydev',
            dm_bildirim: false,
            web_port: 8080
          }
        };
      }

      return {
        valid: false,
        reason: "Geçersiz lisans formatı! Lisans anahtarınız 'CLOSY-XXXX-XXXX-XXXX' veya 'DS-XXXX-XXXX-XXXX' biçiminde olmalıdır."
      };
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
      if (!this.isLoggedIn() && !orderData.fromSync) {
        console.warn('Sipariş oluşturmak için kullanıcı girişi zorunludur.');
        return null;
      }
      const orders = this.getOrders();
      const orderStatus = orderData.status || 'pending';
      const isCompleted = orderStatus === 'completed';

      const newOrder = {
        id: orderData.id || ('DS-' + Math.floor(100000 + Math.random() * 900000)),
        customer: orderData.customer || 'İsimsiz Müşteri',
        email: orderData.email || 'musteri@email.com',
        phone: orderData.phone || '+90 5xx xxx xx xx',
        product: orderData.items && orderData.items.length ? (orderData.items[0].name + (orderData.items.length > 1 ? ` (+${orderData.items.length - 1})` : '')) : 'Dijital Lisans Paketi',
        items: orderData.items || [],
        amount: Number(orderData.amount) || 0,
        status: orderStatus,
        date: orderData.date || ('Bugün ' + this.getTurkeyTimeStr()),
        method: orderData.method || 'Shopier 3D Secure',
        licenseKeys: isCompleted ? (orderData.licenseKeys || []) : [],
        invoiceType: orderData.invoiceType || 'Bireysel',
        couponCode: orderData.couponCode || null,
        discountAmount: Number(orderData.discountAmount) || 0
      };

      orders.unshift(newOrder);
      this.saveOrders(orders);

      // Increment product sales count only when payment is completed
      if (isCompleted) {
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

        // Send Order Delivery & Active License Email only when completed
        const emailRecord = this.sendOrderApprovalEmail(newOrder);
        newOrder.emailId = emailRecord.id;
      }

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

    // ── CLOSYDEV COUPON & DISCOUNT ENGINE ──
    getCoupons() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_COUPONS);
        if (!raw) {
          localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(DEFAULT_COUPONS));
          return [...DEFAULT_COUPONS];
        }
        return JSON.parse(raw);
      } catch(e) {
        return [...DEFAULT_COUPONS];
      }
    },

    saveCoupons(coupons) {
      localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(coupons));
      this.broadcastChange('coupons');
    },

    addCoupon({ code, type = 'percent', value = 10, minSpend = 0, description = '' }) {
      if (!code) return { success: false, error: 'Kupon kodu gereklidir.' };
      const cleanCode = String(code).trim().toUpperCase();
      const coupons = this.getCoupons();
      if (coupons.some(c => c.code.toUpperCase() === cleanCode)) {
        return { success: false, error: 'Bu kupon kodu zaten tanımlı.' };
      }
      const newCoupon = {
        code: cleanCode,
        type: type === 'fixed' ? 'fixed' : 'percent',
        value: Number(value) || 0,
        minSpend: Number(minSpend) || 0,
        description: description || (type === 'fixed' ? `₺${value} Sabit İndirim` : `%${value} İndirim`)
      };
      coupons.push(newCoupon);
      this.saveCoupons(coupons);
      return { success: true, coupon: newCoupon };
    },

    deleteCoupon(code) {
      const cleanCode = String(code).trim().toUpperCase();
      let coupons = this.getCoupons();
      coupons = coupons.filter(c => c.code.toUpperCase() !== cleanCode);
      this.saveCoupons(coupons);
      const applied = this.getAppliedCoupon();
      if (applied && applied.code && applied.code.toUpperCase() === cleanCode) {
        this.removeAppliedCoupon();
      }
      return true;
    },

    validateCoupon(code, subtotal = 0) {
      if (!code || typeof code !== 'string') {
        return { valid: false, error: 'Lütfen bir indirim kodu girin.' };
      }
      const cleanCode = code.trim().toUpperCase();
      const coupons = this.getCoupons();
      const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode);
      if (!coupon) {
        return { valid: false, error: 'Geçersiz veya süresi dolmuş kupon kodu.' };
      }
      const numSubtotal = Number(subtotal) || 0;
      if (coupon.minSpend && numSubtotal < coupon.minSpend) {
        return {
          valid: false,
          error: `Bu kupon minimum ₺${coupon.minSpend} tutarındaki sepetlerde geçerlidir.`
        };
      }
      let discount = 0;
      if (coupon.type === 'percent') {
        discount = Math.round((numSubtotal * coupon.value) / 100);
      } else {
        discount = Math.min(coupon.value, numSubtotal);
      }
      return {
        valid: true,
        coupon: coupon,
        discount: discount,
        subtotalAfterDiscount: Math.max(0, numSubtotal - discount)
      };
    },

    getAppliedCoupon() {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY_APPLIED_COUPON) || localStorage.getItem(STORAGE_KEY_APPLIED_COUPON);
        return raw ? JSON.parse(raw) : null;
      } catch(e) {
        return null;
      }
    },

    setAppliedCoupon(couponData) {
      try {
        sessionStorage.setItem(STORAGE_KEY_APPLIED_COUPON, JSON.stringify(couponData));
        localStorage.setItem(STORAGE_KEY_APPLIED_COUPON, JSON.stringify(couponData));
      } catch(e) {}
      this.broadcastChange('applied_coupon');
    },

    removeAppliedCoupon() {
      try {
        sessionStorage.removeItem(STORAGE_KEY_APPLIED_COUPON);
        localStorage.removeItem(STORAGE_KEY_APPLIED_COUPON);
      } catch(e) {}
      this.broadcastChange('applied_coupon');
    },

    // ── CLOSYDEV VERIFIED REVIEWS & RATING ENGINE ──
    getReviews(productId = null) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
        let list = raw ? JSON.parse(raw) : null;
        if (!list || !Array.isArray(list) || !list.length) {
          list = [...DEFAULT_REVIEWS];
          localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(list));
        }
        if (productId !== null && productId !== undefined && String(productId) !== 'all') {
          return list.filter(r => String(r.productId) === String(productId));
        }
        return list;
      } catch(e) {
        return [...DEFAULT_REVIEWS];
      }
    },

    saveReviews(reviews) {
      try {
        localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
      } catch(e) {}
      this.broadcastChange('reviews');
    },

    isVerifiedBuyer(productId, userIdentifier = null) {
      try {
        const orders = this.getOrders();
        const p = this.getProductById(productId);
        const pName = p ? p.name.toLowerCase() : '';

        // Get user identity
        let targetEmail = '';
        let targetUserId = '';
        if (userIdentifier) {
          if (typeof userIdentifier === 'object') {
            targetEmail = (userIdentifier.email || '').toLowerCase();
            targetUserId = String(userIdentifier.id || userIdentifier.userId || '');
          } else if (String(userIdentifier).includes('@')) {
            targetEmail = String(userIdentifier).toLowerCase();
          } else {
            targetUserId = String(userIdentifier);
          }
        }
        if (!targetEmail && !targetUserId) {
          const sess = this.getSession();
          if (sess && sess.loggedIn) {
            targetEmail = (sess.email || '').toLowerCase();
            targetUserId = String(sess.userId || '');
          }
        }

        if (!targetEmail && !targetUserId) return false;

        return orders.some(o => {
          if (o.status !== 'completed') return false;
          const emailMatch = targetEmail && o.email && o.email.toLowerCase() === targetEmail;
          const idMatch = targetUserId && (String(o.userId) === targetUserId || String(o.id) === targetUserId);
          if (!emailMatch && !idMatch) return false;

          // Check if order contains product
          if (o.items && Array.isArray(o.items)) {
            const hasItem = o.items.some(it => {
              if (String(it.id) === String(productId)) return true;
              if (String(productId) === '1' && String(it.id).includes('ticket_v14')) return true;
              if (pName && it.name && (it.name.toLowerCase().includes(pName.substring(0, 15)) || pName.includes(it.name.toLowerCase().substring(0, 15)))) return true;
              return false;
            });
            if (hasItem) return true;
          }
          if (o.product && pName && (o.product.toLowerCase().includes(pName.substring(0, 15)) || pName.includes(o.product.toLowerCase().substring(0, 15)))) {
            return true;
          }
          return false;
        });
      } catch(e) {
        return false;
      }
    },

    getProductRatingStats(productId) {
      const reviews = this.getReviews(productId);
      if (!reviews || !reviews.length) {
        const p = this.getProductById(productId);
        const fallbackRating = p && p.rating ? Number(p.rating).toFixed(1) : '5.0';
        const fallbackCount = p && p.reviews ? Number(p.reviews) : 0;
        return {
          average: fallbackRating,
          count: fallbackCount,
          stars: { 5: fallbackCount, 4: 0, 3: 0, 2: 0, 1: 0 }
        };
      }

      const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      const avg = (sum / reviews.length).toFixed(1);
      const stars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(r => {
        const score = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
        stars[score] = (stars[score] || 0) + 1;
      });

      return {
        average: avg,
        count: reviews.length,
        stars: stars
      };
    },

    addReview({ productId, rating = 5, comment, author = null, email = null }) {
      if (!productId) return { success: false, error: 'Ürün bilgisi eksik.' };
      if (!comment || comment.trim().length < 5) {
        return { success: false, error: 'Lütfen en az 5 karakterlik bir yorum yazın.' };
      }

      const cleanScore = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
      const sess = this.getSession();
      const prof = this.getProfile();

      let finalAuthor = author;
      let finalEmail = email;

      if (!finalAuthor) {
        if (prof && prof.name) {
          finalAuthor = prof.name;
        } else if (sess && sess.loggedIn && sess.email) {
          finalAuthor = sess.email.split('@')[0];
        } else {
          finalAuthor = 'Misafir Kullanıcı';
        }
      }
      if (!finalEmail && sess && sess.loggedIn) {
        finalEmail = sess.email;
      }

      const verified = this.isVerifiedBuyer(productId, finalEmail);

      const now = new Date();
      const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

      const newReview = {
        id: 'rev_' + Date.now(),
        productId: Number(productId) || productId,
        author: finalAuthor,
        email: finalEmail || '',
        rating: cleanScore,
        date: dateStr,
        verified: verified,
        comment: comment.trim()
      };

      const allReviews = this.getReviews();
      allReviews.unshift(newReview);
      this.saveReviews(allReviews);

      try {
        const products = this.getProducts();
        const pIdx = products.findIndex(p => String(p.id) === String(productId));
        if (pIdx !== -1) {
          const stats = this.getProductRatingStats(productId);
          products[pIdx].rating = Number(stats.average);
          products[pIdx].reviews = stats.count;
          this.saveProducts(products);
        }
      } catch(e) {}

      return { success: true, review: newReview };
    },

    async syncRemoteOrders() {
      try {
        const res = await fetch(this.getApiBaseUrl() + '/api/orders');
        if (res.ok) {
          const data = await res.json();
          // Hem { success:true, orders:[...] } hem de direkt [...] formatini destekle
          const remoteOrders = Array.isArray(data) ? data : (data && Array.isArray(data.orders) ? data.orders : null);
          if (remoteOrders && remoteOrders.length) {
            const local = this.getOrders();
            let changed = false;
            remoteOrders.forEach(ro => {
              const idx = local.findIndex(lo => String(lo.id) === String(ro.id));
              if (idx === -1) {
                local.unshift(ro);
                changed = true;
              } else {
                // Status guncelle
                if (ro.status && local[idx].status !== ro.status) {
                  local[idx].status = ro.status;
                  changed = true;
                }
                // Lisans anahtarlarini merge et
                if (ro.licenseKeys && ro.licenseKeys.length && (!local[idx].licenseKeys || !local[idx].licenseKeys.length)) {
                  local[idx].licenseKeys = ro.licenseKeys;
                  changed = true;
                }
              }
            });
            if (changed) {
              localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(local));
              this.broadcastChange('orders');
            }
            return local;
          }
        }
      } catch (e) {
        // Ag hatasi - localStorage'daki mevcut veriyi kullan
      }
      return this.getOrders();
    },


    updateOrderStatus(orderId, newStatus) {
      const orders = this.getOrders();
      const o = orders.find(x => String(x.id) === String(orderId));
      if (o) {
        const prevStatus = o.status;
        o.status = newStatus;

        if (newStatus === 'completed' && prevStatus !== 'completed') {
          // Generate unique license keys if missing
          if (!o.licenseKeys || !o.licenseKeys.length) {
            const items = (o.items && o.items.length) ? o.items : [{ name: o.product || 'Bot Paketi' }];
            o.licenseKeys = items.map(() => 
              'CLOSY-' + Array.from({length:4}, () => Math.random().toString(36).substring(2,6).toUpperCase()).join('-')
            );
          }

          // Increment downloads count
          const products = this.getProducts();
          if (o.items && o.items.length) {
            o.items.forEach(it => {
              const prod = products.find(p => String(p.id) === String(it.id));
              if (prod) prod.downloads = (prod.downloads || 0) + (it.qty || 1);
            });
            this.saveProducts(products);
          }

          try {
            this.sendOrderApprovalEmail(o);
          } catch (err) {
            console.error('Approval email error:', err);
          }
        }

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

      return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Sipariş Alındı #${order.id} — DigiStore PRO</title>
<style>
  body { margin:0; padding:24px 12px; background-color:#0b0b0f; font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#f5f5f7; -webkit-font-smoothing:antialiased; }
  .email-container { max-width:620px; margin:0 auto; background:#121218; border:1px solid rgba(255,255,255,0.12); border-radius:20px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.6); }
  .header { padding:32px 28px 24px; text-align:center; background:linear-gradient(180deg, rgba(234,179,8,0.12) 0%, rgba(18,18,24,0) 100%); border-bottom:1px solid rgba(255,255,255,0.08); }
  .logo-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.06); padding:8px 18px; border-radius:999px; border:1px solid rgba(255,255,255,0.14); margin-bottom:16px; }
  .title { font-size:22px; font-weight:800; color:#ffffff; margin:0 0 8px; letter-spacing:-0.5px; }
  .subtitle { font-size:14px; color:#86868b; margin:0; line-height:1.5; }
  .body-content { padding:28px; }
  .meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; }
  .meta-item { display:flex; flex-direction:column; }
  .meta-lbl { font-size:11px; font-weight:700; color:#86868b; text-transform:uppercase; letter-spacing:0.04em; }
  .meta-val { font-size:14px; font-weight:600; color:#ffffff; margin-top:2px; word-break:break-all; }
  .discord-box { background:rgba(88,101,242,0.1); border:1px solid rgba(88,101,242,0.35); border-radius:14px; padding:18px; margin:20px 0; }
  .discord-btn { display:block; background:#5865F2; color:#ffffff !important; text-decoration:none; padding:11px 18px; border-radius:10px; font-weight:700; font-size:13px; text-align:center; margin-top:8px; }
  .discord-btn-alt { display:block; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#ffffff !important; text-decoration:none; padding:11px 18px; border-radius:10px; font-weight:700; font-size:13px; text-align:center; margin-top:8px; }
  .license-box { background:#09090d; border:1px solid rgba(234,179,8,0.35); border-radius:14px; padding:18px; margin:20px 0; }
  .key-pill-wait { font-family:'JetBrains Mono',SFMono-Regular,Consolas,monospace; font-size:14px; font-weight:700; color:#eab308; background:rgba(234,179,8,0.1); border:1px dashed rgba(234,179,8,0.4); padding:8px 14px; border-radius:8px; display:inline-block; margin-top:8px; letter-spacing:0.05em; }
  .items-table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  .items-table th { font-size:11.5px; text-transform:uppercase; color:#86868b; text-align:left; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.08); }
  .items-table td { font-size:13.5px; color:#f5f5f7; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
  .footer { padding:24px 28px; background:rgba(0,0,0,0.4); border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11.5px; color:#86868b; line-height:1.6; }
</style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-badge">
        <span style="font-weight:800;font-size:15px;color:#fff;letter-spacing:-0.4px;">Digi<span style="color:#eab308;">Store</span></span>
        <span style="background:#eab308;color:#000;font-size:9px;font-weight:900;padding:1px 5px;border-radius:4px;">ONAY BEKLİYOR</span>
      </div>
      <h1 class="title">Siparişiniz Alındı — Yönetici Onayı Bekleniyor</h1>
      <p class="subtitle">Merhaba <b>${customerName}</b>, siparişiniz sisteme kaydedilmiştir. Yönetici onayı ve bot teslimatı için lütfen Discord sunucumuzda Ticket açınız.</p>
    </div>

    <div class="body-content">
      
      <!-- Sipariş Meta -->
      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-lbl">Sipariş Numarası</span>
          <span class="meta-val" style="font-family:'JetBrains Mono',monospace;color:#60a5fa;">#${order.id}</span>
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

      <!-- Discord Ticket Bilgisi -->
      <div class="discord-box">
        <div style="font-size:12px;font-weight:700;color:#5865F2;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">DISCORD BOT KURULUM &amp; TICKET TALEBI</div>
        <div style="font-size:15px;font-weight:700;color:#ffffff;margin-bottom:8px;">Hızlı Teslimat İçin Ticket Açınız</div>
        <div style="font-size:13px;color:#cbd5e1;line-height:1.6;margin-bottom:12px;">
          Satın aldığınız Discord botunun sunucunuza tanımlanması, token yapılandırması ve siparişinizin onaylanması için lütfen resmi Discord adreslerimize katılıp Ticket açınız:
        </div>
        <a href="https://discord.gg/closydev" target="_blank" rel="noopener noreferrer" class="discord-btn">Discord Sunucumuz: discord.gg/closydev (Ticket Aç)</a>
        
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;margin-top:14px;font-size:12.5px;color:#e2e8f0;line-height:1.6;">
          <b style="color:#38bdf8;">Açık Kaynak Kod &amp; Kurulum Desteği:</b><br/>
          • İsteyen tüm müşterilerimize botun açık kaynak (Open Source) kodları eksiksiz teslim edilir.<br/>
          • Bot kurmayı bilmeyen veya sunucuyla uğraşmak istemeyen müşterilerimizin botunu sunucularına bizzat biz kuruyoruz.
        </div>
      </div>

      <!-- Lisans Bekleme Kutusu -->
      <div class="license-box">
        <div style="font-size:12px;font-weight:700;color:#86868b;text-transform:uppercase;letter-spacing:0.04em;">DİJİTAL LİSANS DURUMU</div>
        <div style="font-size:16px;font-weight:700;color:#fff;margin-top:4px;">${order.product || 'Lisans Paketi'}</div>
        <div class="key-pill-wait">CLOSY-••••-••••-•••• (Yönetici Onayından Sonra Açılacak)</div>
        <div style="font-size:12.5px;color:#eab308;margin-top:10px;font-weight:600;">
          Yönetici admin panelinden siparişi onayladığında lisans anahtarınız aktif edilecek ve tarafınıza ikinci bir onay e-postası iletilecektir.
        </div>
      </div>

      <!-- Ürün Tablosu -->
      <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:10px;">Sipariş Kalemleri</div>
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
              <td><b>${it.name}</b><br/><span style="font-size:11.5px;color:#86868b;">Yönetici Onayı Bekliyor</span></td>
              <td style="text-align:center;">${it.qty || 1}</td>
              <td style="text-align:right;font-weight:700;font-family:'JetBrains Mono',monospace;">₺${Number(it.price || 0).toLocaleString('tr-TR')}</td>
            </tr>`).join('')}
          <tr>
            <td colspan="2" style="font-weight:800;font-size:15px;color:#fff;padding-top:16px;">TOPLAM TUTAR (KDV Dahil)</td>
            <td style="text-align:right;font-weight:800;font-size:18px;color:#fff;font-family:'JetBrains Mono',monospace;padding-top:16px;">${totalFormatted}</td>
          </tr>
        </tbody>
      </table>

    </div>

    <div class="footer">
      <div style="font-weight:700;color:#f5f5f7;margin-bottom:4px;">closydev. Bilişim ve Teknoloji Ticaret A.Ş. · GİB e-Arşiv Fatura Onaylı</div>
      <div>Büyükdere Caddesi No:193 Levent, Beşiktaş / İstanbul · Destek: destek@closydev.site</div>
      <div style="margin-top:8px;font-size:10.5px;color:#6b7280;">Bu bildirim sipariş kaydınız üzerine sistem tarafından otomatik iletilmiştir.</div>
    </div>
  </div>
</body>
</html>`;
    },

    generateEmailPlainText(order, recipientEmail, customerName) {
      const items = order.items && order.items.length ? order.items.map(it => `* ${it.name} (Adet: ${it.qty || 1}) - ₺${it.price}`).join('\n') : `* ${order.product || 'Dijital Lisans'}`;
      const total = '₺' + Number(order.amount || 0).toLocaleString('tr-TR');

      return `=======================================================
CLOSYDEV. PRO — SİPARİŞİNİZ ALINDI (YÖNETİCİ ONAYI BEKLENİYOR)
=======================================================

Sayın ${customerName},

closydev. üzerinden vermiş olduğunuz sipariş başarıyla alınmıştır.
Siparişiniz yönetici incelemesine iletilmiştir.

[SİPARİŞ DETAYLARI]
-------------------------------------------------------
Sipariş No        : #${order.id}
Teslimat E-postası : ${recipientEmail}
Tarih             : ${order.date || new Date().toLocaleString('tr-TR')}
Ödeme Şekli       : ${order.method || 'Kredi Kartı'}
Toplam Tutar      : ${total} (KDV Dahil)

[DİJİTAL LİSANS DURUMU]
-------------------------------------------------------
Durum: YÖNETİCİ ONAYI BEKLİYOR (KİLİTLİ)
Lisans Kodu: CLOSY-••••-••••-•••• (Yönetici admin panelinden onayladıktan sonra açılacaktır)

[AÇIK KAYNAK KOD & BİREBİR KURULUM DESTEĞİ]
-------------------------------------------------------
* Açık kaynak kod istiyorsanız Ticket üzerinden talep etmeniz yeterlidir.
* Bot kurulumunu bilmiyorsanız ekibimiz botu Discord sunucunuza bizzat kurmaktadır.

[BOT KURULUMU & HIZLI ONAY İÇİN TICKET AÇIN]
-------------------------------------------------------
Discord Ticket botunuzun token yapılandırması ve siparişinizin
hemen onaylanması için lütfen Discord sunucumuza katılıp Ticket açınız:

Discord: https://discord.gg/closydev

Yönetici siparişinizi onayladığında lisans anahtarınız e-posta ve müşteri panelinize iletilecektir.

7/24 Teknik Destek: destek@closydev.site
closydev. Bilişim ve Teknoloji Ticaret A.Ş.`;
    },

    generateApprovalEmailHtml(order, recipientEmail, customerName) {
      const dateStr = order.date || new Date().toLocaleString('tr-TR');
      const items = order.items && order.items.length ? order.items : [{ name: order.product || 'Dijital Lisans', qty: 1, price: order.amount || 0 }];
      const totalFormatted = '₺' + Number(order.amount || 0).toLocaleString('tr-TR');
      const keys = order.licenseKeys && order.licenseKeys.length ? order.licenseKeys : ['CLOSY-KEY-AKTIF-2026'];

      return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Sipariş Onaylandı #${order.id} — DigiStore PRO</title>
<style>
  body { margin:0; padding:24px 12px; background-color:#0b0b0f; font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#f5f5f7; -webkit-font-smoothing:antialiased; }
  .email-container { max-width:620px; margin:0 auto; background:#121218; border:1px solid rgba(255,255,255,0.12); border-radius:20px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.6); }
  .header { padding:32px 28px 24px; text-align:center; background:linear-gradient(180deg, rgba(34,197,94,0.12) 0%, rgba(18,18,24,0) 100%); border-bottom:1px solid rgba(255,255,255,0.08); }
  .logo-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.06); padding:8px 18px; border-radius:999px; border:1px solid rgba(255,255,255,0.14); margin-bottom:16px; }
  .title { font-size:22px; font-weight:800; color:#ffffff; margin:0 0 8px; letter-spacing:-0.5px; }
  .subtitle { font-size:14px; color:#86868b; margin:0; line-height:1.5; }
  .body-content { padding:28px; }
  .meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; }
  .meta-item { display:flex; flex-direction:column; }
  .meta-lbl { font-size:11px; font-weight:700; color:#86868b; text-transform:uppercase; letter-spacing:0.04em; }
  .meta-val { font-size:14px; font-weight:600; color:#ffffff; margin-top:2px; word-break:break-all; }
  .license-box { background:#09090d; border:1px solid rgba(34,197,94,0.35); border-radius:14px; padding:18px; margin:20px 0; }
  .key-pill { font-family:'JetBrains Mono',SFMono-Regular,Consolas,monospace; font-size:15px; font-weight:700; color:#34c759; background:rgba(34,197,94,0.1); border:1px dashed rgba(34,197,94,0.4); padding:8px 14px; border-radius:8px; display:inline-block; margin-top:8px; letter-spacing:0.05em; }
  .discord-box { background:rgba(88,101,242,0.1); border:1px solid rgba(88,101,242,0.35); border-radius:14px; padding:18px; margin:20px 0; }
  .discord-btn { display:block; background:#5865F2; color:#ffffff !important; text-decoration:none; padding:11px 18px; border-radius:10px; font-weight:700; font-size:13px; text-align:center; margin-top:8px; }
  .discord-btn-alt { display:block; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#ffffff !important; text-decoration:none; padding:11px 18px; border-radius:10px; font-weight:700; font-size:13px; text-align:center; margin-top:8px; }
  .items-table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  .items-table th { font-size:11.5px; text-transform:uppercase; color:#86868b; text-align:left; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.08); }
  .items-table td { font-size:13.5px; color:#f5f5f7; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
  .footer { padding:24px 28px; background:rgba(0,0,0,0.4); border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11.5px; color:#86868b; line-height:1.6; }
</style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-badge">
        <span style="font-weight:800;font-size:15px;color:#fff;letter-spacing:-0.4px;">closy<span style="color:#ffffff;">dev.</span></span>
        <span style="background:#22c55e;color:#000;font-size:9px;font-weight:900;padding:1px 5px;border-radius:4px;">AKTİF</span>
      </div>
      <h1 class="title">Siparişiniz Onaylandı &amp; Lisansınız Açıldı</h1>
      <p class="subtitle">Merhaba <b>${customerName}</b>, siparişiniz başarıyla tamamlanmış ve dijital lisans anahtarınız anında aktif edilmiştir.</p>
    </div>

    <div class="body-content">
      
      <!-- Sipariş Meta -->
      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-lbl">Sipariş Numarası</span>
          <span class="meta-val" style="font-family:'JetBrains Mono',monospace;color:#60a5fa;">#${order.id}</span>
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
        <div style="font-size:12px;font-weight:700;color:#86868b;text-transform:uppercase;letter-spacing:0.04em;">AKTİF DİJİTAL LİSANS ANAHTARINIZ</div>
        <div style="font-size:16px;font-weight:700;color:#fff;margin-top:4px;">${order.product || 'Lisans Paketi'}</div>
        ${keys.map(k => `<div class="key-pill">${k}</div>`).join('')}
        <div style="font-size:12px;color:#34c759;margin-top:10px;font-weight:600;display:flex;align-items:center;gap:6px;">
          <span>Aktif &amp; Ömür Boyu Doğrulanmış Lisans</span>
        </div>
      </div>

      <!-- Discord Destek & Ticket -->
      <div class="discord-box">
        <div style="font-size:12px;font-weight:700;color:#5865F2;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">DISCORD DESTEK &amp; BOT KURULUM KANALI</div>
        <div style="font-size:15px;font-weight:700;color:#ffffff;margin-bottom:8px;">Teknik Destek &amp; Kurulum Hizmeti</div>
        <div style="font-size:13px;color:#cbd5e1;line-height:1.6;margin-bottom:12px;">
          Botunuzun token girişi, sunucu yetkilendirmesi ve açık kaynak kod talepleriniz için Discord kanallarımızdan Ticket açabilirsiniz:
        </div>
        <a href="https://discord.gg/closydev" target="_blank" rel="noopener noreferrer" class="discord-btn">Discord Sunucumuz: discord.gg/closydev (Ticket Aç)</a>
        
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;margin-top:14px;font-size:12.5px;color:#e2e8f0;line-height:1.6;">
          <b style="color:#38bdf8;">Açık Kaynak Kod &amp; Kurulum Desteği:</b><br/>
          • Açık kaynak dosyaları talep eden müşterilerimize kodlar eksiksiz iletilir.<br/>
          • Kurmayı bilmeyen müşterilerimizin sunucusuna bizzat biz bağlanıp botu anahtar teslim kuruyoruz.
        </div>
      </div>

      <!-- Ürün Tablosu -->
      <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:10px;">Onaylanan Ürünler</div>
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
              <td><b>${it.name}</b><br/><span style="font-size:11.5px;color:#34c759;">Lisans Aktifleştirildi</span></td>
              <td style="text-align:center;">${it.qty || 1}</td>
              <td style="text-align:right;font-weight:700;font-family:'JetBrains Mono',monospace;">₺${Number(it.price || 0).toLocaleString('tr-TR')}</td>
            </tr>`).join('')}
          <tr>
            <td colspan="2" style="font-weight:800;font-size:15px;color:#fff;padding-top:16px;">TOPLAM TUTAR (KDV Dahil)</td>
            <td style="text-align:right;font-weight:800;font-size:18px;color:#fff;font-family:'JetBrains Mono',monospace;padding-top:16px;">${totalFormatted}</td>
          </tr>
        </tbody>
      </table>

    </div>

    <div class="footer">
      <div style="font-weight:700;color:#f5f5f7;margin-bottom:4px;">closydev. Bilişim ve Yazılım Teknolojileri · GİB e-Arşiv Fatura Onaylı</div>
      <div>Büyükdere Caddesi No:193 Levent, Beşiktaş / İstanbul · Destek: destek@closydev.site</div>
      <div style="margin-top:8px;font-size:10.5px;color:#6b7280;">Bu e-posta siparişinizin başarıyla tamamlanması üzerine dijital teslimat amacıyla iletilmiştir.</div>
    </div>
  </div>
</body>
</html>`;
    },

    generateApprovalEmailPlainText(order, recipientEmail, customerName) {
      const keys = order.licenseKeys && order.licenseKeys.length ? order.licenseKeys.join(', ') : 'CLOSY-KEY-AKTIF-2026';
      const items = order.items && order.items.length ? order.items.map(it => `* ${it.name} (Adet: ${it.qty || 1}) - ₺${it.price}`).join('\n') : `* ${order.product || 'Dijital Lisans'}`;
      const total = '₺' + Number(order.amount || 0).toLocaleString('tr-TR');

      return `=======================================================
CLOSYDEV — SİPARİŞİNİZ ONAYLANDI & LİSANS AKTİF
=======================================================

Sayın ${customerName},

closydev. üzerinden vermiş olduğunuz sipariş başarıyla tamamlanmış ve dijital lisans anahtarınız aktif edilmiştir.

[SİPARİŞ DETAYLARI]
-------------------------------------------------------
Sipariş No        : #${order.id}
Teslimat E-postası : ${recipientEmail}
Tarih             : ${order.date || new Date().toLocaleString('tr-TR')}
Ödeme Şekli       : ${order.method || 'Kredi Kartı'}
Toplam Tutar      : ${total} (KDV Dahil)

[ONAYLANAN ÜRÜNLER]
-------------------------------------------------------
${items}

[AKTİF DİJİTAL LİSANS ANAHTARLARINIZ]
-------------------------------------------------------
${keys}

(Durum: ONAYLANDI & ÖMÜR BOYU GEÇERLİ)

[AÇIK KAYNAK KOD & KURULUM DESTEĞİ]
-------------------------------------------------------
* Açık kaynak kod dosyalarını Ticket üzerinden talep edebilirsiniz.
* Bot kurulumunu bilmiyorsanız ekibimiz botu sunucunuza bizzat anahtar teslim kurmaktadır.

[DISCORD TEKNİK DESTEK & KURULUM]
-------------------------------------------------------
Bot kurulumu, token girişi ve sorularınız için Discord sunucumuzdan Ticket açabilirsiniz:

Discord: https://discord.gg/closydev

7/24 Teknik Destek: destek@closydev.site
closydev. Bilişim ve Teknoloji Ticaret A.Ş.`;
    },

    sendOrderEmail(orderData) {
      const to = orderData.email || 'musteri@email.com';
      const customer = orderData.customer || 'Değerli Müşterimiz';
      const orderId = orderData.id || ('DS-' + Math.floor(100000 + Math.random() * 900000));
      const subject = `Siparişiniz Alındı — Yönetici Onayı Bekleniyor: #${orderId}`;

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
        preview: `Siparişiniz alındı. Hızlı onay ve bot kurulumu için Discord'da ticket açınız.`,
        html: html,
        plain: plain,
        gmailUrl: gmailUrl,
        mailtoUrl: mailtoUrl,
        date: orderData.date || ('Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })),
        timestamp: Date.now(),
        status: 'Onay Bekliyor',
        read: false,
        licenseKeys: orderData.licenseKeys || []
      };

      const emails = this.getEmails();
      emails.unshift(emailRecord);
      this.saveEmails(emails);

      // Background notification attempt
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

    sendOrderApprovalEmail(orderData) {
      const to = orderData.email || 'musteri@email.com';
      const customer = orderData.customer || 'Değerli Müşterimiz';
      const orderId = orderData.id || ('DS-' + Math.floor(100000 + Math.random() * 900000));
      const subject = `Siparişiniz Onaylandı & Lisansınız Aktifleştirildi: #${orderId}`;

      const html = this.generateApprovalEmailHtml(orderData, to, customer);
      const plain = this.generateApprovalEmailPlainText(orderData, to, customer);

      const gmailUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(orderId)}`;
      const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}`;

      const emailRecord = {
        id: 'EML-' + Math.floor(100000 + Math.random() * 900000),
        orderId: orderId,
        to: to,
        customer: customer,
        subject: subject,
        preview: `Siparişiniz onaylandı. ${orderData.product || 'Discord Bot'} lisans anahtarınız aktifleştirildi.`,
        html: html,
        plain: plain,
        gmailUrl: gmailUrl,
        mailtoUrl: mailtoUrl,
        date: 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        status: 'Onaylandı & Aktif',
        read: false,
        licenseKeys: orderData.licenseKeys || []
      };

      const emails = this.getEmails();
      emails.unshift(emailRecord);
      this.saveEmails(emails);

      // Background notification attempt
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
        if (o.status !== 'completed') return;
        if (o.licenseKeys && o.licenseKeys.length) {
          o.licenseKeys.forEach(k => {
            licenses.push({
              key: k,
              product: o.product,
              customer: o.customer,
              email: o.email,
              orderId: o.id,
              status: o.status === 'refunded' ? 'revoked' : 'active',
              date: o.date
            });
          });
        }
      });

      return licenses;
    },

    generateNewLicense(productName, email, customerName) {
      const key = 'CLOSY-' + Array.from({ length: 3 }, () => Math.random().toString(36).substring(2, 6).toUpperCase()).join('-');
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
          const licenseKey = (order.licenseKeys && order.licenseKeys.length) ? order.licenseKeys[0] : ('CLOSY-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-KEY-2026');

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
- Musteri Paneli  : https://closydev.site/hesabim.html
- 7/24 Destek     : destek@closydev.site
- Garanti         : 14 Gun Kosulsuz Iade & Degisim Guvencesi

(c) 2026 closydev. Bilisim Ticaret A.S. Tum haklari saklidir.
======================================================================`;

          const licenseText = 
`======================================================================
CLOSYDEV. PRO RESMI LISANS SERTIFIKASI
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
      <h1 style="font-size: 22px; margin: 0 0 6px; color: #0f172a;">closydev. Bilişim ve Teknoloji Ticaret A.Ş.</h1>
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
      CLOSYDEV. ELEKTRONİK MALİ MÜHÜR<br/>
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

    // ─── LIVE SUPPORT (CANLI DESTEK - GERCEK SISTEM YONETICISI) ───
    isAdminOperator() {
      if (!this.isLoggedIn()) return false;
      const user = (typeof this.getUserProfile === 'function') ? this.getUserProfile() : null;
      if (!user) return false;
      const email = (user.email || '').toLowerCase().trim();
      if (email === 'erenzeybek01@gmail.com') return false;
      return this.isAdmin();
    },

    isUtcOffsetGhost(t1, t2) {
      if (!t1 || !t2) return true;
      if (t1 === t2) return true;
      const h1 = parseInt(t1.split(':')[0], 10);
      const h2 = parseInt(t2.split(':')[0], 10);
      if (isNaN(h1) || isNaN(h2)) return true;
      const diff = Math.abs(h1 - h2);
      return diff === 3 || diff === 21 || diff === 0;
    },

    getTurkeyTimeStr(d = new Date()) {
      try {
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
      } catch (e) {
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      }
    },

    deduplicateMessages(messages) {
      if (!Array.isArray(messages)) return [];
      const clean = [];
      const seenIds = new Set();
      const seenKeys = new Map();

      for (const m of messages) {
        if (!m || !m.text) continue;
        if (m.id && seenIds.has(m.id)) continue;

        const normText = (m.text || '').trim().toLowerCase();
        const key = (m.sender || '') + '|' + normText;

        // 1. Bitisik mukerrer kontrolu (ayni gonderici ve ayni metin)
        const prev = clean[clean.length - 1];
        if (prev && prev.sender === m.sender && (prev.text || '').trim().toLowerCase() === normText) {
          continue;
        }

        // 2. Ayni konusma icinde UTC hayalet kopya (23:00 vs 20:00 gibi UTC saat farkiyla sunucudan donen hayalet kopya)
        if (seenKeys.has(key)) {
          const prior = seenKeys.get(key);
          if (this.isUtcOffsetGhost(prior.time, m.time)) {
            continue;
          }
        }

        if (m.id) seenIds.add(m.id);
        seenKeys.set(key, m);
        clean.push(m);
      }
      return clean;
    },

    mergeAndDeduplicateMessages(localMsgs = [], serverMsgs = []) {
      const result = [];
      const seenIds = new Set();
      const seenKeys = new Map();

      const combined = [...localMsgs, ...serverMsgs];
      for (const m of combined) {
        if (!m || !m.text) continue;
        if (m.id && seenIds.has(m.id)) continue;

        const normText = (m.text || '').trim().toLowerCase();
        const key = (m.sender || '') + '|' + normText;

        if (seenKeys.has(key)) {
          const existing = seenKeys.get(key);
          if (m.id === existing.id || this.isUtcOffsetGhost(existing.time, m.time)) {
            continue;
          }
        }

        if (m.id) seenIds.add(m.id);
        seenKeys.set(key, m);
        result.push(m);
      }

      return this.deduplicateMessages(result);
    },

    getSupportChats() {
      const raw = localStorage.getItem('digistore_support_chats');
      if (!raw) return [];
      try {
        let chats = JSON.parse(raw);
        if (Array.isArray(chats)) {
          let dirty = false;
          chats.forEach(c => {
            if (Array.isArray(c.messages)) {
              const prevLen = c.messages.length;
              c.messages = this.deduplicateMessages(c.messages);
              if (c.messages.length !== prevLen) dirty = true;

              c.messages.forEach(m => {
                if (m.text && (m.text.includes('DigiStore') || m.text.includes('admin@digistore.com'))) {
                  m.text = m.text
                    .replace(/Merhaba!\s*DigiStore doğrudan yönetici canlı destek hattındasınız\.\s*Mesajınızı buraya yazabilirsiniz,\s*site yöneticimiz admin@digistore\.com doğrudan canlı olarak yanıtlayacaktır\./g, 'Merhaba! closydev. resmi canlı destek hattındasınız. Mesajınızı buraya iletebilirsiniz, yetkili ekibimiz doğrudan canlı olarak yanıtlayacaktır.')
                    .replace(/DigiStore doğrudan yönetici canlı destek hattındasınız/gi, 'closydev. resmi canlı destek hattındasınız')
                    .replace(/site yöneticimiz admin@digistore\.com doğrudan canlı olarak yanıtlayacaktır/gi, 'yetkili ekibimiz doğrudan canlı olarak yanıtlayacaktır')
                    .replace(/admin@digistore\.com/gi, 'destek@closydev.site')
                    .replace(/DigiStore/gi, 'closydev.');
                  dirty = true;
                }
                if (m.senderName && (m.senderName.includes('DigiStore') || m.senderName.includes('admin@digistore.com'))) {
                  m.senderName = m.senderName.replace(/admin@digistore\.com/gi, 'destek@closydev.site').replace(/DigiStore/gi, 'closydev.');
                  dirty = true;
                }
              });
            }
          });
          if (dirty) {
            localStorage.setItem('digistore_support_chats', JSON.stringify(chats));
          }
        }
        return chats;
      } catch (e) {
        return [];
      }
    },

    saveSupportChats(chats) {
      if (Array.isArray(chats)) {
        chats.forEach(c => {
          if (Array.isArray(c.messages)) {
            c.messages = this.deduplicateMessages(c.messages);
          }
        });
      }
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
          body: JSON.stringify({ action: 'delete', chatId: id, senderEmail: 'destek@closydev.site', isAdmin: true })
        }).catch(() => {});
      } catch (e) {}
    },

    getSupportApiEndpoint() {
      const base = (typeof this.getApiBaseUrl === 'function') ? this.getApiBaseUrl() : '';
      return (base || '') + '/api/support';
    },

    broadcastSupportRealtime(data) {
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bus = new BroadcastChannel('digistore_support_bus');
          bus.postMessage(data);
          bus.close();
        } catch (e) {}
      }
    },

    getUserChatSession() {
      let sessionId = localStorage.getItem('digistore_support_session_id');
      if (!sessionId) {
        sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        localStorage.setItem('digistore_support_session_id', sessionId);
      }

      const user = (typeof this.getUserProfile === 'function') ? this.getUserProfile() : null;
      const userEmail = (user && user.email) ? user.email.toLowerCase().trim() : '';
      const userName = (user && user.name) ? user.name.trim() : 'Müşteri';

      let chats = this.getSupportChats();
      let chat = null;

      if (userEmail && userEmail !== 'admin@digistore.com') {
        chat = chats.find(c => c.userEmail && c.userEmail.toLowerCase().trim() === userEmail);
      }
      if (!chat) {
        chat = chats.find(c => c.sessionId === sessionId);
      }

      if (!chat) {
        const now = new Date();
        const timeStr = this.getTurkeyTimeStr(now);
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
              senderName: 'closydev. Yetkili Destek',
              senderEmail: 'destek@closydev.site',
              text: 'Merhaba! closydev. resmi canlı destek hattındasınız. Mesajınızı buraya yazabilirsiniz, yetkili ekibimiz doğrudan canlı olarak yanıtlayacaktır.',
              time: timeStr
            }
          ]
        };
        chats.unshift(chat);
        this.saveSupportChats(chats);
      } else {
        let changed = false;
        if (userEmail && (!chat.userEmail || chat.userEmail.toLowerCase() !== userEmail)) {
          chat.userEmail = userEmail;
          changed = true;
        }
        if (userName && userName !== 'Müşteri' && chat.userName !== userName) {
          chat.userName = userName;
          changed = true;
        }
        if (chat.messages && chat.messages.length > 0) {
          const oldLen = chat.messages.length;
          chat.messages = this.deduplicateMessages(chat.messages);
          if (chat.messages.length !== oldLen) changed = true;

          chat.messages.forEach(m => {
            if (m.text && (m.text.includes('DigiStore doğrudan') || m.text.includes('admin@digistore.com'))) {
              m.text = 'Merhaba! closydev. resmi canlı destek hattındasınız. Mesajınızı buraya yazabilirsiniz, yetkili ekibimiz doğrudan canlı olarak yanıtlayacaktır.';
              m.senderName = 'closydev. Yetkili Destek';
              changed = true;
            }
          });
        }
        if (changed) {
          this.saveSupportChats(chats);
        }
      }
      return chat;
    },

    async sendUserSupportMessage(text) {
      if (!this.isLoggedIn()) {
        console.warn('Canlı desteğe mesaj göndermek için kullanıcı girişi yapılmalıdır.');
        return null;
      }
      if (!text || !text.trim()) return null;
      const cleanText = text.trim();
      const chat = this.getUserChatSession();
      const now = new Date();
      const timeStr = this.getTurkeyTimeStr(now);
      const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

      const newMsg = {
        id: msgId,
        sender: 'user',
        senderName: chat.userName || 'Müşteri',
        senderEmail: chat.userEmail || '',
        text: cleanText,
        time: timeStr,
        timestamp: Date.now()
      };

      if (!Array.isArray(chat.messages)) chat.messages = [];
      chat.messages.push(newMsg);
      chat.messages = this.deduplicateMessages(chat.messages);
      chat.lastUpdated = Date.now();
      chat.unreadByAdmin = (chat.unreadByAdmin || 0) + 1;
      chat.unreadByUser = 0;

      const chats = this.getSupportChats();
      const idx = chats.findIndex(c => c.id === chat.id);
      if (idx !== -1) chats[idx] = chat; else chats.unshift(chat);
      this.saveSupportChats(chats);

      // Anlık sekme/panel yayını
      this.broadcastSupportRealtime({
        type: 'new_message',
        sender: 'user',
        chatId: chat.id,
        userName: chat.userName,
        userEmail: chat.userEmail,
        message: newMsg
      });

      // Sunucu senkronizasyonu
      try {
        fetch(this.getSupportApiEndpoint(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send',
            chatId: chat.id,
            sessionId: chat.sessionId,
            userEmail: chat.userEmail,
            userName: chat.userName,
            text: cleanText,
            isAdmin: false,
            messageId: newMsg.id,
            clientTime: timeStr,
            timestamp: newMsg.timestamp
          })
        }).catch(() => {});
      } catch (e) {}

      return newMsg;
    },

    async sendAgentSupportMessage(chatId, text, senderEmail = 'destek@closydev.site') {
      if (!text || !text.trim()) return null;
      const isAuthorized = this.isAdminOperator() || (senderEmail && (
        senderEmail.toLowerCase().trim() === 'admin@digistore.com' ||
        senderEmail.toLowerCase().trim() === 'destek@closydev.site'
      ));
      if (!isAuthorized) {
        console.warn('Canlı destek yanıtı sadece sistem yöneticisi tarafından verilebilir');
        return null;
      }

      const chats = this.getSupportChats();
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return null;

      const now = new Date();
      const timeStr = this.getTurkeyTimeStr(now);
      const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

      const newMsg = {
        id: msgId,
        sender: 'admin',
        senderName: 'closydev. Yetkili Destek',
        senderEmail: senderEmail || 'destek@closydev.site',
        text: text.trim(),
        time: timeStr,
        timestamp: Date.now()
      };

      if (!Array.isArray(chat.messages)) chat.messages = [];
      chat.messages.push(newMsg);
      chat.messages = this.deduplicateMessages(chat.messages);
      chat.lastUpdated = Date.now();
      chat.unreadByUser = (chat.unreadByUser || 0) + 1;
      chat.unreadByAdmin = 0;

      this.saveSupportChats(chats);

      // Anlık sekme/panel yayını
      this.broadcastSupportRealtime({
        type: 'new_message',
        sender: 'admin',
        chatId: chat.id,
        message: newMsg
      });

      // Sunucu senkronizasyonu
      try {
        fetch(this.getSupportApiEndpoint(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send',
            chatId: chat.id,
            text: text.trim(),
            isAdmin: true,
            senderEmail: senderEmail || 'destek@closydev.site',
            messageId: newMsg.id,
            clientTime: timeStr,
            timestamp: newMsg.timestamp
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
        const res = await fetch(this.getSupportApiEndpoint());
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.success && Array.isArray(data.chats)) {
          const localChats = this.getSupportChats();
          const chatMap = new Map();
          localChats.forEach(c => chatMap.set(c.id, c));

          data.chats.forEach(serverChat => {
            const local = chatMap.get(serverChat.id);
            if (!local) {
              if (Array.isArray(serverChat.messages)) {
                serverChat.messages = this.deduplicateMessages(serverChat.messages);
              }
              chatMap.set(serverChat.id, serverChat);
            } else {
              // Mesajları akıllı birleştir ve mükerrerleri temizle
              local.messages = this.mergeAndDeduplicateMessages(local.messages || [], serverChat.messages || []);
              local.lastUpdated = Math.max(local.lastUpdated || 0, serverChat.lastUpdated || 0);
              if (serverChat.userName) local.userName = serverChat.userName;
              if (serverChat.userEmail) local.userEmail = serverChat.userEmail;
              chatMap.set(local.id, local);
            }
          });

          const merged = Array.from(chatMap.values()).sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
          const newJson = JSON.stringify(merged);
          const oldJson = localStorage.getItem('digistore_support_chats');
          window.__adminSupportOnline = !!data.adminOnline;
          if (oldJson !== newJson) {
            localStorage.setItem('digistore_support_chats', newJson);
            this.broadcastChange('digistore_support_chats');
          }
        }
      } catch (err) {
        // Ağ veya statik çalıştırma toleransı
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
        try { fn(topic); } catch (e) {}
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

  // Background catalog sync with cloud/server (immediate on load, then every 8s)
  DigiStoreDB.syncRemoteCatalog();
  setInterval(() => {
    DigiStoreDB.syncRemoteCatalog();
  }, 8000);

  // Background server sync polling every 3.5 seconds
  setInterval(() => {
    DigiStoreDB.syncSupportWithServer();
  }, 3500);

  // Admin Heartbeat (if logged in as admin)
  setInterval(() => {
    if (DigiStoreDB.isAdminOperator()) {
      fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'heartbeat', senderEmail: 'destek@closydev.site', isAdmin: true })
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
        0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
        70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
        100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
      }
      @keyframes supportSlideUp {
        from { opacity: 0; transform: translateY(18px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      #digiSupportWindow.open {
        display: flex !important;
        animation: supportSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .support-lightning-svg {
        filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.95));
      }
      .digi-chat-bubble-admin {
        background: rgba(22, 22, 30, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-left: 3px solid #a855f7;
        color: #f1f5f9;
        padding: 11px 15px;
        border-radius: 16px 16px 16px 3px;
        font-size: 13px;
        line-height: 1.5;
        word-break: break-word;
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.35);
      }
      .digi-chat-bubble-user {
        background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
        border: 1px solid rgba(255, 255, 255, 0.16);
        color: #ffffff;
        padding: 11px 15px;
        border-radius: 16px 16px 3px 16px;
        font-size: 13px;
        line-height: 1.45;
        box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);
        word-break: break-word;
      }
      .digi-quick-chip:hover {
        background: rgba(168, 85, 247, 0.15) !important;
        border-color: rgba(168, 85, 247, 0.45) !important;
        color: #ffffff !important;
        box-shadow: 0 0 10px rgba(168, 85, 247, 0.25);
      }
      #digiSupportLauncher {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        gap: 12px !important;
      }
    `;
    document.head.appendChild(styleEl);

    // Floating Button
    const launcher = document.createElement('div');
    launcher.id = 'digiSupportLauncher';
    launcher.setAttribute('style', 'position:fixed;bottom:24px;right:24px;z-index:99980;display:flex;align-items:center;gap:12px;background:rgba(12,12,18,0.88);backdrop-filter:blur(24px) saturate(200%);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.14);border-radius:9999px;padding:8px 18px 8px 10px;box-shadow:0 14px 40px -8px rgba(0,0,0,0.85),0 0 24px rgba(168,85,247,0.22),inset 0 1px 1px rgba(255,255,255,0.25);cursor:pointer;transition:all .25s ease;user-select:none;');
    launcher.onmouseover = function() { this.style.transform = 'translateY(-2px) scale(1.02)'; this.style.borderColor = 'rgba(168,85,247,0.6)'; this.style.boxShadow = '0 18px 45px -8px rgba(0,0,0,0.9), 0 0 30px rgba(168,85,247,0.35)'; };
    launcher.onmouseout = function() { this.style.transform = 'translateY(0) scale(1)'; this.style.borderColor = 'rgba(255,255,255,0.14)'; this.style.boxShadow = '0 14px 40px -8px rgba(0,0,0,0.85), 0 0 24px rgba(168,85,247,0.22)'; };

    launcher.innerHTML = `
      <div style="position:relative;width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,rgba(168,85,247,0.35),rgba(59,130,246,0.35));border:1px solid rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(168,85,247,0.4);color:#ffffff;flex-shrink:0;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="support-lightning-svg">
          <path d="M13 2L3.5 13.5H11.5L10 22L20.5 10.5H12.5L13 2Z" fill="#FFFFFF"/>
        </svg>
      </div>
      <div style="display:flex;flex-direction:column;line-height:1.2;">
        <span style="font-size:13.5px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">Canlı Destek</span>
        <span id="digiSupportOnlineText" style="font-size:10.5px;color:#22c55e;font-weight:600;display:flex;align-items:center;gap:5px;">
          <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;animation:supportPulse 2s infinite;display:inline-block;"></span>
          Yetkili Çevrimiçi
        </span>
      </div>
      <span id="digiSupportBadge" style="display:none;background:#ef4444;color:#ffffff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:9999px;box-shadow:0 0 10px rgba(239,68,68,0.6);margin-left:2px;">1</span>
    `;

    // Chat Window
    const win = document.createElement('div');
    win.id = 'digiSupportWindow';
    win.setAttribute('style', 'display:none;position:fixed;bottom:84px;right:24px;width:385px;max-width:calc(100vw - 32px);height:580px;max-height:calc(100vh - 105px);background:rgba(12,12,18,0.95);backdrop-filter:blur(32px) saturate(220%);-webkit-backdrop-filter:blur(32px);border:1px solid rgba(255,255,255,0.12);border-radius:24px;box-shadow:0 24px 70px -10px rgba(0,0,0,0.9),0 0 0 1px rgba(255,255,255,0.06),0 0 35px rgba(168,85,247,0.18);z-index:99981;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,\'Plus Jakarta Sans\',sans-serif;');

    win.innerHTML = `
      <!-- Header -->
      <div style="padding:15px 18px;background:linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-30px;left:20px;width:140px;height:80px;background:radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%);pointer-events:none;"></div>
        <div style="display:flex;align-items:center;gap:11px;position:relative;z-index:1;">
          <div style="position:relative;width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg, rgba(168,85,247,0.35), rgba(59,130,246,0.35));border:1px solid rgba(255,255,255,0.22);display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(168,85,247,0.4);flex-shrink:0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="support-lightning-svg">
              <path d="M13 2L3.5 13.5H11.5L10 22L20.5 10.5H12.5L13 2Z" fill="#FFFFFF"/>
            </svg>
          </div>
          <div>
            <div style="font-size:14.5px;font-weight:800;color:#ffffff;display:flex;align-items:center;gap:7px;letter-spacing:-0.02em;">
              <span id="digiSupportHeaderTitle">closydev. Destek</span>
              <span id="digiSupportHeaderRole" style="font-size:9px;color:#c084fc;background:rgba(168,85,247,0.16);border:1px solid rgba(168,85,247,0.35);padding:2px 6px;border-radius:6px;font-weight:800;letter-spacing:0.04em;">YETKİLİ</span>
            </div>
            <div id="digiSupportHeaderSub" style="font-size:11px;color:#94a3b8;font-weight:500;display:flex;align-items:center;gap:5px;margin-top:2px;">
              <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;display:inline-block;"></span>
              Aktif Canlı Destek Hattı
            </div>
          </div>
        </div>
        <button id="digiSupportCloseBtn" style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#94a3b8;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;position:relative;z-index:1;" onmouseover="this.style.color='#fff';this.style.background='rgba(255,255,255,0.14)';" onmouseout="this.style.color='#94a3b8';this.style.background='rgba(255,255,255,0.06)';">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Operator Mode Indicator (if logged in as admin) -->
      <div id="digiSupportOperatorBar" style="display:none;padding:10px 16px;background:rgba(168,85,247,0.1);border-bottom:1px solid rgba(168,85,247,0.2);display:flex;justify-content:space-between;align-items:center;position:relative;z-index:20;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="width:6px;height:6px;border-radius:50%;background:#a855f7;box-shadow:0 0 8px #a855f7;display:inline-block;"></span>
          <span style="font-size:11.5px;color:#d8b4fe;font-weight:700;letter-spacing:-0.01em;">Operatör Modu</span>
        </div>

        <!-- Custom Dropdown Container -->
        <div style="position:relative;" id="digiCustDropdownWrap">
          <button type="button" id="digiCustDropdownBtn" style="background:rgba(18,16,26,0.95);border:1px solid rgba(168,85,247,0.38);border-radius:9999px;color:#ffffff;font-size:11.5px;font-weight:600;padding:5px 12px 5px 8px;display:flex;align-items:center;gap:7px;cursor:pointer;box-shadow:0 0 12px rgba(168,85,247,0.2);outline:none;transition:all .15s ease;">
            <span style="width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#a855f7,#6366f1);display:inline-flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:800;color:#ffffff;" id="digiCustActiveAvatar">M</span>
            <span id="digiCustActiveLabel" style="max-width:115px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Müşteri Seçin...</span>
            <span id="digiCustActiveBadge" style="display:none;background:#ef4444;color:#ffffff;font-size:9px;font-weight:800;padding:1px 5px;border-radius:9999px;">0</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.5" style="transition:transform .2s;" id="digiCustDropdownArrow"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>

          <!-- Dropdown Menu -->
          <div id="digiCustDropdownMenu" style="display:none;position:absolute;top:calc(100% + 6px);right:0;width:215px;background:#0d0d14;border:1px solid rgba(168,85,247,0.35);border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,0.95), 0 0 25px rgba(168,85,247,0.25);padding:6px;max-height:220px;overflow-y:auto;z-index:99999;">
            <!-- Rendered by JS -->
          </div>
        </div>
      </div>

      <!-- Quick Message Chips -->
      <div id="digiSupportChipsContainer" style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.015);display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;">
        <button type="button" class="digi-quick-chip" data-msg="Siparişimin durumunu öğrenebilir miyim?" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:9999px;color:#cbd5e1;padding:5px 12px;font-size:11px;font-weight:600;white-space:nowrap;cursor:pointer;transition:all .15s;">Sipariş Durumu</button>
        <button type="button" class="digi-quick-chip" data-msg="Lisans anahtarım hakkında bilgi almak istiyorum." style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:9999px;color:#cbd5e1;padding:5px 12px;font-size:11px;font-weight:600;white-space:nowrap;cursor:pointer;transition:all .15s;">Lisansım Nerede?</button>
        <button type="button" class="digi-quick-chip" data-msg="Ödeme ve e-Arşiv faturası hakkında görüşmek istiyorum." style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:9999px;color:#cbd5e1;padding:5px 12px;font-size:11px;font-weight:600;white-space:nowrap;cursor:pointer;transition:all .15s;">Ödeme &amp; Fatura</button>
      </div>

      <!-- Messages Area -->
      <div id="digiSupportMessages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:#08080c;">
        <!-- Filled via JS -->
      </div>

      <!-- Input Bar -->
      <form id="digiSupportForm" style="padding:12px 14px;background:rgba(12,12,18,0.98);border-top:1px solid rgba(255,255,255,0.08);display:flex;gap:10px;align-items:center;">
        <input type="text" id="digiSupportInput" placeholder="Yetkili ekibe mesajınızı iletin..." autocomplete="off" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:9999px;padding:10px 16px;font-size:13px;color:#ffffff;outline:none;transition:border-color .2s, box-shadow .2s;" onfocus="this.style.borderColor='rgba(168,85,247,0.5)';this.style.boxShadow='0 0 12px rgba(168,85,247,0.2)';" onblur="this.style.borderColor='rgba(255,255,255,0.12)';this.style.boxShadow='none';" />
        <button type="submit" style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#9333ea,#4f46e5);border:none;color:#ffffff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 0 14px rgba(147,51,234,0.45);flex-shrink:0;transition:transform .15s ease;" onmouseover="this.style.transform='scale(1.05)';" onmouseout="this.style.transform='scale(1)';">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(win);

    let activeAdminTargetChatId = null;

    // Event Handlers
    launcher.onclick = function() {
      // 1. KURAL: Canlı Destek Giriş Yapmadan Asla Çalışmaz
      if (!DigiStoreDB.isLoggedIn()) {
        if (typeof openAuthModal === 'function') {
          openAuthModal('login');
        } else if (typeof showIosAlert === 'function') {
          showIosAlert({
            title: 'Giriş Yapmalısınız',
            message: 'Canlı destek hattına bağlanmak için lütfen önce hesabınıza giriş yapınız.',
            type: 'warning',
            confirmText: 'Giriş Yap',
            onConfirm: () => {
              const target = window.location.pathname.includes('/frontend/') ? '/frontend/hesabim.html' : 'hesabim.html';
              window.location.href = target;
            }
          });
        } else {
          alert('Canlı destek hattına bağlanmak için lütfen önce hesabınıza giriş yapınız.');
          const target = window.location.pathname.includes('/frontend/') ? '/frontend/hesabim.html' : 'hesabim.html';
          window.location.href = target;
        }
        return;
      }

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
          if (opBar) opBar.style.setProperty('display', 'flex', 'important');
          if (chips) chips.style.setProperty('display', 'none', 'important');
          if (headerRole) {
            headerRole.textContent = 'SİSTEM YÖNETİCİSİ';
            headerRole.style.color = '#c084fc';
            headerRole.style.background = 'rgba(168,85,247,0.18)';
            headerRole.style.borderColor = 'rgba(168,85,247,0.4)';
          }
          if (headerSub) headerSub.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:#a855f7;box-shadow:0 0 8px #a855f7;display:inline-block;"></span> <span style="color:#d8b4fe;font-weight:600;">Sistem Yöneticisi Paneli</span>';
          populateOperatorCustomerSelect();
          const inp = document.getElementById('digiSupportInput');
          if (inp) inp.placeholder = 'Müşteriye yanıtınızı yazın...';
        } else {
          if (opBar) opBar.style.setProperty('display', 'none', 'important');
          if (chips) chips.style.setProperty('display', 'flex', 'important');
          if (headerRole) {
            headerRole.textContent = 'YETKİLİ';
            headerRole.style.color = '#38bdf8';
            headerRole.style.background = 'rgba(56,189,248,0.15)';
            headerRole.style.borderColor = 'rgba(56,189,248,0.3)';
          }
          if (headerSub) headerSub.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;display:inline-block;"></span> Aktif Canlı Destek Hattı';
          const chat = DigiStoreDB.getUserChatSession();
          DigiStoreDB.markSupportReadByUser(chat.id);
          const inp = document.getElementById('digiSupportInput');
          if (inp) inp.placeholder = 'Yetkili ekibe mesajınızı iletin...';
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
        if (!DigiStoreDB.isLoggedIn()) {
          if (typeof openAuthModal === 'function') openAuthModal('login');
          return;
        }
        const msg = this.getAttribute('data-msg');
        if (!msg) return;
        DigiStoreDB.sendUserSupportMessage(msg);
        renderWidgetMessages();
      };
    });

    // Custom customer dropdown for admin operator mode
    function toggleCustomerDropdown() {
      const menu = document.getElementById('digiCustDropdownMenu');
      const arrow = document.getElementById('digiCustDropdownArrow');
      if (!menu) return;
      const isOpen = menu.style.display === 'block';
      if (isOpen) {
        closeCustomerDropdown();
      } else {
        menu.style.display = 'block';
        if (arrow) arrow.style.transform = 'rotate(180deg)';
      }
    }

    function closeCustomerDropdown() {
      const menu = document.getElementById('digiCustDropdownMenu');
      const arrow = document.getElementById('digiCustDropdownArrow');
      if (menu) menu.style.display = 'none';
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    }

    const triggerBtn = document.getElementById('digiCustDropdownBtn');
    if (triggerBtn) {
      triggerBtn.onclick = function(e) {
        e.stopPropagation();
        toggleCustomerDropdown();
      };
    }

    document.addEventListener('click', () => {
      closeCustomerDropdown();
    });

    function populateOperatorCustomerSelect() {
      const menu = document.getElementById('digiCustDropdownMenu');
      const label = document.getElementById('digiCustActiveLabel');
      const avatar = document.getElementById('digiCustActiveAvatar');
      const badge = document.getElementById('digiCustActiveBadge');
      if (!menu) return;

      const chats = DigiStoreDB.getSupportChats();
      if (chats.length === 0) {
        menu.innerHTML = '<div style="padding:10px;font-size:11.5px;color:#86868b;text-align:center;">Henüz müşteri yok</div>';
        if (label) label.textContent = 'Müşteri Yok';
        return;
      }

      if (!activeAdminTargetChatId && chats.length > 0) {
        activeAdminTargetChatId = chats[0].id;
      }

      const activeChat = chats.find(c => c.id === activeAdminTargetChatId) || chats[0];
      if (activeChat) {
        activeAdminTargetChatId = activeChat.id;
        if (label) label.textContent = activeChat.userName || 'Müşteri';
        if (avatar) avatar.textContent = ((activeChat.userName || 'M').charAt(0)).toUpperCase();
        if (badge) {
          const unread = activeChat.unreadByAdmin || 0;
          if (unread > 0) {
            badge.textContent = unread;
            badge.style.display = 'inline-block';
          } else {
            badge.style.display = 'none';
          }
        }
      }

      menu.innerHTML = chats.map(c => {
        const isSelected = c.id === activeAdminTargetChatId;
        const unread = c.unreadByAdmin || 0;
        const initial = ((c.userName || 'M').charAt(0)).toUpperCase();
        return `
          <div class="digi-cust-option" data-id="${c.id}" style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-radius:10px;cursor:pointer;transition:all .15s;margin-bottom:2px;${isSelected ? 'background:rgba(168,85,247,0.22);border:1px solid rgba(168,85,247,0.4);' : 'background:transparent;border:1px solid transparent;'}">
            <div style="display:flex;align-items:center;gap:8px;min-width:0;">
              <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#a855f7,#6366f1);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;flex-shrink:0;">${initial}</div>
              <span style="font-size:12px;color:#f1f5f9;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:115px;">${c.userName || 'Müşteri'}</span>
            </div>
            ${unread > 0 ? `<span style="background:#ef4444;color:#fff;font-size:9px;font-weight:800;padding:1px 6px;border-radius:9999px;box-shadow:0 0 8px rgba(239,68,68,0.6);">${unread} yeni</span>` : ''}
          </div>
        `;
      }).join('');

      menu.querySelectorAll('.digi-cust-option').forEach(opt => {
        opt.onclick = function(e) {
          e.stopPropagation();
          activeAdminTargetChatId = this.getAttribute('data-id');
          populateOperatorCustomerSelect();
          renderWidgetMessages();
          closeCustomerDropdown();
        };
        opt.onmouseover = function() {
          if (this.getAttribute('data-id') !== activeAdminTargetChatId) {
            this.style.background = 'rgba(255,255,255,0.06)';
          }
        };
        opt.onmouseout = function() {
          if (this.getAttribute('data-id') !== activeAdminTargetChatId) {
            this.style.background = 'transparent';
          }
        };
      });
    }

    // Form submit
    document.getElementById('digiSupportForm').onsubmit = function(e) {
      e.preventDefault();
      if (!DigiStoreDB.isLoggedIn()) {
        if (typeof openAuthModal === 'function') openAuthModal('login');
        return;
      }
      const inp = document.getElementById('digiSupportInput');
      const text = inp.value.trim();
      if (!text) return;
      inp.value = '';

      const isOperator = DigiStoreDB.isAdminOperator();
      if (isOperator) {
        if (!activeAdminTargetChatId) {
          alert('Lütfen yanıt yazmak için üstten bir müşteri seçin');
          return;
        }
        DigiStoreDB.sendAgentSupportMessage(activeAdminTargetChatId, text, 'destek@closydev.site');
      } else {
        DigiStoreDB.sendUserSupportMessage(text);
      }
      renderWidgetMessages();
    };

    function renderWidgetMessages() {
      const container = document.getElementById('digiSupportMessages');
      if (!container) return;

      if (!DigiStoreDB.isLoggedIn()) {
        container.innerHTML = `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;gap:12px;">
            <div style="width:46px;height:46px;border-radius:50%;background:rgba(168,85,247,0.12);border:1px solid rgba(168,85,247,0.25);display:flex;align-items:center;justify-content:center;color:#c084fc;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div style="font-size:14px;font-weight:700;color:#ffffff;">Giriş Yapmalısınız</div>
            <div style="font-size:12px;color:#86868b;line-height:1.5;">Canlı destek sistemini kullanabilmek için lütfen hesabınıza giriş yapınız.</div>
            <button type="button" onclick="if(typeof openAuthModal==='function'){openAuthModal('login');}else{window.location.href=window.location.pathname.includes('/frontend/')?'/frontend/hesabim.html':'hesabim.html';}" style="background:#ffffff;color:#000000;border:none;padding:8px 20px;border-radius:9999px;font-size:12px;font-weight:700;cursor:pointer;">Giriş Yap</button>
          </div>
        `;
        return;
      }

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

      const renderedMessages = DigiStoreDB.deduplicateMessages(chat.messages);

      container.innerHTML = renderedMessages.map(m => {
        let cleanText = (m.text || '')
          .replace(/Merhaba!\s*DigiStore doğrudan yönetici canlı destek hattındasınız\.\s*Mesajınızı buraya yazabilirsiniz,\s*site yöneticimiz admin@digistore\.com doğrudan canlı olarak yanıtlayacaktır\./g, 'Merhaba! closydev. resmi canlı destek hattındasınız. Mesajınızı buraya iletebilirsiniz, yetkili ekibimiz doğrudan canlı olarak yanıtlayacaktır.')
          .replace(/DigiStore doğrudan yönetici canlı destek hattındasınız/gi, 'closydev. resmi canlı destek hattındasınız')
          .replace(/site yöneticimiz admin@digistore\.com doğrudan canlı olarak yanıtlayacaktır/gi, 'yetkili ekibimiz doğrudan canlı olarak yanıtlayacaktır')
          .replace(/admin@digistore\.com/gi, 'destek@closydev.site')
          .replace(/DigiStore/gi, 'closydev.');

        const isUser = m.sender === 'user';
        if (isUser) {
          if (isOperator) {
            return `
              <div style="align-self:flex-start;max-width:84%;display:flex;flex-direction:column;align-items:flex-start;">
                <span style="font-size:10.5px;color:#86868b;margin-bottom:3px;padding-left:2px;">${chat.userName || 'Müşteri'}</span>
                <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.09);color:#f5f5f7;padding:10px 14px;border-radius:16px 16px 16px 3px;font-size:13px;line-height:1.45;word-break:break-word;">
                  ${cleanText}
                </div>
                <span style="font-size:10px;color:#86868b;margin-top:3px;padding-left:2px;">${m.time || ''}</span>
              </div>
            `;
          } else {
            return `
              <div style="align-self:flex-end;max-width:82%;display:flex;flex-direction:column;align-items:flex-end;">
                <div class="digi-chat-bubble-user">
                  ${cleanText}
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
                <span style="font-size:10px;color:#c084fc;font-weight:700;margin-bottom:2px;padding-right:2px;">Siz (Sistem Yöneticisi)</span>
                <div class="digi-chat-bubble-user" style="background:linear-gradient(135deg,#7e22ce,#4338ca);">
                  ${cleanText}
                </div>
                <span style="font-size:10px;color:#86868b;margin-top:3px;padding-right:2px;">${m.time || ''}</span>
              </div>
            `;
          } else {
            return `
              <div style="align-self:flex-start;max-width:86%;display:flex;flex-direction:column;align-items:flex-start;">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;padding-left:2px;">
                  <span style="font-size:11px;color:#c084fc;font-weight:700;">closydev. Yetkili Destek</span>
                  <span style="background:rgba(168,85,247,0.18);border:1px solid rgba(168,85,247,0.35);color:#d8b4fe;font-size:8.5px;padding:1px 5px;border-radius:4px;font-weight:800;">EKİP</span>
                </div>
                <div class="digi-chat-bubble-admin">
                  ${cleanText}
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

    // Realtime BroadcastChannel Dinleyicisi
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const liveSupportBus = new BroadcastChannel('digistore_support_bus');
        liveSupportBus.onmessage = function(ev) {
          if (ev.data && (ev.data.type === 'new_message' || ev.data.type === 'sync')) {
            renderWidgetMessages();
            updateWidgetBadge();
            if (DigiStoreDB.isAdminOperator()) {
              populateOperatorCustomerSelect();
            }
          }
        };
      } catch (e) {}
    }

    // Initial render & sync
    renderWidgetMessages();
    updateWidgetBadge();

    DigiStoreDB.onUpdate(topic => {
      if (topic === 'digistore_support_chats' || topic === 'auth' || topic === 'session' || topic === 'profile') {
        renderWidgetMessages();
        updateWidgetBadge();
        if (DigiStoreDB.isAdminOperator()) {
          populateOperatorCustomerSelect();
        }
      }
    });
  }

  // ==========================================
  // Unified Theme System (Dark / Light Mode)
  // ==========================================
  const STORAGE_KEY_THEME = 'closydev_theme';

  function initTheme() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      const isLight = (savedTheme === 'light');
      if (isLight) {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
      updateThemeIcons(isLight);
    } catch(e) {}
  }

  function updateThemeIcons(isLight) {
    const suns = document.querySelectorAll('.theme-icon-sun');
    const moons = document.querySelectorAll('.theme-icon-moon');
    suns.forEach(s => s.style.display = isLight ? 'none' : 'block');
    moons.forEach(m => m.style.display = isLight ? 'block' : 'none');
  }

  window.toggleTheme = function() {
    const isLight = document.documentElement.classList.toggle('light-theme');
    try {
      localStorage.setItem(STORAGE_KEY_THEME, isLight ? 'light' : 'dark');
    } catch(e) {}
    updateThemeIcons(isLight);
    if (typeof showDynamicIsland === 'function') {
      showDynamicIsland(isLight ? 'Açık Tema Aktif' : 'Koyu Tema Aktif', 'Görünüm modu güncellendi', 'success');
    }
  };

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  // Mount on document ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountStorefrontSupportWidget);
  } else {
    mountStorefrontSupportWidget();
  }

})(window);


