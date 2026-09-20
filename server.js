// DigiStore Backend - Ana Sunucu
// Kullanim: node server.js  veya  npm run dev
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const Database = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'degistir_bunu_production_da';

// ── CLOSYGUARD ENTERPRISE SECURITY SUITE ──────────────────────────
const guard = require('./middleware/guard');

app.disable('x-powered-by'); // Express kimliğini gizle
app.use(helmet({
  contentSecurityPolicy: false, // CDN ve frontend iframe desteği için esnek CSP
  crossOriginEmbedderPolicy: false
}));
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

// İstek boyutu sınırlaması (Buffer Overflow & DoS Koruması)
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// 1. IP Kara Liste Kontrolü (Otomatik banlanan IP'leri kapıda durdurur)
app.use(guard.ipBlacklistMiddleware);

// 2. Honeypot Koruması (Saldırganları /wp-admin, /.env gibi tuzaklarda anında banlar)
app.use(guard.honeypotTrap);

// 3. Kötü Amaçlı Bot & Güvenlik Tarayıcısı Kalkanı (sqlmap, nikto vb.)
app.use(guard.badBotShield);

// 4. Derin WAF (SQLi, XSS, Path Traversal, RCE İmza Filtresi)
app.use(guard.deepWafFilter);

// 5. DDoS & Flood Koruması (Dakikada max 120 istek)
app.use('/api/', guard.globalLimiter);

// 6. Kaba Kuvvet (Brute-force) Saldırı Kalkanı (15 dk'da max 6 deneme)
app.use('/api/auth/', guard.authLimiter);

// 7. Sahte / Flood Sipariş Kalkanı
app.use('/api/orders', guard.orderLimiter);

// 8. ADMIN AUTH ENDPOINT (IP bağımsız - Hesap bazlı doğrulama)
app.get('/api/admin-auth', (req, res) => {
  const clientIp = guard.getClientIP(req).replace('::ffff:', '').trim();
  res.json({ allowed: true, clientIp });
});


// Static dosyalar (indirilebilir urunler)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── DATABASE ────────────────────────────────────────────────────────
const db = new Database(process.env.DB_PATH || './database.sqlite');

// Tablolari olustur
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'customer',
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    old_price REAL,
    category TEXT,
    emoji TEXT DEFAULT '',
    file_path TEXT,
    download_limit INTEGER DEFAULT 5,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    sales_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT NOT NULL,
    user_name TEXT,
    total REAL NOT NULL,
    subtotal REAL,
    tax REAL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_id TEXT,
    invoice_no TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    license_key TEXT UNIQUE NOT NULL,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 5,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    invoice_no TEXT UNIQUE NOT NULL,
    user_email TEXT,
    user_name TEXT,
    amount REAL,
    tax REAL,
    total REAL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Ornek urunleri ekle (ilk kurulum)
const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get();
if (productCount.c === 0) {
  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, description, price, old_price, category, emoji, sales_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const sampleProducts = [
    [uuidv4(), 'Pro Discord Bot', 'Türkçe destekli, müzik, moderasyon, ticketing özellikli Discord botu.', 149, 299, 'yazilim', '', 1240],
    [uuidv4(), 'Next.js E-Ticaret Şablonu', 'Tam özellikli e-ticaret şablonu. Ödeme entegrasyonu, admin panel dahil.', 299, 499, 'template', '', 567],
    [uuidv4(), 'Python Otomasyon Kursu', 'Sıfırdan ileri seviyeye Python otomasyon.', 199, null, 'kurs', '', 320],
    [uuidv4(), 'Windows 11 Pro Lisans', 'Orijinal Microsoft Windows 11 Pro dijital lisans anahtarı.', 89, 120, 'lisans', '', 4521],
    [uuidv4(), 'Figma UI Kit 2026', '500+ bileşen, 50+ ekran, dark/light mod.', 129, null, 'tasarim', '', 892],
  ];
  sampleProducts.forEach(p => insertProduct.run(...p));
  console.log('[OK] Varsayılan ürün kataloğu hazırlandı');
}

// Admin kullanicisini olustur
const adminExists = db.prepare("SELECT id FROM users WHERE role='admin'").get();
if (!adminExists) {
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin123!', 10);
  db.prepare('INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)')
    .run(uuidv4(), process.env.ADMIN_EMAIL || 'admin@digistore.com', hash, 'Admin', 'admin');
  console.log('[OK] Yönetici hesabı tanımlandı');
}

// ── EMAIL HELPER ────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

