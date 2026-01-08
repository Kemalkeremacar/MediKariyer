/**
 * Z-Index Management System
 * 
 * Centralized z-index values for consistent layering across the app.
 * This is the SINGLE SOURCE OF TRUTH for all overlay z-index values.
 * Higher values appear above lower values.
 * 
 * @description
 * The overlay stacking order follows a strict hierarchy to ensure
 * predictable visual layering. This hierarchy MUST be maintained:
 * 
 * **Required Stacking Order (lowest to highest):**
 * ```
 * base (0) < dropdown/select (100) < bottomSheet (200) < modal (300) < alert (400) < toast (500)
 * ```
 * 
 * **Layer Stack (Bottom to Top):**
 * | Layer | Z-Index | Components |
 * |-------|---------|------------|
 * | 1. Base Content | 0-1 | Screens, cards, lists |
 * | 2. Sticky Elements | 10-15 | Headers, FABs |
 * | 3. Dropdowns/Select | 100 | BottomSheetModal dropdowns, Select components |
 * | 4. Bottom Sheets | 200 | Action sheets, filter sheets |
 * | 5. Modals | 300 | React Native Modal, dialogs |
 * | 6. Alerts | 400 | Confirmation dialogs, CustomAlert |
 * | 7. Toasts | 500 | Toast notifications (always above alerts) |
 * | 8. System Overlays | 600-700 | Loading screens, offline notices |
 * 
 * **Key Invariants:**
 * - Toast ALWAYS renders above Alert (toast: 500 > alert: 400)
 * - Alert ALWAYS renders above Modal (alert: 400 > modal: 300)
 * - Select renders above regular content but below modals when opened from non-modal screens
 * - Multiple overlays maintain correct stacking without manual z-index overrides
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
 * @see Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */

export const zIndex = {
  /**
   * Base layer - default content level
   * Used for: screens, regular content, cards, lists
   */
  base: 0,
  
  /**
   * Elevated content - slightly raised surfaces
   * Used for: elevated cards, raised surfaces
   */
  elevated: 1,
  
  /**
   * Sticky elements - fixed position headers
   * Used for: sticky headers, navigation bars
   */
  sticky: 10,
  
  /**
   * Floating Action Button layer
   * Used for: FABs, floating buttons
   */
  fab: 15,
  
  /**
   * Dropdown layer - BottomSheetModal dropdowns
   * Used for: Select component dropdowns, autocomplete menus
   * @invariant dropdown < bottomSheet < modal < alert < toast
   */
  dropdown: 100,
  
  /**
   * Select component layer (alias for dropdown)
   * Used for: Select/picker components using BottomSheetModal
   * @invariant select < bottomSheet < modal < alert < toast
   */
  select: 100,
  
  /**
   * Bottom sheet layer - action sheets, filter panels
   * Used for: BottomSheet components, action sheets, filter sheets
   * @invariant bottomSheet < modal < alert < toast
   */
  bottomSheet: 200,
  
  /**
   * Action sheet layer (alias for bottomSheet)
   * Used for: Action sheet menus
   */
  actionSheet: 200,
  
  /**
   * Modal layer - full screen modals and dialogs
   * Used for: React Native Modal, dialog overlays
   * @invariant modal < alert < toast
   */
  modal: 300,
  
  /**
   * Dialog layer (alias for modal)
   * Used for: Dialog components
   */
  dialog: 300,
  
  /**
   * Alert layer - confirmation dialogs and alerts
   * Used for: CustomAlert, confirmation dialogs
   * @invariant alert > modal (alerts always above modals)
   * @invariant alert < toast (toasts always above alerts)
   */
  alert: 400,
  
  /**
   * Toast layer - notification toasts
   * Used for: Toast notifications, snackbars
   * @invariant toast > alert (toasts always above alerts)
   * @invariant toast > modal (toasts always above modals)
   */
  toast: 500,
  
  /**
   * System overlay layer - loading screens
   * Used for: Full-screen loading overlays
   */
  overlay: 600,
  
  /**
   * Loading layer (alias for overlay)
   * Used for: Loading spinners, progress indicators
   */
  loading: 600,
  
  /**
   * Offline notice layer - network status indicators
   * Used for: Offline banners, connectivity notices
   * Highest priority system overlay
   */
  offlineNotice: 700,
  
  /**
   * Maximum z-index - for debugging or special cases
   * @warning Use sparingly, only for debugging
   */
  max: 9999,
} as const;

/**
 * Z-Index key type for TypeScript support
 * @description All valid z-index layer names
 */
export type ZIndexKey = keyof typeof zIndex;

/**
 * Z-Index value type for TypeScript support
 * @description All valid z-index numeric values
 */
export type ZIndexValue = typeof zIndex[ZIndexKey];

/**
 * Helper function to get z-index value by key
 * @param key - The z-index layer name
 * @returns The numeric z-index value
 * @example
 * ```typescript
 * const modalZ = getZIndex('modal'); // 300
 * const toastZ = getZIndex('toast'); // 500
 * ```
 */
export const getZIndex = (key: ZIndexKey): number => zIndex[key];

/**
 * Validates that the z-index hierarchy is correct
 * @description This function can be used in tests to verify the stacking order
 * @returns true if hierarchy is valid
 * @throws Error if hierarchy is invalid
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
        `Z-Index hierarchy violation: ${prev.name} (${prev.value}) must be less than ${curr.name} (${curr.value})`
      );
    }
  }

  return true;
};

/**
 * Provider Hierarchy Documentation
 * 
 * The app uses a specific provider hierarchy to ensure proper z-index layering:
 * 
 * ```
 * GestureHandlerRootView
 * └── SafeAreaProvider
 *     └── PortalProvider
 *         └── BottomSheetModalProvider (ROOT LEVEL)
 *             └── AppProviders
 *                 └── NavigationContainer
 *                     └── Screens
 *         └── PortalHost (name="root") - Toast/Alert render here
 * ```
 * 
 * **Key Points:**
 * 1. BottomSheetModalProvider is at ROOT level (outside NavigationContainer)
 *    - This allows Select/BottomSheet to render above all navigation screens
 * 
 * 2. PortalHost is at ROOT level (outside NavigationContainer)
 *    - Toast and Alert use Portal to render at this level
 *    - They appear above everything including modals
 * 
 * 3. No local BottomSheetModalProvider in components
 *    - All components use the root-level provider
 *    - This prevents z-index conflicts
 * 
 * @see Requirements 6.2, 6.3, 6.4
 */
