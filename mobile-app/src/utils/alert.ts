/**
 * @file alert.ts
 * @description Alert type re-exports for backward compatibility
 * 
 * NOTE: The global handler pattern has been removed.
 * Use useAlert hook or useAlertHelpers hook for alert functionality.
 * 
 * For component code, use:
 * ```typescript
 * import { useAlert } from '@/providers/AlertProvider';
 * // or
 * import { useAlertHelpers } from '@/utils/alertHelpers';
 * ```
 * 
 * For non-component code (API interceptors, etc.), use:
 * ```typescript
 * import { imperativeAlert } from '@/utils/alertRef';
 * ```
 */

// Re-export types for backward compatibility
export type { AlertConfig, AlertType, AlertContextType } from '@/types/alert';