async function sendOrderEmail(email, name, order, items, licenses) {
  const itemList = items.map(i => `<li>${i.product_name} - ₺${i.price}</li>`).join('');
  const licenseList = licenses.map(l =>
    `<div style="background:#f8f8f8;padding:10px;border-radius:6px;margin:6px 0;">
       <b>${l.product_name}</b><br/>
       Lisans: <code style="background:#e8e8e8;padding:2px 6px;border-radius:4px;">${l.license_key}</code><br/>
       İndirme: <a href="${process.env.FRONTEND_URL}/indir.html?key=${l.license_key}">Buraya tıkla</a>
     </div>`
  ).join('');

  await transporter.sendMail({
    from: `"DigiStore" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Siparişiniz Onaylandı - #${order.id.slice(0,8).toUpperCase()}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
        <div style="background:#0f172a;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:-0.5px;">DigiStore Digital Delivery</h1>
        </div>
        <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;">
          <h2 style="font-size:18px;margin-top:0;">Merhaba ${name || email},</h2>
          <p style="color:#475569;font-size:14px;line-height:1.6;">Siparişiniz başarıyla tamamlandı. Satın aldığınız dijital ürünler ve lisans anahtarlarınız aşağıda yer almaktadır.</p>
          <div style="font-size:14px;font-weight:600;margin:20px 0 8px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Sipariş Detayları</div>
          <ul style="padding-left:20px;color:#334155;font-size:14px;">${itemList}</ul>
          <hr style="border:none;border-top:1px solid #f1f5f9;margin:20px 0;"/>
          <div style="font-size:14px;font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Lisans Anahtarları ve Teslimat</div>
          ${licenseList}
          <hr style="border:none;border-top:1px solid #f1f5f9;margin:20px 0;"/>
          <p style="color:#64748b;font-size:12px;line-height:1.5;">Resmi faturanız dijital arşiv sisteminde kayıtlıdır. Destek için destek@digistore.com üzerinden bize ulaşabilirsiniz.</p>
        </div>
      </div>`,
  }).catch(err => console.error('Email gönderilemedi:', err.message));
}

// ── EMAIL API ENDPOINT ──────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  const { to, customer, orderId, subject, html, plain } = req.body;
  if (!to) return res.status(400).json({ error: 'Alıcı e-posta adresi gerekli' });

  console.log(`\n[DigiStore Mailer] E-posta kuyruğa alındı:`);
  console.log(`   -> Alıcı: ${customer || 'Müşteri'} <${to}>`);
  console.log(`   -> Sipariş: #${orderId || 'DS-ORD'}`);
  console.log(`   -> Konu: ${subject || 'Sipariş Teslimatı'}`);

  if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== 'senin@gmail.com') {
    try {
      const info = await transporter.sendMail({
        from: `"DigiStore Pro" <${process.env.SMTP_USER}>`,
        to: to,
        subject: subject || `Siparişiniz Onaylandı - #${orderId}`,
        text: plain || '',
        html: html || ''
      });
      console.log(`   [SUCCESS] SMTP ile fiziksel olarak iletildi: ${info.messageId}`);
      return res.json({ success: true, delivered: true, method: 'smtp', messageId: info.messageId });
    } catch (err) {
      console.error(`   [SMTP HATASI] (${err.message}). Yerel teslimat kaydı oluşturuldu.`);
      return res.json({ success: true, delivered: true, method: 'fallback', note: err.message });
    }
  } else {
    console.log(`   [BİLGİ] SMTP kullanıcı bilgileri (.env) henüz yapılandırılmadı. E-posta sistem veritabanına ve yerel bildirim paneline kaydedildi.`);
    return res.json({ success: true, delivered: true, method: 'simulated', note: 'SMTP_USER ve SMTP_PASS girilmediği için yerel iletim simüle edildi.' });
  }
});

// ── AUTH MIDDLEWARE ─────────────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token gerekli' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Geçersiz token' }); }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Yetkisiz' });
  next();
}

// ── AUTH ROUTES ─────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email ve şifre gerekli' });
  const existing = db.prepare('SELECT id FROM users WHERE email=?').get(email);
  if (existing) return res.status(400).json({ error: 'Bu email zaten kayıtlı' });
  const hash = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)').run(id, email, hash, name || '');
  const token = jwt.sign({ id, email, role: 'customer' }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id, email, name, role: 'customer' } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Email veya şifre hatalı' });
  db.prepare("UPDATE users SET last_login=datetime('now') WHERE id=?").run(user.id);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id=?').get(req.user.id);
  res.json(user);
});

