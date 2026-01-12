/**
 * @file alert.ts
 * @description Alert tip re-export'ları - Geriye dönük uyumluluk için
 * 
 * NOT: Global handler pattern kaldırıldı.
 * Alert fonksiyonelliği için useAlert hook veya useAlertHelpers hook kullanın.
 * 
 * Component kodunda kullanım:
 * ```typescript
 * import { useAlert } from '@/providers/AlertProvider';
 * // veya
 * import { useAlertHelpers } from '@/utils/alertHelpers';
 * ```
 * 
 * Component dışı kodda kullanım (API interceptor'lar, vb.):
 * ```typescript
 * import { imperativeAlert } from '@/utils/alertRef';
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

// Geriye dönük uyumluluk için tip re-export'ları
export type { AlertConfig, AlertType, AlertContextType } from '@/types/alert';
