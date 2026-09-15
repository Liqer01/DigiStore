// api/orders.js - Serverless orders synchronization
const fs = require('fs');
const path = require('path');
const os = require('os');

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

let inMemoryOrders = [];

function readOrders() {
  const filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        inMemoryOrders = parsed;
        return inMemoryOrders;
      }
    }
  } catch (e) {}
  return inMemoryOrders;
}

function writeOrders(orders) {
  inMemoryOrders = orders;
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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const orders = readOrders();
    return res.status(200).json({
      success: true,
      orders: orders
    });
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {}
      }

      if (!body || typeof body !== 'object') {
        return res.status(400).json({ success: false, error: 'Gecersiz siparis verisi' });
      }

      const orders = readOrders();
      const existingIdx = orders.findIndex(o => String(o.id) === String(body.id));
      if (existingIdx !== -1) {
        orders[existingIdx] = { ...orders[existingIdx], ...body };
      } else {
        orders.unshift(body);
      }

      writeOrders(orders);

      return res.status(200).json({
        success: true,
        order: body,
        totalOrders: orders.length
      });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Metot desteklenmiyor' });
};