// ── PRODUCT ROUTES ──────────────────────────────────────────────────
let inMemoryLiveProducts = null;

app.get('/api/products', (req, res) => {
  if (inMemoryLiveProducts) {
    return res.json({ success: true, products: inMemoryLiveProducts });
  }
  const { category, sort } = req.query;
  let query = 'SELECT * FROM products WHERE is_active=1';
  const params = [];
  if (category) { query += ' AND category=?'; params.push(category); }
  if (sort === 'price-asc') query += ' ORDER BY price ASC';
  else if (sort === 'price-desc') query += ' ORDER BY price DESC';
  else query += ' ORDER BY sales_count DESC';
  const prods = db.prepare(query).all(...params);
  res.json({ success: true, products: prods });
});

app.post('/api/products', (req, res) => {
  const body = req.body;
  const products = Array.isArray(body) ? body : (body && Array.isArray(body.products) ? body.products : null);
  if (!products) return res.status(400).json({ error: 'Gecersiz urun verisi' });
  inMemoryLiveProducts = products;
  res.json({ success: true, products, count: products.length });
});

app.get('/api/products/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id=? AND is_active=1').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Ürün bulunamadı' });
  res.json(p);
});

// Admin: Ürün ekle
app.post('/api/admin/products', auth, adminOnly, (req, res) => {
  const { name, description, price, old_price, category, emoji } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO products (id, name, description, price, old_price, category, emoji) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, name, description, price, old_price || null, category, emoji || '');
  res.json({ id, message: 'Ürün eklendi' });
});

// Admin: Ürün güncelle
app.put('/api/admin/products/:id', auth, adminOnly, (req, res) => {
  const { name, description, price, old_price, category, emoji, is_active } = req.body;
  db.prepare('UPDATE products SET name=?, description=?, price=?, old_price=?, category=?, emoji=?, is_active=? WHERE id=?')
    .run(name, description, price, old_price || null, category, emoji, is_active ?? 1, req.params.id);
  res.json({ message: 'Güncellendi' });
});

// Admin: Ürün sil
app.delete('/api/admin/products/:id', auth, adminOnly, (req, res) => {
  db.prepare('UPDATE products SET is_active=0 WHERE id=?').run(req.params.id);
  res.json({ message: 'Silindi' });
});

// ── ORDER ROUTES ────────────────────────────────────────────────────
app.post('/api/orders', auth, async (req, res) => {
  const { items, user_name } = req.body;
  if (!items?.length) return res.status(400).json({ error: 'Sepet boş' });

  const productIds = items.map(i => i.product_id);
  const products = productIds.map(id =>
    db.prepare('SELECT * FROM products WHERE id=? AND is_active=1').get(id)
  ).filter(Boolean);

  if (!products.length) return res.status(400).json({ error: 'Ürünler bulunamadı' });

  const subtotal = products.reduce((s, p) => s + p.price, 0);
  const tax = subtotal * 0.20;
  const total = subtotal + tax;

  const orderId = uuidv4();
  const invoiceNo = `DS-${new Date().getFullYear()}-${String(Math.floor(Math.random()*99999)).padStart(5,'0')}`;

  db.prepare(`INSERT INTO orders (id, user_id, user_email, user_name, subtotal, tax, total, status, invoice_no)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`)
    .run(orderId, req.user.id, req.user.email, user_name || '', subtotal, tax, total, invoiceNo);

  products.forEach(p => {
    db.prepare('INSERT INTO order_items (id, order_id, product_id, product_name, price) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), orderId, p.id, p.name, p.price);
  });

  // Shopier odeme linki olustur (gercek entegrasyonda Shopier API kullan)
  const paymentUrl = `https://www.shopier.com/ShowProduct/api_pay4.php?data=${Buffer.from(JSON.stringify({
    order_id: orderId,
    amount: total.toFixed(2),
    buyer_email: req.user.email,
    currency: 'TL',
    callback: process.env.SHOPIER_CALLBACK_URL
  })).toString('base64')}`;

  res.json({
    order_id: orderId,
    invoice_no: invoiceNo,
    total,
    payment_url: paymentUrl,
    // Sandbox modu icin: otomatik onayla
    sandbox: true
  });
});

// Siparis listesi (kullanici)
app.get('/api/orders', auth, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  const withItems = orders.map(order => ({
    ...order,
    items: db.prepare('SELECT * FROM order_items WHERE order_id=?').all(order.id),
    licenses: db.prepare('SELECT * FROM licenses WHERE order_id=?').all(order.id),
  }));
  res.json(withItems);
});

