// api/shopier-webhook.js - Shopier otomatik odeme dogrulama ve lisans teslimat webhook servisi
const fs = require('fs');
const path = require('path');
const os = require('os');
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  try {
    nodemailer = require(path.join(__dirname, '../backend/node_modules/nodemailer'));
  } catch (err) {
    nodemailer = null;
  }
}

function getFilePath() {
  const tmpPath = path.join(os.tmpdir(), 'digistore_orders.json');
  const localPath = path.join(process.cwd(), 'digistore_orders.json');
  try {
    fs.accessSync(process.cwd(), fs.constants.W_OK);
    return localPath;
  } catch (e) {
    return tmpPath;
  }
}

function readOrders() {
  const filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function writeOrders(orders) {
  const filePath = getFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), 'utf8');
  } catch (e) {
    try {
      const tmpPath = path.join(os.tmpdir(), 'digistore_orders.json');
      fs.writeFileSync(tmpPath, JSON.stringify(orders, null, 2), 'utf8');
    } catch (err) {}
  }
}

function generateLicenseKey() {
  const segs = Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 6).toUpperCase());
  return 'CLOSY-' + segs.join('-');
}

async function sendDeliveryEmail(order, licenseKeys) {
  const smtpUser = process.env.SMTP_USER || 'erenzeybek01@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'xtwcatqxjhborsrd';

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: { user: smtpUser, pass: smtpPass }
  });

  const keysHtml = licenseKeys.map(k => `
    <div style="background:#09090c;border:1px solid #38bdf8;border-radius:10px;padding:12px 16px;margin:8px 0;font-family:monospace;font-size:16px;color:#38bdf8;font-weight:bold;letter-spacing:1px;">
      ${k}
    </div>
  `).join('');

  const keysPlain = licenseKeys.join('\n');

  const html = `
    <div style="background:#000000;color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:32px;max-width:600px;margin:0 auto;border-radius:16px;border:1px solid #27272a;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px;">closydev. | Siparisiniz Onaylandi</h1>
        <p style="color:#a1a1aa;font-size:14px;margin:0;">Shopier odemeniz basariyla alindi ve lisansiniz aktif edildi.</p>
      </div>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin-bottom:20px;">
        <div style="font-size:13px;color:#a1a1aa;margin-bottom:4px;">Siparis No: <b style="color:#fff;">#${order.id}</b></div>
        <div style="font-size:13px;color:#a1a1aa;margin-bottom:4px;">Urun: <b style="color:#fff;">${order.product}</b></div>
        <div style="font-size:13px;color:#a1a1aa;">Tutar: <b style="color:#34c759;">₺${order.amount}</b></div>
      </div>
      <div style="margin-bottom:24px;">
        <div style="font-size:12px;font-weight:700;color:#86868b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">AKTIF DIJITAL LISANS ANAHTARINIZ:</div>
        ${keysHtml}
      </div>
      <div style="margin-bottom:24px;line-height:1.6;font-size:13px;color:#cbd5e1;">
        <p>Bot kurulum dosyalari ve masaustu yonetim panelini indirmek icin web sitemizden <b>Hesabim -> Lisanslarim</b> sekmesini ziyaret edebilirsiniz.</p>
        <p>Discord sunucumuz: <a href="https://discord.gg/closydev" style="color:#38bdf8;">discord.gg/closydev</a></p>
      </div>
      <div style="font-size:11px;color:#71717a;text-align:center;border-top:1px solid #27272a;padding-top:16px;">
        closydev. Dijital Bot & Yazilim Hizmetleri
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"closydev." <' + smtpUser + '>',
      to: order.email,
      subject: 'Siparisiniz Onaylandi & Lisansiniz Teslim Edildi - #' + order.id,
      text: `Siparisiniz onaylandi!\nSiparis No: #${order.id}\nUrun: ${order.product}\nLisans Anahtarlarınız:\n${keysPlain}\n\nDetaylar icin closydev.site adresini ziyaret edebilirsiniz.`,
      html: html
    });
  } catch (err) {
    console.error('Webhook mail gonderme hatasi:', err.message);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'closydev Shopier Webhook Listener',
      time: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    try {
      let data = req.body || {};
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          const qs = require('querystring');
          data = qs.parse(data);
        }
      }

      // Shopier gercek format: { id, status, paymentStatus, shippingInfo: {email,...}, totals: {total}, lineItems: [...] }
      // Eski format fallback: { status, platform_order_id, buyer_email, ... }

      const shopierOrderId = String(data.id || data.platform_order_id || data.order_id || data.custom_order_id || data.orderId || '').trim();
      const paymentStatus = String(data.paymentStatus || data.payment_status || '').toLowerCase();
      const orderStatus = String(data.status || data.order_status || '').toLowerCase();
      const paymentId = String(data.paymentId || data.payment_id || shopierOrderId || 'SP-' + Date.now()).trim();

      // Shopier gercek format: shippingInfo.email
      const email = String(
        (data.shippingInfo && data.shippingInfo.email) ||
        data.buyer_email || data.email || data.buyerEmail || ''
      ).toLowerCase().trim();

      const buyerName = String(
        (data.shippingInfo ? ((data.shippingInfo.firstName || '') + ' ' + (data.shippingInfo.lastName || '')).trim() : '') ||
        data.buyer_name || data.customer || ''
      ).trim();

      const totalAmount = Number(
        (data.totals && data.totals.total) ||
        data.total_amount || data.amount || 0
      );

      // paymentStatus === 'paid' veya eski format
      const isSuccess =
        paymentStatus === 'paid' ||
        paymentStatus === 'completed' ||
        orderStatus === 'success' ||
        orderStatus === '1' ||
        orderStatus === 'completed' ||
        orderStatus === 'approved';

      if (!isSuccess) {
        console.log('[Webhook] Ignored - paymentStatus:', paymentStatus, '| orderStatus:', orderStatus);
        return res.status(200).send('IGNORED_NON_SUCCESS');
      }

      const orders = readOrders();
      let matchedOrder = null;

      // Shopier order ID veya bizim ID ile eslesme
      if (shopierOrderId) {
        matchedOrder = orders.find(o =>
          String(o.id).toLowerCase() === shopierOrderId.toLowerCase() ||
          String(o.shopierOrderId || '').toLowerCase() === shopierOrderId.toLowerCase()
        );
      }

      // Email ile pending siparis bul
      if (!matchedOrder && email) {
        matchedOrder = orders.find(o => o.email && o.email.toLowerCase() === email && o.status === 'pending');
      }

      let licenseKeys = [];

      if (matchedOrder) {
        if (matchedOrder.status !== 'completed') {
          licenseKeys = (matchedOrder.licenseKeys && matchedOrder.licenseKeys.length)
            ? matchedOrder.licenseKeys
            : (matchedOrder.items && matchedOrder.items.length ? matchedOrder.items.map(() => generateLicenseKey()) : [generateLicenseKey()]);

          matchedOrder.status = 'completed';
          matchedOrder.paymentId = paymentId;
          matchedOrder.paidAt = new Date().toISOString();
          matchedOrder.licenseKeys = licenseKeys;

          writeOrders(orders);
          await sendDeliveryEmail(matchedOrder, licenseKeys);
        } else {
          licenseKeys = matchedOrder.licenseKeys || [];
        }

        return res.status(200).json({
          success: true,
          action: 'order_completed',
          orderId: matchedOrder.id,
          licenseKeys: licenseKeys
        });
      } else {
        const newOrderId = orderId || ('DS-' + Math.floor(100000 + Math.random() * 900000));
        licenseKeys = [generateLicenseKey()];
        const createdOrder = {
          id: newOrderId,
          customer: buyerName || 'Shopier Müşterisi',
          email: email || 'musteri@closydev.site',
          phone: String(data.buyer_phone || ''),
          product: 'ClosyDev Discord Bot Paketi',
          items: [{ id: 1, name: 'ClosyDev Discord Bot Paketi', qty: 1, price: totalAmount || 0 }],
          amount: totalAmount || 0,
          status: 'completed',
          date: 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          method: 'Shopier 3D Secure',
          paymentId: paymentId,
          paidAt: new Date().toISOString(),
          licenseKeys: licenseKeys,
          invoiceType: 'Bireysel'
        };

        orders.unshift(createdOrder);
        writeOrders(orders);
        await sendDeliveryEmail(createdOrder, licenseKeys);

        return res.status(200).json({
          success: true,
          action: 'order_created_and_completed',
          orderId: newOrderId,
          licenseKeys: licenseKeys
        });
      }
    } catch (err) {
      console.error('Webhook error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).send('Method Not Allowed');
};
