# UI Overlay System Documentation

This document describes the UI overlay system architecture for the React Native mobile application, including Alert, Toast, Modal, and Select components.

## Table of Contents

- [Overview](#overview)
- [Alert System](#alert-system)
- [Toast System](#toast-system)
- [Z-Index System](#z-index-system)
- [Migration Guide](#migration-guide)
- [Anti-Patterns](#anti-patterns)

## Overview

The overlay system follows these core principles:

- **Context + Hooks Only**: All state management through React Context
- **Single Source of Truth**: Providers own overlay state; components are stateless renderers
- **Explicit Callbacks**: Clear separation between user intent (onConfirm/onCancel) and cleanup
- **Centralized Z-Index**: All overlays respect the unified stacking system
- **No Timing Hacks**: No setTimeout/requestAnimationFrame for behavior fixes

### Provider Hierarchy

```
GestureHandlerRootView
└── SafeAreaProvider
    └── PortalProvider
        └── BottomSheetModalProvider (ROOT LEVEL - singleton)
            └── AppProviders
                └── QueryClientProvider
                    └── ThemeProvider
                        └── AlertProvider
                            └── ToastProvider
                                └── NavigationContainer
                                    └── Screens
        └── PortalHost (name="root") ← Toast renders here via Portal
```

## Alert System

### Basic Usage with useAlert Hook

```typescript
import { useAlert } from '@/providers/AlertProvider';

const MyComponent = () => {
  const { showAlert, hideAlert, isVisible } = useAlert();

  const handleAction = () => {
    showAlert({
      type: 'confirm',
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
      onConfirm: () => {
        // Business logic here
        performAction();
      },
      onCancel: () => {
        // Optional cancel logic
      },
      confirmText: 'Yes',
      cancelText: 'No',
    });
  };

  return <Button onPress={handleAction} label="Do Action" />;
};
```

### Using Helper Utilities (Recommended)

The `useAlertHelpers` hook provides convenience methods for common alert patterns:

```typescript
import { useAlertHelpers } from '@/utils/alertHelpers';

const MyComponent = () => {
  const alert = useAlertHelpers();

  // Success alert
  const handleSuccess = () => {
    alert.success('Operation completed successfully');
  };

  // Error alert
  const handleError = () => {
    alert.error('Something went wrong');
  };

  // Info alert
  const handleInfo = () => {
    alert.info('Here is some information');
  };

  // Confirmation dialog
  const handleConfirm = () => {
    alert.confirm(
      'Are you sure you want to proceed?',
      () => performAction(),      // onConfirm
      () => console.log('Cancelled'), // onCancel (optional)
      { title: 'Confirm', confirmText: 'Yes', cancelText: 'No' }
    );
  };

  // Destructive confirmation (for delete actions)
  const handleDelete = () => {
    alert.confirmDestructive(
      'Delete Item',
      'This action cannot be undone.',
      () => deleteItem(),
      undefined,
      'Delete'
    );
  };

  return (
    <View>
      <Button onPress={handleSuccess} label="Success" />
      <Button onPress={handleError} label="Error" />
      <Button onPress={handleConfirm} label="Confirm" />
      <Button onPress={handleDelete} label="Delete" />
    </View>
  );
};
```

### Imperative Alert API (For Non-Component Code)

For API interceptors, utility functions, or other non-component code:

```typescript
import { imperativeAlert } from '@/utils/alertRef';

// In API interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      imperativeAlert.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// Available methods
imperativeAlert.success(message, onConfirm?);
imperativeAlert.error(message, onConfirm?);
imperativeAlert.info(message, onConfirm?);
imperativeAlert.confirm(message, onConfirm, onCancel?, options?);
imperativeAlert.confirmDestructive(title, message, onConfirm, onCancel?, confirmText?);
imperativeAlert.custom(config);
imperativeAlert.hide();
```

**Note**: When AlertProvider is not mounted, `imperativeAlert` falls back to native `Alert.alert`.

### Alert Types

| Type | Icon | Use Case |
|------|------|----------|
| `success` | ✓ (green) | Positive feedback |
| `error` | ✗ (red) | Error/failure feedback |
| `info` | ℹ (blue) | Informational messages |
| `confirm` | ? (amber) | Confirmation dialogs |
| `confirmDestructive` | ⚠ (red) | Destructive action confirmation |

### AlertConfig Interface

```typescript
interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}
```

## Toast System

### Basic Usage

```typescript
import { useToast } from '@/providers/ToastProvider';

const MyComponent = () => {
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showToast('Data saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save data', 'error');
    }
  };

  return <Button onPress={handleSave} label="Save" />;
};
```

### Toast Types

| Type | Color | Use Case |
|------|-------|----------|
| `success` | Green | Positive feedback |
| `error` | Red | Error messages |
| `warning` | Amber | Warning messages |
| `info` | Blue | Informational messages |

### Toast Options

```typescript
showToast(
  message: string,
  type?: 'success' | 'error' | 'warning' | 'info', // default: 'info'
  duration?: number // default: 3000ms
);
```

## Z-Index System

All overlays use centralized z-index values from `@/theme/zIndex.ts`:

```typescript
const zIndex = {
  base: 0,
  elevated: 1,
  sticky: 10,
  fab: 15,
  dropdown: 100,
  select: 100,
  bottomSheet: 200,
  actionSheet: 200,
  modal: 300,
  dialog: 300,
  alert: 400,
  toast: 500,
  overlay: 600,
  loading: 600,
  offlineNotice: 700,
  max: 9999,
};
```

### Stacking Order

```
Toast (500) - Always on top
  ↑
Alert (400)
  ↑
Modal/Dialog (300)
  ↑
BottomSheet/ActionSheet (200)
  ↑
Dropdown/Select (100)
  ↑
Base Content (0)
```

## Migration Guide

### From Global showAlert to useAlertHelpers

**Before (Deprecated):**
```typescript
// ❌ Old pattern - DO NOT USE
import { showAlert } from '@/utils/alert';

showAlert.success('Message');
showAlert.confirm('Are you sure?', onConfirm, onCancel);
```

**After (Current):**
```typescript
// ✅ New pattern - USE THIS
import { useAlertHelpers } from '@/utils/alertHelpers';

const MyComponent = () => {
  const alert = useAlertHelpers();
  
  alert.success('Message');
  alert.confirm('Are you sure?', onConfirm, onCancel);
};
```

### From Direct showAlert to useAlert Hook

**Before:**
```typescript
// ❌ Old pattern
import { showAlert } from '@/utils/alert';

const handleClick = () => {
  showAlert.confirm('Delete?', () => deleteItem());
};
```

**After:**
```typescript
// ✅ New pattern
import { useAlert } from '@/providers/AlertProvider';

const MyComponent = () => {
  const { showAlert } = useAlert();
  
  const handleClick = () => {
    showAlert({
      type: 'confirm',
      title: 'Confirm',
      message: 'Delete?',
      onConfirm: () => deleteItem(),
    });
  };
};
```

### For Non-Component Code

**Before:**
```typescript
// ❌ Old pattern - global handler
import { showAlert } from '@/utils/alert';

// In API interceptor
showAlert.error('Session expired');
```

**After:**
```typescript
// ✅ New pattern - imperative API with fallback
import { imperativeAlert } from '@/utils/alertRef';

// In API interceptor
imperativeAlert.error('Session expired');
```

## Anti-Patterns

### ❌ Global Mutable State

```typescript
// FORBIDDEN - Do not use global handlers
let globalAlertHandler = null;

export const setGlobalAlertHandler = (handler) => {
  globalAlertHandler = handler; // ❌ Mutable global state
};
```

### ❌ Timing-Based Fixes

```typescript
// FORBIDDEN - Do not use setTimeout for behavior fixes
const handleConfirm = () => {
  setTimeout(() => {
    onConfirm?.(); // ❌ Timing hack
  }, 100);
};
```

### ❌ Business Logic in onClose

```typescript
// FORBIDDEN - onClose is for cleanup only
showAlert({
  type: 'confirm',
  message: 'Delete?',
  onClose: () => {
    deleteItem(); // ❌ Business logic in cleanup
    navigation.goBack(); // ❌ Side effects in cleanup
  },
});
```

**Correct approach:**
```typescript
// ✅ Business logic in onConfirm
showAlert({
  type: 'confirm',
  message: 'Delete?',
  onConfirm: () => {
    deleteItem();
    navigation.goBack();
  },
});
```

### ❌ Local BottomSheetModalProvider

```typescript
// FORBIDDEN - Do not add local providers
const MyScreen = () => (
  <BottomSheetModalProvider> {/* ❌ Local provider */}
    <Select options={options} />
  </BottomSheetModalProvider>
);
```

### ❌ Using Hooks Outside Provider

```typescript
// FORBIDDEN - Will throw error
const MyComponent = () => {
  // ❌ If AlertProvider is not in the tree above this component
  const { showAlert } = useAlert(); // Throws: "useAlert must be used within AlertProvider"
};
```

### ❌ Multiple Callback Executions

```typescript
// FORBIDDEN - Callbacks should execute exactly once
const handleConfirm = () => {
  onConfirm?.();
  onConfirm?.(); // ❌ Double execution
};
```

The AlertProvider handles this automatically with an `isExecuting` guard.

## Development Logging

In development mode (`__DEV__`), the overlay system logs lifecycle events:

- Alert show/hide events
- Callback executions
- Provider mount/unmount
- Timer cleanup

These logs are automatically stripped in production builds.

## Error Handling

### Hook Outside Provider

If `useAlert` or `useToast` is called outside their respective providers, a descriptive error is thrown:

```
Error: useAlert must be used within AlertProvider. 
Ensure AlertProvider is in your component tree above this component.
```

### Callback Errors

If a callback throws an error, it is caught and logged in development mode. The alert still dismisses properly:

```typescript
showAlert({
  type: 'confirm',
  message: 'Test',
  onConfirm: () => {
    throw new Error('Callback error'); // Caught and logged, alert still closes
  },
});
```

### Invalid Props

In development mode, invalid props to overlay components trigger descriptive console errors:

```
[CustomAlert] Invalid prop 'type': received 'invalid'. 
Valid types are: success, error, info, confirm, confirmDestructive.
```