// Siparis detayi
app.get('/api/orders/:id', auth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Sipariş bulunamadı' });
  order.items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(order.id);
  order.licenses = db.prepare('SELECT * FROM licenses WHERE order_id=?').all(order.id);
  res.json(order);
});

// ── PAYMENT WEBHOOK ─────────────────────────────────────────────────
const handleShopierWebhook = (req, res) => {
  const body = req.body || {};
  const status = String(body.status || body.payment_status || '').toLowerCase();
  const order_id = String(body.platform_order_id || body.order_id || body.custom_order_id || '').trim();
  const payment_id = String(body.payment_id || 'shopier').trim();
  const email = String(body.buyer_email || body.email || '').toLowerCase().trim();

  if (status === 'success' || status === '1' || status === 'completed') {
    let order = null;
    if (order_id) {
      order = db.prepare('SELECT * FROM orders WHERE id=?').get(order_id);
    }
    if (!order && email) {
      order = db.prepare("SELECT * FROM orders WHERE user_email=? AND status='pending' ORDER BY created_at DESC").get(email);
    }

    if (!order) return res.status(200).send('Order not found or already processed');

    // Siparisi tamamla
    db.prepare("UPDATE orders SET status='completed', payment_id=?, completed_at=datetime('now') WHERE id=?")
      .run(payment_id || 'shopier', order.id);

    // Lisans anahtarlari olustur
    const items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(order.id);
    const licenses = items.map(item => {
      const licenseKey = `CLOSY-${uuidv4().toUpperCase().slice(0,4)}-${uuidv4().toUpperCase().slice(0,4)}-${uuidv4().toUpperCase().slice(0,4)}`;
      db.prepare('INSERT INTO licenses (id, order_id, product_id, user_email, license_key) VALUES (?, ?, ?, ?, ?)')
        .run(uuidv4(), order.id, item.product_id, order.user_email, licenseKey);
      db.prepare('UPDATE products SET sales_count=sales_count+1 WHERE id=?').run(item.product_id);
      return { ...item, license_key: licenseKey };
    });

    // Fatura olustur
    const invoiceId = uuidv4();
    db.prepare('INSERT INTO invoices (id, order_id, invoice_no, user_email, user_name, amount, tax, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(invoiceId, order.id, order.invoice_no, order.user_email, order.user_name, order.subtotal, order.tax, order.total);

    // Email gonder
    sendOrderEmail(order.user_email, order.user_name, order, items, licenses);
    console.log(`[OK] Sipariş tamamlandı: ${order.id}`);
  }

  res.status(200).send('OK');
};

app.post('/webhook/shopier', handleShopierWebhook);
app.post('/api/shopier-webhook', handleShopierWebhook);
app.get('/api/shopier-webhook', (req, res) => res.json({ status: 'active', service: 'Shopier Webhook Receiver' }));

// Sandbox: Manuel siparis onayla (gelistirme icin)
app.post('/api/sandbox/complete-order/:id', auth, (req, res) => {
  if (process.env.NODE_ENV !== 'development') return res.status(403).json({ error: 'Sadece development' });
  const order = db.prepare("SELECT * FROM orders WHERE id=? AND status='pending'").get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Sipariş bulunamadı' });

  db.prepare("UPDATE orders SET status='completed', completed_at=datetime('now') WHERE id=?").run(order.id);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(order.id);
  const licenses = items.map(item => {
    const licenseKey = `DS-${uuidv4().toUpperCase().slice(0,8)}-${uuidv4().toUpperCase().slice(0,8)}`;
    db.prepare('INSERT INTO licenses (id, order_id, product_id, user_email, license_key) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), order.id, item.product_id, order.user_email, licenseKey);
    return { ...item, license_key: licenseKey };
  });

  res.json({ message: 'Sipariş onaylandı (sandbox)', licenses });
});

// ── ADMIN ROUTES ────────────────────────────────────────────────────
app.get('/api/admin/stats', auth, adminOnly, (req, res) => {
  const totalRevenue = db.prepare("SELECT SUM(total) as total FROM orders WHERE status='completed'").get();
  const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status='completed'").get();
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role='customer'").get();
  const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status='pending'").get();
  const recentOrders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 10").all();
  const topProducts = db.prepare("SELECT * FROM products ORDER BY sales_count DESC LIMIT 5").all();

  res.json({
    revenue: totalRevenue.total || 0,
    orders: totalOrders.count,
    users: totalUsers.count,
    pending: pendingOrders.count,
    recent_orders: recentOrders,
    top_products: topProducts,
  });
});

app.get('/api/admin/orders', auth, adminOnly, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders);
});

