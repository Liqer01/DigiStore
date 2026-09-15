// api/support.js - Canli Destek Gercek Yonetici (admin@digistore.com) Entegrasyonu
const fs = require('fs');
const path = require('path');
const os = require('os');

function getFilePath() {
  const tmpPath = path.join(os.tmpdir(), 'digistore_support.json');
  const localPath = path.join(process.cwd(), 'digistore_support.json');
  try {
    fs.accessSync(process.cwd(), fs.constants.W_OK);
    return localPath;
  } catch (e) {
    return tmpPath;
  }
}

let inMemoryData = {
  chats: [],
  adminOnlineUntil: 0
};

function readSupportData() {
  const filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.chats)) {
        inMemoryData = parsed;
        return inMemoryData;
      }
    }
  } catch (e) {}
  return inMemoryData;
}

function writeSupportData(data) {
  inMemoryData = data;
  const filePath = getFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    try {
      const tmpPath = path.join(os.tmpdir(), 'digistore_support.json');
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {}
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status ? res.status(200).end() : res.end();

  const send = (code, body) => {
    res.statusCode = code;
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
    }
    if (typeof res.status === 'function' && typeof res.status(code).json === 'function') {
      return res.status(code).json(body);
    }
    if (typeof res.json === 'function') {
      return res.json(body);
    }
    return res.end(JSON.stringify(body));
  };

  const data = readSupportData();
  const now = Date.now();
  const isAdminOnline = (data.adminOnlineUntil || 0) > now;

  if (req.method === 'GET') {
    return send(200, {
      success: true,
      adminOnline: isAdminOnline,
      chats: data.chats || []
    });
  }

  if (req.method === 'POST') {
    const { action, chatId, sessionId, userEmail, userName, text, isAdmin, senderEmail } = req.body || {};

    // 1. Yonetici Kalp Atisi (Heartbeat)
    if (action === 'heartbeat') {
      if (senderEmail === 'admin@digistore.com' || isAdmin) {
        data.adminOnlineUntil = now + 65000;
        writeSupportData(data);
        return send(200, { success: true, adminOnline: true });
      }
      return send(403, { error: 'Yalnizca admin@digistore.com yonetici cevrimici durumu bildirebilir' });
    }

    // 2. Mesaj Gonderimi
    if (action === 'send') {
      if (!text || !text.trim()) {
        return send(400, { error: 'Mesaj metni bos olamaz' });
      }

      const cleanText = text.trim();
      const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

      // Yonetici (admin@digistore.com) yanit gonderiyor
      if (isAdmin || senderEmail === 'admin@digistore.com') {
        if (senderEmail && senderEmail.toLowerCase() !== 'admin@digistore.com') {
          return send(403, { error: 'Bu islemi sadece admin@digistore.com gerceklestirebilir' });
        }

        const targetChat = (data.chats || []).find(c => c.id === chatId);
        if (!targetChat) {
          return send(404, { error: 'Sohbet oturumu bulunamadi' });
        }

        const adminMsg = {
          id: 'msg_' + now + '_' + Math.random().toString(36).substring(2, 6),
          sender: 'admin',
          senderName: 'Site Yoneticisi (admin@digistore.com)',
          senderEmail: 'admin@digistore.com',
          text: cleanText,
          time: timeStr
        };

        targetChat.messages.push(adminMsg);
        targetChat.lastUpdated = now;
        targetChat.unreadByUser = (targetChat.unreadByUser || 0) + 1;
        targetChat.unreadByAdmin = 0;
        data.adminOnlineUntil = now + 65000;

        writeSupportData(data);
        return send(200, { success: true, message: adminMsg, adminOnline: true });
      }

      // Musteri mesaj gonderiyor
      let chat = null;
      if (chatId) {
        chat = (data.chats || []).find(c => c.id === chatId);
      }
      if (!chat && sessionId) {
        chat = (data.chats || []).find(c => c.sessionId === sessionId);
      }

      if (!chat) {
        chat = {
          id: chatId || ('chat_' + now),
          sessionId: sessionId || ('sess_' + now),
          userEmail: userEmail || '',
          userName: userName || 'Musteri',
          createdAt: new Date().toLocaleDateString('tr-TR') + ' ' + timeStr,
          lastUpdated: now,
          unreadByAdmin: 1,
          unreadByUser: 0,
          messages: []
        };
        data.chats.unshift(chat);
      } else {
        if (userEmail && (!chat.userEmail || chat.userName === 'Musteri')) {
          chat.userEmail = userEmail;
          chat.userName = userName || chat.userName;
        }
      }

      const userMsg = {
        id: 'msg_' + now + '_' + Math.random().toString(36).substring(2, 6),
        sender: 'user',
        senderName: chat.userName || 'Musteri',
        senderEmail: chat.userEmail || '',
        text: cleanText,
        time: timeStr
      };

      chat.messages.push(userMsg);
      chat.lastUpdated = now;
      chat.unreadByAdmin = (chat.unreadByAdmin || 0) + 1;

      writeSupportData(data);
      return send(200, { success: true, message: userMsg, chat, adminOnline: (data.adminOnlineUntil || 0) > now });
    }

    // 3. Sohbet Silme (Sadece admin@digistore.com)
    if (action === 'delete') {
      if (senderEmail === 'admin@digistore.com' || isAdmin) {
        data.chats = (data.chats || []).filter(c => c.id !== chatId);
        writeSupportData(data);
        return send(200, { success: true });
      }
      return send(403, { error: 'Yetkisiz islem' });
    }

    return send(400, { error: 'Gecersiz eylem' });
  }

  return send(405, { error: 'Method not allowed' });
};
