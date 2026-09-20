// api/license/verify.js - Serverless License Verification Endpoint
const fs = require('fs');
const path = require('path');
const os = require('os');

function getOrdersFilePath() {
  const localPath = path.join(process.cwd(), 'digistore_orders.json');
  const tmpPath = path.join(os.tmpdir(), 'digistore_orders.json');
  try {
    if (fs.existsSync(localPath)) return localPath;
    if (fs.existsSync(tmpPath)) return tmpPath;
    fs.accessSync(process.cwd(), fs.constants.W_OK);
    return localPath;
  } catch (e) {
    return tmpPath;
  }
}

function readAllOrders() {
  const orders = [];
  // 1. Dosyadan oku
  const filePath = getOrdersFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        orders.push(...parsed);
      }
    }
  } catch (e) {}

  // 2. Tmp dosyadan da kontrol et (farkli yazilmis olabilir)
  try {
    const tmpPath = path.join(os.tmpdir(), 'digistore_orders.json');
    if (tmpPath !== filePath && fs.existsSync(tmpPath)) {
      const data = fs.readFileSync(tmpPath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        parsed.forEach(o => {
          if (!orders.some(x => String(x.id) === String(o.id))) {
            orders.push(o);
          }
        });
      }
    }
  } catch (e) {}

  return orders;
}

// Sabit onayli sistem lisanslari
const STATIC_ACTIVE_LICENSES = {
  'DS-TG7R-IRZG-VXZN-9SD2': {
    valid: true,
    active: true,
    key: 'DS-TG7R-IRZG-VXZN-9SD2',
    product: 'Closy Yeni Nesil Discord Ticket Botu v14',
    customer: 'Closy Kurucu & Yonetici',
    email: 'admin@closydev.site',
    status: 'active',
    statusText: 'Aktif & Dogrulandi',
    plan: 'Omur Boyu (Lifetime) Pro Lisans'
  },
  'CLOSY-TK84-9921-X48A-9921': {
    valid: true,
    active: true,
    key: 'CLOSY-TK84-9921-X48A-9921',
    product: 'Closy Yeni Nesil Discord Ticket Botu v14',
    customer: 'Eren Zeybek',
    email: 'erenzeybek01@gmail.com',
    status: 'active',
    statusText: 'Aktif & Dogrulandi',
    plan: 'Omur Boyu (Lifetime) Pro Lisans'
  }
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let key = '';
    if (req.method === 'GET') {
      key = (req.query && (req.query.key || req.query.license_key || req.query.license)) || '';
    } else if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
      }
      key = (body && (body.license_key || body.licenseKey || body.key || body.license)) || '';
    }

    key = String(key || '').trim().toUpperCase();

    if (!key) {
      return res.status(400).json({
        valid: false,
        active: false,
        reason: 'Lisans anahtari bos birakilamaz. Lutfen gecerli bir lisans giriniz.'
      });
    }

    // 1. Sabit onayli sistem lisanslarini denetle
    if (STATIC_ACTIVE_LICENSES[key]) {
      return res.status(200).json(STATIC_ACTIVE_LICENSES[key]);
    }

    // 2. Kayitli siparisler uzerinden ara
    const orders = readAllOrders();
    let matchedOrder = null;

    for (const o of orders) {
      if (o.licenseKeys && Array.isArray(o.licenseKeys)) {
        if (o.licenseKeys.some(k => String(k).trim().toUpperCase() === key)) {
          matchedOrder = o;
          break;
        }
      }
    }

    if (matchedOrder) {
      const isCompleted = matchedOrder.status === 'completed';
      const isPending = matchedOrder.status === 'pending';
      const isCancelled = matchedOrder.status === 'cancelled' || matchedOrder.status === 'refunded';

      if (isCompleted) {
        return res.status(200).json({
          valid: true,
          active: true,
          key: key,
          orderId: matchedOrder.id,
          product: matchedOrder.product || 'Closy Bot Paketi',
          customer: matchedOrder.customer || 'Degerli Musterimiz',
          email: matchedOrder.email || '',
          status: 'active',
          statusText: 'Aktif & Dogrulandi',
          plan: 'Omur Boyu (Lifetime) Pro Lisans'
        });
      } else if (isPending) {
        return res.status(403).json({
          valid: false,
          active: false,
          reason: 'Bu lisans henuz aktif degildir! Siparisinizin yonetici onayi beklenmektedir. Lutfen Discord uzerinden ticket aciniz.'
        });
      } else if (isCancelled) {
        return res.status(403).json({
          valid: false,
          active: false,
          reason: 'Bu lisans iptal edilmis veya iade edilmistir. Sistem tarafindan devre disi birakildi.'
        });
      } else {
        return res.status(403).json({
          valid: false,
          active: false,
          reason: 'Bu lisans su anda aktif durumda degildir (Durum: ' + (matchedOrder.status || 'bilinmiyor') + ').'
        });
      }
    }

    // Lisans bulunamadi (Gecersiz veya sahte anahtar)
    return res.status(404).json({
      valid: false,
      active: false,
      reason: 'Gecersiz veya sistemde bulunamayan lisans anahtari! Lutfen satin aldiginiz resmi lisansi giriniz.'
    });

  } catch (err) {
    return res.status(500).json({
      valid: false,
      active: false,
      reason: 'Lisans dogrulama sunucusunda hata: ' + (err.message || 'Bilinmeyen hata')
    });
  }
};