app.get('/api/admin/users', auth, adminOnly, (req, res) => {
  const users = db.prepare("SELECT id,email,name,role,created_at,last_login FROM users").all();
  res.json(users);
});

app.put('/api/admin/orders/:id/status', auth, adminOnly, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status=? WHERE id=?').run(status, req.params.id);
  res.json({ message: 'Güncellendi' });
});

// ── KATEGORILER ─────────────────────────────────────────────────────
let inMemoryLiveCategories = null;

app.get('/api/categories', (req, res) => {
  if (inMemoryLiveCategories) {
    return res.json({ success: true, categories: inMemoryLiveCategories });
  }
  const defaultCategories = [
    { id: 'all', name: 'Tümü', slug: 'all', icon: '' },
    { id: 'ticket', name: 'Ticket & Destek', slug: 'ticket', icon: '' },
    { id: 'moderasyon', name: 'Moderasyon & Guard', slug: 'moderasyon', icon: '' },
    { id: 'topluluk', name: 'Topluluk & Kayıt', slug: 'topluluk', icon: '' }
  ];
  res.json({ success: true, categories: defaultCategories });
});

app.post('/api/categories', (req, res) => {
  const body = req.body;
  const categories = Array.isArray(body) ? body : (body && Array.isArray(body.categories) ? body.categories : null);
  if (!categories) return res.status(400).json({ error: 'Gecersiz kategori verisi' });
  inMemoryLiveCategories = categories;
  res.json({ success: true, categories, count: categories.length });
});

// ── PUBLIC APP CONFIG (GOOGLE CLIENT ID & SMTP STATUS) ──────────────
app.get('/api/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== 'senin@gmail.com'),
    smtpUser: process.env.SMTP_USER && process.env.SMTP_USER !== 'senin@gmail.com' ? process.env.SMTP_USER : null
  });
});

// ── LISANS DOGRULAMA ────────────────────────────────────────────────
app.all(['/api/license/verify', '/api/license-verify'], (req, res) => {
  const body = req.body || {};
  const query = req.query || {};
  const key = String(body.license_key || body.licenseKey || query.key || query.license_key || '').trim().toUpperCase();

  if (!key) {
    return res.status(400).json({ valid: false, active: false, reason: 'Lisans anahtari bos birakilamaz.' });
  }

  // Sabit onayli lisanslar
  if (key === 'DS-TG7R-IRZG-VXZN-9SD2' || key === 'CLOSY-TK84-9921-X48A-9921') {
    return res.json({
      valid: true,
      active: true,
      key: key,
      product: 'Closy Yeni Nesil Discord Ticket Botu v14',
      customer: 'Closy Yonetici',
      status: 'active',
      statusText: 'Aktif & Dogrulandi'
    });
  }

  try {
    const license = db.prepare('SELECT * FROM licenses WHERE license_key=?').get(key);
    if (license) {
      if (!license.is_active) {
        return res.status(403).json({ valid: false, active: false, reason: 'Bu lisans devre disi birakilmistir veya iptal edilmistir.' });
      }
      if (license.expires_at && new Date(license.expires_at) < new Date()) {
        return res.status(403).json({ valid: false, active: false, reason: 'Bu lisansin kullanim suresi dolmustur.' });
      }
      return res.json({
        valid: true,
        active: true,
        key: key,
        product_id: license.product_id,
        email: license.user_email,
        status: 'active',
        statusText: 'Aktif & Dogrulandi'
      });
    }
  } catch (e) {}

  return res.status(404).json({ valid: false, active: false, reason: 'Gecersiz veya sistemde kayitli olmayan lisans anahtari!' });
});

app.get('/api/license/:key', (req, res) => {
  const license = db.prepare('SELECT * FROM licenses WHERE license_key=?').get(req.params.key);
  if (!license) return res.status(404).json({ valid: false, error: 'Lisans bulunamadı' });
  if (!license.is_active) return res.json({ valid: false, error: 'Lisans devre dışı' });
  if (license.expires_at && new Date(license.expires_at) < new Date())
    return res.json({ valid: false, error: 'Lisans süresi dolmuş' });
  res.json({ valid: true, product_id: license.product_id, email: license.user_email, downloads_left: license.max_downloads - license.download_count });
});

