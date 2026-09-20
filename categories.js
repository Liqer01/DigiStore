// api/categories.js - Serverless Live Categories Sync
const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'Tümü', slug: 'all', icon: '' },
  { id: 'ticket', name: 'Ticket & Destek', slug: 'ticket', icon: '' },
  { id: 'moderasyon', name: 'Moderasyon & Guard', slug: 'moderasyon', icon: '' },
  { id: 'topluluk', name: 'Topluluk & Kayıt', slug: 'topluluk', icon: '' }
];

function getFilePath() {
  const tmpPath = path.join(os.tmpdir(), 'digistore_categories.json');
  const localPath = path.join(process.cwd(), 'digistore_categories.json');
  try {
    fs.accessSync(process.cwd(), fs.constants.W_OK);
    return localPath;
  } catch (e) {
    return tmpPath;
  }
}

let inMemoryCategories = null;

function readCategories() {
  if (inMemoryCategories && inMemoryCategories.length > 0) {
    return inMemoryCategories;
  }
  const filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryCategories = parsed;
        return inMemoryCategories;
      }
    }
  } catch (e) {}
  inMemoryCategories = DEFAULT_CATEGORIES;
  return inMemoryCategories;
}

function writeCategories(categories) {
  inMemoryCategories = categories;
  const filePath = getFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(categories, null, 2), 'utf8');
  } catch (e) {
    try {
      const tmpPath = path.join(os.tmpdir(), 'digistore_categories.json');
      fs.writeFileSync(tmpPath, JSON.stringify(categories, null, 2), 'utf8');
    } catch (err) {}
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const categories = readCategories();
    return res.status(200).json({
      success: true,
      categories: categories,
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

      let newCategories = null;
      if (Array.isArray(body)) {
        newCategories = body;
      } else if (body && Array.isArray(body.categories)) {
        newCategories = body.categories;
      } else if (body && body.action === 'deleteCategory' && body.slug) {
        const current = readCategories();
        newCategories = current.filter(c => c.slug !== body.slug && c.id !== body.slug);
      }

      if (!newCategories || !Array.isArray(newCategories)) {
        return res.status(400).json({ success: false, error: 'Gecersiz kategori listesi' });
      }

      writeCategories(newCategories);

      return res.status(200).json({
        success: true,
        categories: newCategories,
        totalCategories: newCategories.length,
        updatedAt: Date.now()
      });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Metot desteklenmiyor' });
};
