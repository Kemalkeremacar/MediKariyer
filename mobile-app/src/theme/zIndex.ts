/**
 * @file zIndex.ts
 * @description Z-Index Yönetim Sistemi
 * 
 * Uygulama genelinde tutarlı katmanlama için merkezi z-index değerleri.
 * Tüm overlay z-index değerleri için TEK KAYNAK.
 * Yüksek değerler, düşük değerlerin üzerinde görünür.
 * 
 * Overlay katmanlama sırası katı bir hiyerarşi izler ve bu hiyerarşi KORUNMALIDIR:
 * 
 * **Gerekli Katmanlama Sırası (en düşükten en yükseğe):**
 * ```
 * base (0) < dropdown/select (100) < bottomSheet (200) < modal (300) < alert (400) < toast (500)
 * ```
 * 
 * **Katman Yığını (Alttan Üste):**
 * | Katman | Z-Index | Bileşenler |
 * |--------|---------|------------|
 * | 1. Temel İçerik | 0-1 | Ekranlar, kartlar, listeler |
 * | 2. Sabit Elemanlar | 10-15 | Başlıklar, FAB'ler |
 * | 3. Açılır Menüler/Select | 100 | BottomSheetModal açılır menüleri, Select bileşenleri |
 * | 4. Alt Sayfalar | 200 | Action sheet'ler, filtre sayfaları |
 * | 5. Modal'lar | 300 | React Native Modal, dialog'lar |
 * | 6. Uyarılar | 400 | Onay dialog'ları, CustomAlert |
 * | 7. Toast'lar | 500 | Toast bildirimleri (her zaman alert'lerin üstünde) |
 * | 8. Sistem Overlay'leri | 600-700 | Yükleme ekranları, çevrimdışı bildirimleri |
 * 
 * **Önemli Kurallar:**
 * - Toast HER ZAMAN Alert'in üstünde render edilir (toast: 500 > alert: 400)
 * - Alert HER ZAMAN Modal'ın üstünde render edilir (alert: 400 > modal: 300)
 * - Select, normal içeriğin üstünde ancak modal olmayan ekranlardan açıldığında modal'ların altında render edilir
 * - Birden fazla overlay, manuel z-index override'ları olmadan doğru katmanlamayı korur
 * 
 * @example
 * ```typescript
 * import { zIndex } from '@/theme/zIndex';
 * 
 * const styles = StyleSheet.create({
 *   modal: { zIndex: zIndex.modal },
 *   toast: { zIndex: zIndex.toast },
 * });
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

export const zIndex = {
  /**
   * Temel katman - varsayılan içerik seviyesi
   * Kullanım: ekranlar, normal içerik, kartlar, listeler
   */
  base: 0,
  
  /**
   * Yükseltilmiş içerik - hafifçe yükseltilmiş yüzeyler
   * Kullanım: yükseltilmiş kartlar, yükseltilmiş yüzeyler
   */
  elevated: 1,
  
  /**
   * Sabit elemanlar - sabit konumlu başlıklar
   * Kullanım: sabit başlıklar, navigasyon çubukları
   */
  sticky: 10,
  
  /**
   * Floating Action Button katmanı
   * Kullanım: FAB'ler, yüzen butonlar
   */
  fab: 15,
  
  /**
   * Açılır menü katmanı - BottomSheetModal açılır menüleri
   * Kullanım: Select bileşeni açılır menüleri, otomatik tamamlama menüleri
   * @invariant dropdown < bottomSheet < modal < alert < toast
   */
  dropdown: 100,
  
  /**
   * Select bileşeni katmanı (dropdown için takma ad)
   * Kullanım: BottomSheetModal kullanan Select/picker bileşenleri
   * @invariant select < bottomSheet < modal < alert < toast
   */
  select: 100,
  
  /**
   * Alt sayfa katmanı - action sheet'ler, filtre panelleri
   * Kullanım: BottomSheet bileşenleri, action sheet'ler, filtre sayfaları
   * @invariant bottomSheet < modal < alert < toast
   */
  bottomSheet: 200,
  
  /**
   * Action sheet katmanı (bottomSheet için takma ad)
   * Kullanım: Action sheet menüleri
   */
  actionSheet: 200,
  
  /**
   * Modal katmanı - tam ekran modal'lar ve dialog'lar
   * Kullanım: React Native Modal, dialog overlay'leri
   * @invariant modal < alert < toast
   */
  modal: 300,
  
  /**
   * Dialog katmanı (modal için takma ad)
   * Kullanım: Dialog bileşenleri
   */
  dialog: 300,
  
  /**
   * Uyarı katmanı - onay dialog'ları ve uyarılar
   * Kullanım: CustomAlert, onay dialog'ları
   * @invariant alert > modal (uyarılar her zaman modal'ların üstünde)
   * @invariant alert < toast (toast'lar her zaman uyarıların üstünde)
   */
  alert: 400,
  
  /**
   * Toast katmanı - bildirim toast'ları
   * Kullanım: Toast bildirimleri, snackbar'lar
   * @invariant toast > alert (toast'lar her zaman uyarıların üstünde)
   * @invariant toast > modal (toast'lar her zaman modal'ların üstünde)
   */
  toast: 500,
  
  /**
   * Sistem overlay katmanı - yükleme ekranları
   * Kullanım: Tam ekran yükleme overlay'leri
   */
  overlay: 600,
  
  /**
   * Yükleme katmanı (overlay için takma ad)
   * Kullanım: Yükleme spinner'ları, ilerleme göstergeleri
   */
  loading: 600,
  
  /**
   * Çevrimdışı bildirim katmanı - ağ durumu göstergeleri
   * Kullanım: Çevrimdışı banner'ları, bağlantı bildirimleri
   * En yüksek öncelikli sistem overlay'i
   */
  offlineNotice: 700,
  
  /**
   * Maksimum z-index - hata ayıklama veya özel durumlar için
   * @warning Dikkatli kullanın, sadece hata ayıklama için
   */
  max: 9999,
} as const;

