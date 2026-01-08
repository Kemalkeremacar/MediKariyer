/**
 * @file alert.ts
 * @description Alert system type definitions
 * 
 * These types define the contract for the deterministic alert system
 * that uses React Context exclusively without global mutable state.
 */

/**
 * Alert types supported by the system
 * - success: Positive feedback (green icon)
 * - error: Error/failure feedback (red icon)
 * - info: Informational message (blue icon)
 * - confirm: Confirmation dialog with confirm/cancel buttons (amber icon)
 * - confirmDestructive: Destructive action confirmation (red icon, red confirm button)
 */
export type AlertType = 'success' | 'error' | 'info' | 'confirm' | 'confirmDestructive';

/**
 * Configuration object for showing an alert
 */
export interface AlertConfig {
  /** Type of alert determining icon and color scheme */
  type: AlertType;
  /** Title displayed at the top of the alert */
  title: string;
  /** Message body of the alert */
  message: string;
  /** Callback executed when user presses confirm button */
  onConfirm?: () => void;
  /** Callback executed when user presses cancel button (confirm types only) */
  onCancel?: () => void;
  /** Text for the confirm button (default: 'Tamam' for info types, 'Onayla' for confirm types) */
  confirmText?: string;
  /** Text for the cancel button (default: 'İptal') */
  cancelText?: string;
}

/**
 * Context type exposed by AlertProvider through useAlert hook
 */
export interface AlertContextType {
  /** Show an alert with the given configuration */
  showAlert: (config: AlertConfig) => void;
  /** Hide the currently visible alert */
  hideAlert: () => void;
  /** Whether an alert is currently visible */
  isVisible: boolean;
}

/**
 * Internal state managed by AlertProvider
 */
export interface AlertProviderState {
  /** Current alert configuration, null when no alert is visible */
  config: AlertConfig | null;
  /** Guard flag to prevent multiple callback executions from rapid clicks */
  isExecuting: boolean;
}

/**
 * Ref type for imperative alert access from non-component code
 */
export interface AlertRef {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}