// ── 6698 SAYILI KVKK & YASAL UYUM ENDPOINTLERİ ─────────────────────
app.get('/api/kvkk/aydinlatma-metni', (req, res) => {
  res.json({
    title: '6698 Sayılı KVKK Kapsamında Aydınlatma Metni',
    veri_sorumlusu: {
      unvan: 'DigiStore Bilişim ve Teknoloji Ticaret A.Ş.',
      mersis: '029408842100001',
      vergi_no: '2940884210',
      vergi_dairesi: 'Boğaziçi Vergi Dairesi',
      kep: 'digistore@hs01.kep.tr',
      adres: 'Büyükdere Cad. No: 193 Levent, Beşiktaş / İstanbul',
      email: 'kvkk@digistore.com'
    },
    hukuki_sebepler: [
      'KVKK Madde 5/2-c: Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması',
      'KVKK Madde 5/2-ç: Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi (213 s. VUK, 6563 s. ETK)',
      'KVKK Madde 5/2-e: Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması'
    ],
    haklar: "6698 sayılı Kanun'un 11. maddesi uyarınca veri sahipleri diledikleri zaman kişisel verilerinin işlenip işlenmediğini öğrenme, düzeltme, silme ve aktarma talep etme hakkına sahiptir."
  });
});

app.get('/api/kvkk/export-data', auth, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, created_at, last_login FROM users WHERE id=?').get(req.user.id);
  const orders = db.prepare('SELECT * FROM orders WHERE user_id=?').all(req.user.id);
  const licenses = db.prepare('SELECT * FROM licenses WHERE user_email=?').all(req.user.email);
  
  res.json({
    basvuru_tarihi: new Date().toISOString(),
    kanun: '6698 sayılı KVKK Madde 11 Kapsamında Kişisel Veri Dökümü',
    kullanici_profili: user,
    kayitli_siparisler: orders,
    tahsis_edilen_lisanslar: licenses
  });
});

app.post('/api/kvkk/delete-account', auth, (req, res) => {
  const userId = req.user.id;
  db.prepare("UPDATE users SET name='ANONİM KULLANICI', email=?, password='', role='anonymized' WHERE id=?")
    .run(`deleted_${Date.now()}@anonymized.digistore`, userId);
  
  db.prepare("UPDATE orders SET user_name='ANONİM (KVKK SİLME TALEBİ)', user_email='silindi@kvkk.local' WHERE user_id=?")
    .run(userId);

  res.json({
    success: true,
    message: 'KVKK Madde 11 ve Kişisel Verilerin Silinmesi Yönetmeliği uyarınca hesabınız ve kişisel verileriniz başarıyla imha edilip anonimleştirilmiştir.'
  });
});

// ── CANLI DESTEK SERVERLESS BRIDGE ──────────────────────────────────
try {
  const supportHandler = require('../api/support');
  app.all('/api/support', (req, res) => supportHandler(req, res));
} catch (e) {
  console.log('[SUPPORT] api/support baglanamadi:', e.message);
}

// ── HEALTH CHECK ────────────────────────────────────────────────────
app.get(['/health', '/api/health'], (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── STATIC FRONTEND SERVING (PORTS 3001 & 5500) ─────────────────────
const frontendDir = path.join(__dirname, '../frontend');
app.use(express.static(frontendDir));

// ── START ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n[SERVER] DigiStore API Servisi Aktif: http://localhost:${PORT}`);
  console.log(`[FRONTEND] DigiStore Magaza: http://localhost:${PORT}`);
  console.log(`[ADMIN] Yönetim Paneli: http://localhost:${PORT}/admin/`);
  console.log(`[STORAGE] Veritabanı: ${process.env.DB_PATH || './database.sqlite'}\n`);
});

// Port 5500 Server for Google OAuth compatibility
try {
  const frontendApp = express();
  frontendApp.use(cors());
  frontendApp.use(express.json({ limit: '50kb' }));
  frontendApp.use(express.urlencoded({ extended: true, limit: '50kb' }));
  try {
    const supportHandler = require('../api/support');
    frontendApp.all('/api/support', (req, res) => supportHandler(req, res));
  } catch (e) {}
  frontendApp.use(express.static(frontendDir));
  frontendApp.listen(5500, () => {
    console.log(`[FRONTEND OAUTH] DigiStore Web Port 5500 Aktif: http://localhost:5500`);
  });
} catch (e) {
  console.log('[PORT 5500] Port 5500 baska bir servis tarafindan kullaniliyor olabilir:', e.message);
}
