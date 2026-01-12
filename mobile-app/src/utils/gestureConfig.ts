/**
 * @file gestureConfig.ts
 * @description Gesture handler konfigürasyonu - dokunma çakışmalarını önleme
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - TouchableOpacity için optimize edilmiş props
 * - FlatList için optimize edilmiş props
 * - ScrollView için optimize edilmiş props
 * - Platform-specific ayarlar (iOS/Android)
 */

import { Platform } from 'react-native';

// ============================================================================
// TOUCHABLE CONFIGURATION
// ============================================================================

/**
 * Gesture çakışmalarını önlemek için optimize edilmiş touchable props
 * TouchableOpacity bileşenlerinde bu props'ları kullanın
 * 
 * @example
 * ```tsx
 * <TouchableOpacity {...optimizedTouchableProps} onPress={handlePress}>
 *   <Text>Tıkla</Text>
 * </TouchableOpacity>
 * ```
 */
export const optimizedTouchableProps = {
  /** Basıldığında opacity değeri */
  activeOpacity: 0.7,
  /** Basma animasyonu başlama gecikmesi */
  delayPressIn: 0,
  /** Basma animasyonu bitme gecikmesi (Android'de 100ms) */
  delayPressOut: Platform.OS === 'android' ? 100 : 0,
};

// ============================================================================
// FLATLIST CONFIGURATION
// ============================================================================

/**
 * Gesture çakışmalarını önlemek için optimize edilmiş FlatList props
 * FlatList bileşenlerinde bu props'ları kullanın
 * 
 * @example
 * ```tsx
 * <FlatList
 *   {...optimizedFlatListProps}
 *   data={data}
 *   renderItem={renderItem}
 * />
 * ```
 */
export const optimizedFlatListProps = {
  /** Görünüm dışındaki öğeleri kaldır (Android) */
  removeClippedSubviews: Platform.OS === 'android',
  /** Her batch'te render edilecek maksimum öğe sayısı */
  maxToRenderPerBatch: 10,
  /** Batch'ler arası güncelleme periyodu (ms) */
  updateCellsBatchingPeriod: 50,
  /** İlk render'da gösterilecek öğe sayısı */
  initialNumToRender: 10,
  /** Viewport boyutu çarpanı */
  windowSize: 10,
  /** Klavye açıkken dokunma davranışı */
  keyboardShouldPersistTaps: 'handled' as const,
  /** Scroll sırasında klavyeyi kapatma modu */
  keyboardDismissMode: 'on-drag' as const,
};

// ============================================================================
// SCROLLVIEW CONFIGURATION
// ============================================================================

/**
 * Gesture çakışmalarını önlemek için optimize edilmiş ScrollView props
 * ScrollView bileşenlerinde bu props'ları kullanın
 * 
 * @example
 * ```tsx
 * <ScrollView {...optimizedScrollViewProps}>
 *   <View>...</View>
 * </ScrollView>
 * ```
 */
export const optimizedScrollViewProps = {
  /** Klavye açıkken dokunma davranışı */
  keyboardShouldPersistTaps: 'handled' as const,
  /** Scroll sırasında klavyeyi kapatma modu */
  keyboardDismissMode: 'on-drag' as const,
  /** Dikey scroll indicator'ı göster/gizle */
  showsVerticalScrollIndicator: false,
  /** Bounce efekti (iOS) */
  bounces: true,
  /** Over-scroll modu (Android) */
  overScrollMode: 'auto' as const,
};
