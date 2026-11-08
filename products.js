// api/products.js - Serverless Live Products Sync
const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_PRODUCTS = [
  {
    "id": 1,
    "name": "Closy Organ Mafyası & Cerrahi Ameliyat Masası v2.0",
    "category": "illegal",
    "price": 249,
    "oldPrice": 399,
    "rating": 5.0,
    "reviews": 312,
    "badge": "hot",
    "desc": "FiveM'in en gelişmiş illegal organ mafyası sistemi. Portatif ambulans sedyesi, canlı 3D neşter kesimi, kurbanın acıyla çırpınma ve çığlık sesleri, kalp/böbrek sökümü ve karaborsa doktoru.",
    "features": [
      "Canlı 3D Cerrahi Kesi & Çırpınma Animasyonları",
      "Kalp (Flatline), Böbrekler & Göz Korneası Sökümü",
      "Tekerlekli Ambulans Sedyesi (v_med_emptybed)",
      "0.00 ms Resmon & Açık Kaynak Kod"
    ],
    "downloads": 2150,
    "active": true,
    "filePackage": "custom-npcrobbery.zip"
  },
  {
    "id": 2,
    "name": "Closy Gelişmiş Soygun Tableti & Canlı Kameralar",
    "category": "illegal",
    "price": 199,
    "oldPrice": 299,
    "rating": 4.9,
    "reviews": 184,
    "badge": "new",
    "desc": "Modern NUI arayüzlü profesyonel soygun tableti. Canlı şehir güvenlik kameralarını hackleme, koordineli soygun ekibi kurma, alarm bypass mini-oyunları ve anlık polis bildirimleri.",
    "features": [
      "Canlı Şehir Kameralarını İzleme & Hack Arayüzü",
      "Şifre Kırma & Devre By-Pass Mini Oyunları",
      "QBCore & ESX Altyapılarıyla %100 Uyumlu",
      "Bilmeyene Ücretsiz Birebir Kurulum Desteği"
    ],
    "downloads": 1420,
    "active": true,
    "filePackage": "custom-heisttablet.zip"
  },
  {
    "id": 3,
    "name": "Closy Modern NUI Envanter Sistemi (v3.0)",
    "category": "ui",
    "price": 299,
    "oldPrice": 450,
    "rating": 5.0,
    "reviews": 420,
    "badge": "sale",
    "desc": "Yüksek FPS ve sıfır gecikme odaklı modern sürükle-bırak envanter. Eşya dayanıklılığı, özel cepler, silah eklentileri, torpido & bagaj entegrasyonu ve ses efektli şık cam tasarım.",
    "features": [
      "0.01 ms Resmon Değeri (Ultra Optimize)",
      "Sürükle - Bırak & Hızlı Kullanım Slotları",
      "Eşya Ağırlık, Dayanıklılık & Seri No Sistemi",
      "Açık Kaynak Kod & Kolay Config"
    ],
    "downloads": 3890,
    "active": true,
    "filePackage": "custom-inventory.zip"
  },
  {
    "id": 4,
    "name": "Closy Gelişmiş Motel & Mülk Kiralama Sistemi",
    "category": "jobs",
    "price": 169,
    "oldPrice": 250,
    "rating": 4.8,
    "reviews": 95,
    "badge": null,
    "desc": "Çok katlı motel odaları, oda anahtarı kopyalama, kıyafet dolabı, özel gizli kasa zulaları ve modern NUI resepsiyon paneli. Rol sunucuları için vazgeçilmez altyapı.",
    "features": [
      "Şık Resepsiyon & Oda Kiralama Paneli",
      "Arkadaşa Anahtar Verme & İzin Sistemi",
      "Entegre Zula Deposu & Kıyafet Dolabı",
      "Sıfır Çakışma & Optimize Bucket Mimarisi"
    ],
    "downloads": 890,
    "active": true,
    "filePackage": "custom-motel.zip"
  },
  {
    "id": 5,
    "name": "Closy Yeni Nesil Bankacılık & 3D ATM Sistemi",
    "category": "ui",
    "price": 229,
    "oldPrice": 360,
    "rating": 4.9,
    "reviews": 160,
    "badge": "hot",
    "hasVideo": true,
    "videoPreview": "assets/videos/atm-preview.mp4",
    "videoFull": "assets/videos/atm-showcase.mp4",
    "videoPoster": "assets/videos/atm-thumb.jpg",
    "desc": "3D animasyonlu banka ve ATM kart arayüzü. IBAN ile anında para transferi, fatura ve ceza ödeme, ortak şirket hesabı yönetimi ve işlem dekontu geçmişi.",
    "features": [
      "Modern NUI Arayüzü & Akıcı Geçişler",
      "Kredi Kartı Şifresi (PIN) & Ortak Hesaplar",
      "Fatura & Trafik Cezası Ödeme Sistemi",
      "Tam Açık Kaynak & Kolay Entegrasyon"
    ],
    "downloads": 1650,
    "active": true,
    "filePackage": "custom-banking.zip"
  },
  {
    "id": 6,
    "name": "Closy Gelişmiş Polis Departmanı & MDT Tableti",
    "category": "jobs",
    "price": 219,
    "oldPrice": 320,
    "rating": 5.0,
    "reviews": 275,
    "badge": "hot",
    "desc": "Emniyet teşkilatı için eksiksiz polis tableti. Canlı kamera takip, plaka sorgulama, sabıka kaydı, arama emri çıkarma, ceza kesme ve cezaevi süre takibi.",
    "features": [
      "Canlı GPS Takip & Polis Telsiz Entegrasyonu",
      "Plaka, Ruhsat & Kimlik Biyometrik Tarama",
      "Otomatik Ceza ve Kamu Hizmeti Sistemi",
      "Bilmeyene Ücretsiz Sunucu Kurulumu"
    ],
    "downloads": 2410,
    "active": true,
    "filePackage": "custom-police.zip"
  },
  {
    "id": 7,
    "name": "Closy Gelişmiş Hastane & Canlı Sedye Sistemi",
    "category": "jobs",
    "price": 189,
    "oldPrice": 280,
    "rating": 4.9,
    "reviews": 130,
    "badge": null,
    "desc": "Ambulans ve acil servis personeli için sedyeli müdahale, tekerlekli sandalye, kan grubu tahlili, serum bağlama ve ameliyathane operasyon paketi.",
    "features": [
      "İtilebilir ve Ambulansa Yüklenebilir Sedye",
      "Kan Alma, Nakil & Tahlil Kiti",
      "Yaralanma Teşhis & Canlandırma Sistemi",
      "0.00 ms Resmon & Açık Kaynak Kod"
    ],
    "downloads": 1120,
    "active": true,
    "filePackage": "custom-ambulance.zip"
  },
  {
    "id": 8,
    "name": "Closy Full QBCore V2 Sunucu Paketi (Anahtar Teslim)",
    "category": "packages",
    "price": 899,
    "oldPrice": 1499,
    "rating": 5.0,
    "reviews": 540,
    "badge": "sale",
    "desc": "Tüm ClosyDEV scriptlerinin (Organ Mafyası, Soygun Tableti, Envanter, Banka, Polis MDT, Motel vb.) kurulu ve %100 senkronize çalıştığı, dengeli ekonomi ve 60+ FPS optimize full FiveM paketi.",
    "features": [
      "Tüm ClosyDEV Özel Scriptleri Dahil",
      "Dengeli Ekonomi, İllegal & Legal Meslekler",
      "VDS Sunucunuza Birebir Anahtar Teslim Kurulum",
      "Ömür Boyu Güncelleme & 7/24 VIP Destek"
    ],
    "downloads": 780,
    "active": true,
    "filePackage": "ClosyPACK_Full_v2.zip"
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
