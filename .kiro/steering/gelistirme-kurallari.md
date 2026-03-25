---
inclusion: auto
---

# 🔧 Geliştirme Kuralları ve Etki Analizi

## 📝 Geliştirme Yaklaşımı

### ❌ Yapmayacağım:
- Her geliştirmede ayrı MD dosyaları oluşturmak
- Gereksiz dokümantasyon yazmak
- Verbose açıklamalar

### ✅ Yapacağım:
- Sadece ne yaptığımı kısaca açıklamak
- **Cross-impact analizi** yapmak
- Bir değişikliğin diğer bölümleri nasıl etkilediğini kontrol etmek
- Minimal ama etkili kod yazmak
- **Test işini sana anlatmak** (sen yaparsın, ben yapmam)

## 🔄 Etki Analizi Matrisi

### Backend Değişiklikleri →
- **Web Frontend**: API endpoint uyumluluğu, response format'ları
- **Mobile API**: Mobile-specific endpoint'ler, transformer'lar
- **Admin Panel**: Admin-specific işlevler, yetkilendirme
- **Database**: Migration'lar, model değişiklikleri
- **Authentication**: JWT, middleware, role guard

### Frontend Değişiklikleri →
- **API Endpoint Uyumluluğu**: Request/response format'ları
- **Mobile App Uyumluluğu**: Shared API'ler
- **State Management**: React Query cache, local storage
- **Routing**: Route değişiklikleri, guard'lar

### Database Değişiklikleri →
- **Tüm Controller'lar**: CRUD işlemleri
- **Tüm Service'ler**: Business logic
- **Web + Mobile + Admin**: Tüm platformlar
- **Migration Scripts**: Veri bütünlüğü
- **Backup/Restore**: Veri güvenliği

### Authentication Değişiklikleri →
- **Web Login/Register**: Frontend auth flow
- **Mobile Auth**: Mobile-specific auth
- **Admin Auth**: Admin panel erişimi
- **Middleware'ler**: authMiddleware, roleGuard
- **JWT Utils**: Token işlemleri

### Rol/Yetki Değişiklikleri →
- **Doktor Paneli**: Doktor-specific işlevler
- **Hastane Paneli**: Hastane-specific işlevler
- **Admin Paneli**: Admin-specific işlevler
- **Mobile App Yetkileri**: Mobile role management
- **API Endpoint Guards**: Route protection

### İş Akışı Değişiklikleri →
- **İlan Oluşturma → Başvuru → Değerlendirme → Bildirim**: Tam workflow
- **Email + Push Notification Zincirleri**: Bildirim sistemi
- **Cron Job'lar**: Otomatik işlemler
- **SSE Events**: Real-time güncellemeler
- **File Upload Flow**: CV, belgeler

## 🎯 Platform-Specific Kontroller

### Web Platform
- **Controllers**: `Backend/src/controllers/`
- **Frontend**: `frontend/src/`
- **Authentication**: Web-based JWT
- **File Upload**: Web upload middleware

### Mobile Platform  
- **Controllers**: `Backend/src/controllers/mobile/`
- **Services**: `Backend/src/services/mobile/`
- **Transformers**: `Backend/src/mobile/transformers/`
- **Push Notifications**: Expo integration

### Admin Platform
- **Controllers**: Admin-specific endpoints
- **Frontend**: Admin panel pages
- **Permissions**: Admin role guards
- **Logging**: Admin activity logs

## 🔍 Değişiklik Kontrol Listesi

Her değişiklikten sonra kontrol et:

### ✅ Backend Değişikliği
- [ ] Web frontend etkilendi mi?
- [ ] Mobile API etkilendi mi?
- [ ] Admin panel etkilendi mi?
- [ ] Database migration gerekli mi?
- [ ] Authentication etkilendi mi?

### ✅ Frontend Değişikliği  
- [ ] API endpoint'ler uyumlu mu?
- [ ] Mobile app etkilendi mi?
- [ ] State management güncel mi?
- [ ] Route guard'lar çalışıyor mu?

### ✅ Database Değişikliği
- [ ] Tüm controller'lar güncellendi mi?
- [ ] Service'ler güncellendi mi?
- [ ] Migration script yazıldı mı?
- [ ] Veri bütünlüğü korundu mu?

### ✅ Authentication Değişikliği
- [ ] Web auth flow çalışıyor mu?
- [ ] Mobile auth çalışıyor mu?
- [ ] Admin auth çalışıyor mu?
- [ ] Middleware'ler güncellendi mi?

## 🚀 Geliştirme Sırası

1. **Backend değişikliği yap**
2. **Etki analizi yap** (yukarıdaki matrise göre)
3. **Etkilenen alanları güncelle**
4. **Test talimatları ver** (sen yaparsın)
5. **Kısa açıklama yap** (ne değişti, neler etkilendi)

## 📱 Platform Öncelikleri

### Değişiklik Sırası:
1. **Backend** (API, Database)
2. **Web Frontend** 
3. **Mobile API** (gerekirse)
4. **Admin Panel** (gerekirse)

### Test Sırası:
**Not**: Test işleri kullanıcı tarafından yapılır. Ben sadece test talimatları veririm:
1. **Backend API** nasıl test edilir
2. **Web Frontend** nasıl test edilir  
3. **Mobile** nasıl test edilir (gerekirse)
4. **Admin** nasıl test edilir (gerekirse)

---

**Not**: Bu kurallar her geliştirmede otomatik olarak uygulanacak. Minimal kod, maksimum etki!