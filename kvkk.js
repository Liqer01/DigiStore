/**
 * DigiStore — 6698 Sayılı KVKK & Tüketici Hukuku Yasal Uyum Modülü
 * Çerez Politikası, Aydınlatma Metni, Mesafeli Satış Sözleşmesi ve Veri Sahibi Hakları (Madde 11)
 */

(function(window) {
  'use strict';

  const STORAGE_KEY_COOKIE = 'digistore_cookie_consent_v1';

  // 1. Modalları ve Çerez Bandını Sayfaya Otomatik Ekle
  function injectLegalModals() {
    if (document.getElementById('kvkkModalBackdrop')) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <!-- KVKK AYDINLATMA METNİ MODALI -->
      <div id="kvkkModalBackdrop" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);z-index:999999;align-items:center;justify-content:center;padding:16px;">
        <div style="background:#141418;border:1px solid rgba(255,255,255,0.12);border-radius:24px;max-width:760px;width:100%;max-height:88vh;padding:0;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 25px 60px rgba(0,0,0,0.8);">
          
          <div style="background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08);padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:36px;height:36px;border-radius:10px;background:rgba(10,132,255,0.15);color:#0a84ff;display:flex;align-items:center;justify-content:center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
              </div>
              <div>
                <h4 style="font-size:16px;font-weight:800;color:#fff;margin:0;">KVKK Aydınlatma Metni</h4>
                <span style="font-size:11.5px;color:#86868b;">6698 Sayılı Kanun Kapsamında Resmi Bilgilendirme</span>
              </div>
            </div>
            <button onclick="closeKvkkModal()" style="background:rgba(255,255,255,0.06);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div style="padding:24px 28px;overflow-y:auto;font-size:13.5px;color:#d1d5db;line-height:1.7;">
            <h3 style="color:#fff;font-size:15px;margin:0 0 8px;">1. Veri Sorumlusu</h3>
            <p style="margin-bottom:16px;">
              6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, <b>DigiStore Bilişim ve Teknoloji Ticaret A.Ş.</b> (Boğaziçi V.D. / VKN: 2940884210, MERSİS No: 029408842100001, KEP: digistore@hs01.kep.tr) olarak “Veri Sorumlusu” sıfatıyla kişisel verilerinizi işlemekteyiz.
            </p>

            <h3 style="color:#fff;font-size:15px;margin:0 0 8px;">2. İşlenen Kişisel Veriler ve İşleme Amaçları</h3>
            <ul style="margin:0 0 16px 20px;">
              <li><b>Kimlik ve İletişim:</b> Ad, soyad, e-posta adresi, telefon numarası (Sözleşmenin ifası ve dijital lisans teslimatı).</li>
              <li><b>Müşteri ve Ödeme:</b> Sipariş numarası, satın alınan ürün, ödeme yöntemi (Mali e-Arşiv fatura tanzimi).</li>
              <li><b>İşlem Güvenliği:</b> IP adresi, oturum açma zaman damgaları (5651 sayılı Kanun gereği yasal loglama).</li>
            </ul>

            <h3 style="color:#fff;font-size:15px;margin:0 0 8px;">3. Hukuki Sebepler</h3>
            <p style="margin-bottom:16px;">
              Verileriniz; KVKK m. 5/2-c (Sözleşmenin kurulması ve ifası), m. 5/2-ç (Veri sorumlusunun hukuki yükümlülüğü - 213 s. VUK, 6563 s. ETK) ve m. 5/2-e (Hakkın tesisi ve korunması) kapsamında işlenmektedir.
            </p>

            <h3 style="color:#fff;font-size:15px;margin:0 0 8px;">4. Dijital Ürünlerde Cayma Hakkı İstisnası (29188 s. Yönetmelik)</h3>
            <div style="margin-bottom:16px;background:rgba(255,159,10,0.1);border:1px solid rgba(255,159,10,0.25);border-radius:12px;padding:12px 16px;color:#ffb74d;">
              <b>Yasal Uyarı:</b> 29188 sayılı Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca; <i>"Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler"</i> cayma hakkının istisnasıdır. Tüketiciye anında teslim edilen dijital lisans ve yazılımlarda cayma hakkı bulunmamaktadır.
            </div>

            <h3 style="color:#fff;font-size:15px;margin:0 0 8px;">5. Veri Sahibinin Hakları (KVKK Madde 11)</h3>
            <p style="margin-bottom:14px;">
              Veri sahipleri diledikleri zaman kişisel verilerinin dökümünü alma (Veri İndirme), düzeltilmesini talep etme ve kanuni şartlar dahilinde silinmesini/anonimleştirilmesini (Unutulma Hakkı) talep etme haklarına sahiptir.
            </p>
          </div>

          <div style="background:rgba(255,255,255,0.03);border-top:1px solid rgba(255,255,255,0.08);padding:14px 24px;display:flex;justify-content:flex-end;">
            <button type="button" onclick="closeKvkkModal()" style="background:#0a84ff;color:#fff;border:none;padding:10px 24px;border-radius:10px;font-weight:700;font-size:13.5px;cursor:pointer;">Anladım ve Kabul Ediyorum</button>
          </div>

        </div>
      </div>

      <!-- MESAFELİ SATIŞ SÖZLEŞMESİ & ÖN BİLGİLENDİRME MODALI -->
      <div id="distanceModalBackdrop" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);z-index:999999;align-items:center;justify-content:center;padding:16px;">
        <div style="background:#141418;border:1px solid rgba(255,255,255,0.12);border-radius:24px;max-width:760px;width:100%;max-height:88vh;padding:0;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 25px 60px rgba(0,0,0,0.8);">
          
          <div style="background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08);padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:36px;height:36px;border-radius:10px;background:rgba(52,199,89,0.15);color:#34c759;display:flex;align-items:center;justify-content:center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div>
                <h4 style="font-size:16px;font-weight:800;color:#fff;margin:0;">Mesafeli Satış Sözleşmesi &amp; Ön Bilgilendirme</h4>
                <span style="font-size:11.5px;color:#86868b;">6502 Sayılı Kanun ve 29188 Sayılı Yönetmelik Uyarınca</span>
              </div>
            </div>
            <button onclick="closeDistanceModal()" style="background:rgba(255,255,255,0.06);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div style="padding:24px 28px;overflow-y:auto;font-size:13.5px;color:#d1d5db;line-height:1.7;">
            <h3 style="color:#fff;font-size:15px;margin:0 0 6px;">MADDE 1 – TARAFLAR</h3>
            <p><b>SATICI:</b> DigiStore Bilişim ve Teknoloji Ticaret A.Ş.<br/>
            Adres: Büyükdere Cad. No: 193 Levent, Beşiktaş / İstanbul<br/>
            Mersis: 029408842100001 | VKN: 2940884210 | KEP: digistore@hs01.kep.tr | E-posta: destek@digistore.com<br/>
            <b>ALICI:</b> Sipariş esnasında formu dolduran tüketici.</p>

            <h3 style="color:#fff;font-size:15px;margin:16px 0 6px;">MADDE 2 – KONU</h3>
            <p>İşbu Sözleşme'nin konusu; ALICI'nın SATICI'ya ait internet sitesinden elektronik ortamda siparişini yaptığı dijital lisans, yazılım veya kurs ürününün satışı ve anında ifası ile ilgilidir.</p>

            <h3 style="color:#fff;font-size:15px;margin:16px 0 6px;">MADDE 3 – DİJİTAL TESLİMAT &amp; CAYMA HAKKI</h3>
            <p>Ürün dijital lisans anahtarı ve indirme bağlantısı niteliğinde olup, ALICI'nın ödemesini onaylamasını takiben e-posta ve müşteri paneli üzerinden derhal teslim edilir. 29188 sayılı Yönetmelik m.15/1-ğ gereğince dijital ürünlerde cayma hakkı bulunmamaktadır.</p>
          </div>

          <div style="background:rgba(255,255,255,0.03);border-top:1px solid rgba(255,255,255,0.08);padding:14px 24px;display:flex;justify-content:flex-end;">
            <button type="button" onclick="closeDistanceModal()" style="background:#34c759;color:#000;border:none;padding:10px 24px;border-radius:10px;font-weight:700;font-size:13.5px;cursor:pointer;">Okudum, Kabul Ediyorum</button>
          </div>

        </div>
      </div>

      <!-- KVKK ÇEREZ İZİN BANDI (COOKIE CONSENT BANNER) -->
      <div id="cookieConsentBanner" style="display:none;position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99998;width:calc(100% - 32px);max-width:840px;background:rgba(18,18,24,0.94);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.14);border-radius:20px;padding:18px 24px;box-shadow:0 20px 50px rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:14px;flex:1;min-width:280px;">
          <div style="width:40px;height:40px;border-radius:12px;background:rgba(10,132,255,0.15);color:#0a84ff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div style="font-size:12.5px;color:#d1d5db;line-height:1.5;">
            <b style="color:#fff;">6698 Sayılı KVKK ve Çerez Bildirimi:</b> Sitemizde oturum güvenliği, lisans teslimatı ve yasal gereklilikler için zorunlu çerezler kullanılmaktadır. Detaylar için <a href="javascript:void(0)" onclick="openKvkkModal()" style="color:#0a84ff;text-decoration:underline;font-weight:600;">KVKK Aydınlatma Metni</a>'ni inceleyebilirsiniz.
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <button onclick="acceptAllCookies()" style="background:#0a84ff;color:#fff;border:none;padding:9px 18px;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;">Tümünü Kabul Et</button>
          <button onclick="acceptEssentialCookies()" style="background:rgba(255,255,255,0.08);color:#fff;border:1px solid rgba(255,255,255,0.15);padding:9px 16px;border-radius:10px;font-size:12.5px;font-weight:600;cursor:pointer;">Yalnızca Zorunlular</button>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);
    checkCookieConsent();
  }

  function openKvkkModal() {
    injectLegalModals();
    const m = document.getElementById('kvkkModalBackdrop');
    if (m) m.style.display = 'flex';
  }

  function closeKvkkModal() {
    const m = document.getElementById('kvkkModalBackdrop');
    if (m) m.style.display = 'none';
  }

  function openDistanceModal() {
    injectLegalModals();
    const m = document.getElementById('distanceModalBackdrop');
    if (m) m.style.display = 'flex';
  }

  function closeDistanceModal() {
    const m = document.getElementById('distanceModalBackdrop');
    if (m) m.style.display = 'none';
  }

  function acceptAllCookies() {
    localStorage.setItem(STORAGE_KEY_COOKIE, 'all');
    hideCookieBanner();
  }

  function acceptEssentialCookies() {
    localStorage.setItem(STORAGE_KEY_COOKIE, 'essential');
    hideCookieBanner();
  }

  function hideCookieBanner() {
    const b = document.getElementById('cookieConsentBanner');
    if (b) b.style.display = 'none';
  }

  function checkCookieConsent() {
    const consent = localStorage.getItem(STORAGE_KEY_COOKIE);
    const b = document.getElementById('cookieConsentBanner');
    if (!consent && b) {
      b.style.display = 'flex';
    } else if (b) {
      b.style.display = 'none';
    }
  }

  // KVKK Veri İndirme Handler (Madde 11)
  function handleExportKVKK() {
    if (typeof DigiStoreDB === 'undefined') return;
    const pkg = DigiStoreDB.exportUserDataKVKK();
    if (typeof showDynamicIsland === 'function') {
      showDynamicIsland('Veriler İndirildi', 'KVKK Madde 11 uyarınca tüm verileriniz JSON olarak kaydedildi.', 'success');
    }
  }

  // KVKK Unutulma Hakkı Handler (Madde 11/e)
  function handleDeleteAccountKVKK() {
    if (typeof showIosAlert === 'function') {
      showIosAlert({
        title: 'Kişisel Verilerin İmhası (Unutulma Hakkı)',
        message: '6698 sayılı KVKK Madde 11/e uyarınca hesabınız, kimlik ve iletişim bilgileriniz kalıcı olarak anonimleştirilip silinecektir. Bu işlem geri alınamaz. Onaylıyor musunuz?',
        type: 'warning',
        confirmText: 'Verilerimi ve Hesabımı Sil',
        cancelText: 'Vazgeç',
        confirmColor: '#ff453a',
        onConfirm: () => {
          if (typeof DigiStoreDB !== 'undefined') {
            const res = DigiStoreDB.deleteAccountKVKK();
            if (typeof renderAllData === 'function') renderAllData();
            if (typeof renderNavUser === 'function') renderNavUser();
            if (typeof showDynamicIsland === 'function') {
              showDynamicIsland('Hesap Silindi', res.message, 'success');
            }
          }
        }
      });
    } else {
      if (confirm('Kişisel verileriniz ve hesabınız KVKK kapsamında silinecektir. Onaylıyor musunuz?')) {
        DigiStoreDB.deleteAccountKVKK();
        location.reload();
      }
    }
  }

  // Global Export
  window.openKvkkModal = openKvkkModal;
  window.closeKvkkModal = closeKvkkModal;
  window.openDistanceModal = openDistanceModal;
  window.closeDistanceModal = closeDistanceModal;
  window.acceptAllCookies = acceptAllCookies;
  window.acceptEssentialCookies = acceptEssentialCookies;
  window.handleExportKVKK = handleExportKVKK;
  window.handleDeleteAccountKVKK = handleDeleteAccountKVKK;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectLegalModals);
  } else {
    injectLegalModals();
  }

})(window);