/**
 * TypeScript desteği için Z-Index key tipi
 * @description Tüm geçerli z-index katman isimleri
 */
export type ZIndexKey = keyof typeof zIndex;

/**
 * TypeScript desteği için Z-Index value tipi
 * @description Tüm geçerli z-index sayısal değerleri
 */
export type ZIndexValue = typeof zIndex[ZIndexKey];

/**
 * Key'e göre z-index değerini döndüren yardımcı fonksiyon
 * @param {ZIndexKey} key - Z-index katman ismi
 * @returns {number} Sayısal z-index değeri
 * @example
 * ```typescript
 * const modalZ = getZIndex('modal'); // 300
 * const toastZ = getZIndex('toast'); // 500
 * ```
 */
export const getZIndex = (key: ZIndexKey): number => zIndex[key];

/**
 * Z-index hiyerarşisinin doğru olduğunu doğrular
 * @description Bu fonksiyon testlerde katmanlama sırasını doğrulamak için kullanılabilir
 * @returns {boolean} Hiyerarşi geçerliyse true
 * @throws {Error} Hiyerarşi geçersizse hata fırlatır
 */
export const validateZIndexHierarchy = (): boolean => {
  const requiredOrder = [
    { name: 'base', value: zIndex.base },
    { name: 'dropdown', value: zIndex.dropdown },
    { name: 'bottomSheet', value: zIndex.bottomSheet },
    { name: 'modal', value: zIndex.modal },
    { name: 'alert', value: zIndex.alert },
    { name: 'toast', value: zIndex.toast },
  ];

  for (let i = 1; i < requiredOrder.length; i++) {
    const prev = requiredOrder[i - 1];
    const curr = requiredOrder[i];
    if (prev.value >= curr.value) {
      throw new Error(
        `Z-Index hiyerarşi ihlali: ${prev.name} (${prev.value}), ${curr.name} (${curr.value}) değerinden küçük olmalıdır`
      );
    }
  }

  return true;
};

/**
 * Provider Hiyerarşisi Dokümantasyonu
 * 
 * Uygulama, doğru z-index katmanlamasını sağlamak için belirli bir provider hiyerarşisi kullanır:
 * 
 * ```
 * GestureHandlerRootView
 * └── SafeAreaProvider
 *     └── PortalProvider
 *         └── BottomSheetModalProvider (KÖK SEVİYE)
 *             └── AppProviders
 *                 └── NavigationContainer
 *                     └── Ekranlar
 *         └── PortalHost (name="root") - Toast/Alert burada render edilir
 * ```
 * 
 * **Önemli Noktalar:**
 * 1. BottomSheetModalProvider KÖK seviyededir (NavigationContainer dışında)
 *    - Bu, Select/BottomSheet'in tüm navigasyon ekranlarının üstünde render edilmesini sağlar
 * 
 * 2. PortalHost KÖK seviyededir (NavigationContainer dışında)
 *    - Toast ve Alert, bu seviyede render edilmek için Portal kullanır
 *    - Modal'lar dahil her şeyin üstünde görünürler
 * 
 * 3. Bileşenlerde yerel BottomSheetModalProvider yok
 *    - Tüm bileşenler kök seviye provider'ı kullanır
 *    - Bu, z-index çakışmalarını önler
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */
