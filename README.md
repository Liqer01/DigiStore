# ⚡ DigiStore - Dijital Urun Magaza Sistemi

Tam ozellikli, yasal, Turkce dijital urun satis platformu.

## Proje Yapisi

```
digital-store/
├── frontend/
│   ├── index.html        ← Ana magaza sayfasi
│   ├── odeme.html        ← Odeme sayfasi
│   ├── hesabim.html      ← Musteri paneli
│   └── admin/
│       └── index.html    ← Admin paneli
└── backend/
    ├── server.js         ← Express API sunucusu
    ├── package.json
    ├── .env.example      ← Ornek ortam degiskenleri
    └── database.sqlite   ← Otomatik olusturulur
```

## Kurulum

### 1. Backend Kurulumu

```bash
cd backend
npm install
cp .env.example .env
# .env dosyasini ac ve bilgileri doldur
node server.js
```

### 2. Frontend Acmak

Frontend tamamen static HTML - direkt tarayicida ac:
- `frontend/index.html` → Ana magaza
- `frontend/admin/index.html` → Admin panel

Veya VS Code Live Server kullan (onerilir):
1. VS Code ac
2. Live Server uzantisini yukle
3. `frontend/index.html` uzerinde sag tikla → "Open with Live Server"

### 3. .env Dosyasini Ayarla

```env
JWT_SECRET=guclu_bir_sifre_yaz
SMTP_USER=senin@gmail.com
SMTP_PASS=gmail_uygulama_sifresi
SHOPIER_API_KEY=shopier_api_key
SHOPIER_API_SECRET=shopier_secret
```

## Odeme Entegrasyonu

### Shopier (Onerilir - Hizli Baslangic)
1. https://www.shopier.com adresine kaydol
2. API anahtarlarini al
3. .env dosyasina ekle
4. Webhook URL: https://siteadresin.com/webhook/shopier

### Iyzico (Daha Kurumsal)
1. https://www.iyzico.com adresine kaydol
2. Sandbox test et, sonra production'a gec

## API Endpoints

```
POST /api/auth/register     - Kayit ol
POST /api/auth/login        - Giris yap
GET  /api/products          - Urunleri listele
GET  /api/products/:id      - Urun detayi
POST /api/orders            - Siparis olustur
GET  /api/orders            - Siparislerim
GET  /api/license/:key      - Lisans dogrula
POST /webhook/shopier        - Odeme webhook (Shopier)

# Admin (JWT + admin role gerekli)
GET  /api/admin/stats       - Dashboard istatistikleri
GET  /api/admin/orders      - Tum siparisler
GET  /api/admin/users       - Tum kullanicilar
POST /api/admin/products    - Urun ekle
PUT  /api/admin/products/:id - Urun guncelle
```

## Yasal Bilgiler

Bu sistem yasaldır ve sunlari kapsar:
- Her satisa otomatik e-Arsiv fatura numarasi
- KDV hesaplama (%20)
- Musteri kayit sistemi
- Siparis gecmisi ve belgeleme

**Onemli**: Satis yapabilmek icin vergi mukellefiyeti gereklidir.
Sahis sirketi kur veya muhasebecine danıs.

## Teknolojiler

- **Frontend**: Pure HTML/CSS/JavaScript (build tool gerektirmez)
- **Backend**: Node.js + Express
- **Veritabani**: SQLite (PostgreSQL'e gecis kolay)
- **Auth**: JWT
- **Email**: Nodemailer
- **Odeme**: Shopier / Iyzico

---
Herhangi bir sorun icin destek@digistore.com
