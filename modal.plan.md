<!-- 1f79476f-2511-4d99-9b50-115ddae93de8 d18a449b-1b25-46f4-95b1-a41e7951bf19 -->
# Birleşik Modal Altyapısı Planı

## Hedefler

- Modal render’ını portal üzerinden `#modal-root`a taşıyarak z-index/scroll sorunlarını çözmek
- `ModalContainer`ı anchor pozisyonlama, responsive padding ve güvenli scroll kilidi ile güçlendirmek
- Mevcut yerel modalları (Login/Register hataları dahil) tek `ModalContainer` ve global store üzerinden standartlaştırmak

## Adımlar

1. **Portal Altyapısı**  (`frontend/index.html`, `frontend/src/main.jsx`)

- `<div id="modal-root">` ekle ve React `createPortal` ile `ModalContainer`/`ConfirmationModal` render’ını buraya taşı
- Scroll lock’un tek noktada, portal üzerinden yönetildiğinden emin ol

2. **ModalContainer Geliştirmesi**  (`frontend/src/components/ui/ModalContainer.jsx`)

- Anchor tabanlı konumlama için tetikleyici rect parametresi ekle; `@floating-ui/react` ile pozisyon hesapla
- `max-h-[90vh] overflow-auto` ve safe-area padding’leri uygulayarak mobil taşmayı önle
- Scroll kilidi/diger tekrarlı useEffect’leri merkezileştir; tekrar eden kilitleri kaldırmak için `body-scroll-lock` benzeri yardımcı yaz

3. **Global Modal Yönetimi**  (`frontend/src/store/uiStore.js`, `frontend/src/components/ui/ConfirmationModal.jsx`)

- Zustand store’a “generic modal” state’i ekle (tip, içerik, anchor bilgisi)
- `ConfirmationModal`ı yeni portal yapısıyla uyumlu hale getir, tekrar kullanılabilir hale getir (ikon/düğme varyantlarını koru)

4. **Sayfa Bazlı Modalların Migrasyonu**

- `frontend/src/features/admin/pages/JobDetailPage.jsx`
- `frontend/src/features/admin/pages/PhotoApprovalsPage.jsx`
- `frontend/src/features/doctor/pages/ProfilePage.jsx`
- `frontend/src/features/doctor/pages/JobDetailPage.jsx`
- `frontend/src/features/auth/pages/RegisterPage.jsx`
- `frontend/src/features/auth/pages/LoginPage.jsx`

Bu dosyalardaki tüm modalları yeni `ModalContainer` API’sine geçir; manuel `fixed overlay` yapıları çıkar; gerekirse anchor bilgisi sağlayan helper ekle.

## Uygulama Notları

- Anchor verisi `openModal` çağrılırken tetikleyici elementten `getBoundingClientRect()` ile alınacak
- Scroll lock tekrarları (ör. RegisterPage ErrorModal’ın useEffect’i) kaldırılacak, yeni container bu yeteneği sağlayacak
- Her modaldaki `align="auto"/"bottom"` yeni anchor tabanlı konfigürasyonla uyarlanacak; anchor yoksa merkez fallback kullanılacak

### To-dos

- [ ] Portal root ekle ve React portal entegrasyonunu yapılandır
- [ ] ModalContainer’ı anchor destekli, responsive ve tek scroll-lock kaynağı olacak şekilde güncelle
- [ ] Zustand modal yönetimini genel modal tipi ve anchor bilgisiyle genişlet
- [ ] Tüm sayfa modallarını yeni modal altyapısına taşı