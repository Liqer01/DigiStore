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

function isUtcOffsetGhost(t1, t2) {
  if (!t1 || !t2) return true;
  if (t1 === t2) return true;
  const h1 = parseInt(t1.split(':')[0], 10);
  const h2 = parseInt(t2.split(':')[0], 10);
  if (isNaN(h1) || isNaN(h2)) return true;
  const diff = Math.abs(h1 - h2);
  return diff === 3 || diff === 21 || diff === 0;
}

function deduplicateChatMessages(messages) {
  if (!Array.isArray(messages)) return [];
  const clean = [];
  const seenIds = new Set();
  const seenKeys = new Map();

  for (const m of messages) {
    if (!m || !m.text) continue;
    if (m.id && seenIds.has(m.id)) continue;

    const normText = (m.text || '').trim().toLowerCase();
    const key = (m.sender || '') + '|' + normText;

    // 1. Bitisik mukerrer
    const prev = clean[clean.length - 1];
    if (prev && prev.sender === m.sender && (prev.text || '').trim().toLowerCase() === normText) {
      continue;
    }

    // 2. Ayni konusma icinde UTC hayalet kopya
    if (seenKeys.has(key)) {
      const prior = seenKeys.get(key);
      if (isUtcOffsetGhost(prior.time, m.time)) {
        continue;
      }
    }

    if (m.id) seenIds.add(m.id);
    seenKeys.set(key, m);
    clean.push(m);
  }
  return clean;
}

function readSupportData() {
  const filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.chats)) {
        parsed.chats.forEach(c => {
          if (Array.isArray(c.messages)) {
            c.messages = deduplicateChatMessages(c.messages);
          }
        });
        inMemoryData = parsed;
        return inMemoryData;
      }
    }
  } catch (e) {}
  return inMemoryData;
}

function writeSupportData(data) {
  if (data && Array.isArray(data.chats)) {
    data.chats.forEach(c => {
      if (Array.isArray(c.messages)) {
        c.messages = deduplicateChatMessages(c.messages);
      }
    });
  }
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
    const { action, chatId, sessionId, userEmail, userName, text, isAdmin, senderEmail, messageId, clientTime, timestamp } = req.body || {};

    // 1. Yonetici Kalp Atisi (Heartbeat)
    if (action === 'heartbeat') {
      const isHeartbeatAdmin = isAdmin || (senderEmail && (
        senderEmail.toLowerCase().trim() === 'admin@digistore.com' ||
        senderEmail.toLowerCase().trim() === 'destek@closydev.site'
      ));
      if (isHeartbeatAdmin) {
        data.adminOnlineUntil = now + 65000;
        writeSupportData(data);
        return send(200, { success: true, adminOnline: true });
      }
      return send(403, { error: 'Yalnizca yetkili yonetici cevrimici durumu bildirebilir' });
    }

    // 2. Mesaj Gonderimi
    if (action === 'send') {
      if (!text || !text.trim()) {
        return send(400, { error: 'Mesaj metni bos olamaz' });
      }

      const cleanText = text.trim();
      let timeStr = clientTime;
      if (!timeStr) {
        try {
          timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
        } catch (e) {
          timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        }
      }
      const msgId = messageId || ('msg_' + now + '_' + Math.random().toString(36).substring(2, 6));

      // Yonetici yanit gonderiyor
      const isAgent = isAdmin || (senderEmail && (
        senderEmail.toLowerCase().trim() === 'admin@digistore.com' ||
        senderEmail.toLowerCase().trim() === 'destek@closydev.site'
      ));

      if (isAgent) {
        const targetChat = (data.chats || []).find(c => c.id === chatId);
        if (!targetChat) {
          return send(404, { error: 'Sohbet oturumu bulunamadi' });
        }

        if (!Array.isArray(targetChat.messages)) targetChat.messages = [];

        // Mukerrer kontrolu (Ayni ID veya ayni icerik)
        const dupIndex = targetChat.messages.findIndex(m => 
          m.id === msgId || 
          (m.sender === 'admin' && (m.text || '').trim().toLowerCase() === cleanText.toLowerCase())
        );
        if (dupIndex !== -1) {
          return send(200, { success: true, message: targetChat.messages[dupIndex], adminOnline: true });
        }

        const adminMsg = {
          id: msgId,
          sender: 'admin',
          senderName: 'closydev. Yetkili Destek',
          senderEmail: senderEmail || 'destek@closydev.site',
          text: cleanText,
          time: timeStr,
          timestamp: timestamp || now
        };

        targetChat.messages.push(adminMsg);
        targetChat.messages = deduplicateChatMessages(targetChat.messages);
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
      if (!chat && userEmail) {
        chat = (data.chats || []).find(c => c.userEmail && c.userEmail.toLowerCase().trim() === userEmail.toLowerCase().trim());
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

      if (!Array.isArray(chat.messages)) chat.messages = [];

      // Mukerrer kontrolu (Ayni ID veya ayni kisi tarafindan ayni metin)
      const dupIndex = chat.messages.findIndex(m => 
        m.id === msgId || 
        (m.sender === 'user' && (m.text || '').trim().toLowerCase() === cleanText.toLowerCase())
      );
      if (dupIndex !== -1) {
        return send(200, { success: true, message: chat.messages[dupIndex], chat, adminOnline: (data.adminOnlineUntil || 0) > now });
      }

      const userMsg = {
        id: msgId,
        sender: 'user',
        senderName: chat.userName || 'Musteri',
        senderEmail: chat.userEmail || '',
        text: cleanText,
        time: timeStr,
        timestamp: timestamp || now
      };

      chat.messages.push(userMsg);
      chat.messages = deduplicateChatMessages(chat.messages);
      chat.lastUpdated = now;
      chat.unreadByAdmin = (chat.unreadByAdmin || 0) + 1;

      writeSupportData(data);
      return send(200, { success: true, message: userMsg, chat, adminOnline: (data.adminOnlineUntil || 0) > now });
    }

    // 3. Sohbet Silme
    if (action === 'delete') {
      const isDeleteAdmin = isAdmin || (senderEmail && (
        senderEmail.toLowerCase().trim() === 'admin@digistore.com' ||
        senderEmail.toLowerCase().trim() === 'destek@closydev.site'
      ));
      if (isDeleteAdmin) {
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
