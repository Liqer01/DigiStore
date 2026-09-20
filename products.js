// api/products.js - Serverless Live Products Sync
const fs = require('fs');
const path = require('path');
const os = require('os');

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

function getFilePath() {
  const tmpPath = path.join(os.tmpdir(), 'digistore_products.json');
  const localPath = path.join(process.cwd(), 'digistore_products.json');
  try {
    fs.accessSync(process.cwd(), fs.constants.W_OK);
    return localPath;
  } catch (e) {
    return tmpPath;
  }
}

let inMemoryProducts = null;

function readProducts() {
  if (inMemoryProducts && inMemoryProducts.length > 0) {
    return inMemoryProducts;
  }
  const filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryProducts = parsed;
        return inMemoryProducts;
      }
    }
  } catch (e) {}
  inMemoryProducts = DEFAULT_PRODUCTS;
  return inMemoryProducts;
}

function writeProducts(products) {
  inMemoryProducts = products;
  const filePath = getFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
  } catch (e) {
    try {
      const tmpPath = path.join(os.tmpdir(), 'digistore_products.json');
      fs.writeFileSync(tmpPath, JSON.stringify(products, null, 2), 'utf8');
    } catch (err) {}
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const products = readProducts();
    return res.status(200).json({
      success: true,
      products: products,
      updatedAt: Date.now()
    });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {}
      }

      let newProducts = null;
      if (Array.isArray(body)) {
        newProducts = body;
      } else if (body && Array.isArray(body.products)) {
        newProducts = body.products;
      } else if (body && body.action === 'updatePrice' && body.productId) {
        const current = readProducts();
        const p = current.find(x => String(x.id) === String(body.productId));
        if (p) {
          p.price = Number(body.price);
          if (body.oldPrice !== undefined) p.oldPrice = Number(body.oldPrice);
        }
        newProducts = current;
      }

      if (!newProducts || !Array.isArray(newProducts)) {
        return res.status(400).json({ success: false, error: 'Gecersiz urun listesi verisi' });
      }

      writeProducts(newProducts);

      return res.status(200).json({
        success: true,
        products: newProducts,
        totalProducts: newProducts.length,
        updatedAt: Date.now()
      });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Metot desteklenmiyor' });
};
