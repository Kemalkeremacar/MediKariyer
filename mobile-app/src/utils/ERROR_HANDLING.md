# Error Handling System

This document describes the comprehensive error handling and feedback system implemented in the mobile application.

## Overview

The error handling system provides:
- **Global error handling** for unhandled errors and promise rejections
- **API error handling** with automatic retry and token refresh
- **Network error detection** and user-friendly feedback
- **Error logging** for debugging and monitoring
- **Toast notifications** for user feedback
- **Loading indicators** through global loader
- **Modal management** through UI store

## Components

### 1. Error Logger (`utils/errorLogger.ts`)

Centralized error logging utility that logs errors with context for debugging.

```typescript
import { errorLogger } from '@/utils/errorLogger';

// Log a general error
errorLogger.logError(error, { component: 'JobsList', action: 'fetchJobs' });

// Log a network error
errorLogger.logNetworkError(error, '/api/jobs');

// Log an API error
errorLogger.logApiError(error, '/api/jobs', 500);

// Log an unhandled error
errorLogger.logUnhandledError(error, false);
```

### 2. Error Handler Utility (`utils/errorHandler.ts`)

Provides utility functions for error handling and user-friendly messages.

```typescript
import {
  getUserFriendlyErrorMessage,
  handleApiError,
  handleNetworkError,
  isNetworkError,
  isAuthError,
  isValidationError,
} from '@/utils/errorHandler';

// Get user-friendly message
const message = getUserFriendlyErrorMessage(error);

// Check error types
if (isNetworkError(error)) {
  // Handle network error
}
```

### 3. useErrorHandler Hook (`hooks/useErrorHandler.ts`)

React hook for handling errors in components.

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

const MyComponent = () => {
  const { handleError, handleApiError, isNetworkError } = useErrorHandler();

  const fetchData = async () => {
    try {
      const data = await api.getData();
    } catch (error) {
      // Automatically logs and shows toast
      handleApiError(error, '/api/data');
    }
  };

  return <View>...</View>;
};
```

### 4. Toast Service (`services/toastService.ts`)

Singleton service for showing toasts from anywhere in the app.

```typescript
import { toastService } from '@/services/toastService';

// Show different types of toasts
toastService.showSuccess('İşlem başarılı!');
toastService.showError('Bir hata oluştu');
toastService.showWarning('Dikkat!');
toastService.showInfo('Bilgi');
```

### 5. Global Loader (`components/feedback/GlobalLoader.tsx`)

Full-screen loading indicator managed by UI store.

```typescript
import { useUIStore } from '@/store/uiStore';

const MyComponent = () => {
  const { setLoading } = useUIStore();

  const fetchData = async () => {
    setLoading(true, 'Yükleniyor...');
    try {
      await api.getData();
    } finally {
      setLoading(false);
    }
  };

  return <View>...</View>;
};
```

### 6. Modal Management (`components/feedback/GlobalModalManager.tsx`)

Global modal system managed by UI store.

```typescript
import { useUIStore } from '@/store/uiStore';
import { registerModal } from '@/components/feedback/GlobalModalManager';

// Register a modal
registerModal('confirmDelete', (data) => ({
  id: 'confirmDelete',
  title: 'Silme Onayı',
  content: <ConfirmDeleteContent item={data.item} />,
  onClose: data.onClose,
}));

// Use in component
const MyComponent = () => {
  const { openModal, closeModal } = useUIStore();

  const handleDelete = () => {
    openModal('confirmDelete', {
      item: selectedItem,
      onClose: () => console.log('Modal closed'),
    });
  };

  return <Button onPress={handleDelete}>Sil</Button>;
};
```

### 7. Error Boundary (`components/feedback/ErrorBoundary.tsx`)

React Error Boundary for catching rendering errors.

```typescript
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

<ErrorBoundary
  fallback={<CustomErrorScreen />}
  onError={(error, errorInfo) => {
    // Custom error handling
  }}
>
  <App />
</ErrorBoundary>
```

## API Client Integration

The API client (`api/client.ts`) automatically handles:

### Network Errors
- Detects connection failures, timeouts, and refused connections
- Shows user-friendly error messages
- Logs errors with context
- Automatically retries failed requests

### Authentication Errors (401)
- Automatically refreshes expired tokens
- Queues failed requests during token refresh
- Retries requests with new token
- Logs out user if refresh fails

### API Errors (4xx, 5xx)
- Formats error messages for users
- Shows toast notifications
- Logs errors with status codes
- Handles validation errors (422, 400)

### Error Interceptor Flow

```
Request → [Request Interceptor] → Server
                                      ↓
                                   Response
                                      ↓
                          [Response Interceptor]
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
              Network Error?                      API Error?
                    ↓                                   ↓
            Log + Show Toast                    Check Status Code
                    ↓                                   ↓
              Reject Promise              ┌─────────────┴─────────────┐
                                          ↓                           ↓
                                      401 Error?                Other Errors
                                          ↓                           ↓
                                  Refresh Token              Log + Show Toast
                                          ↓                           ↓
                                  Retry Request              Reject Promise
```

## React Query Integration

React Query is configured with global error handlers in `providers/AppProviders.tsx`:

### Query Errors
- Automatically logged
- Toast notification shown
- Retry logic based on error type
- Network errors retry once
- Other errors retry twice

### Mutation Errors
- Automatically logged
- Toast notification shown
- No automatic retry (mutations should be explicit)

### Usage in Hooks

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Queries automatically handle errors
const { data, error, isError } = useQuery({
  queryKey: ['jobs'],
  queryFn: jobService.listJobs,
  // Global error handler will show toast and log
});

// Mutations automatically handle errors
const mutation = useMutation({
  mutationFn: jobService.applyToJob,
  onSuccess: () => {
    toastService.showSuccess('Başvuru gönderildi!');
  },
  // Global error handler will show toast and log
});
```

## Global Error Handlers

The app sets up global error handlers in `AppProviders`:

### Window Error Handler
Catches unhandled JavaScript errors:
```typescript
window.addEventListener('error', (event) => {
  // Logs error and shows toast
});
```

### Unhandled Promise Rejection Handler
Catches unhandled promise rejections:
```typescript
window.addEventListener('unhandledrejection', (event) => {
  // Logs error and shows toast (if not network error)
});
```

## Best Practices

### 1. Use React Query for Data Fetching
Let React Query handle errors automatically:
```typescript
const { data, error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  // Errors handled globally
});
```

### 2. Use useErrorHandler for Custom Error Handling
When you need custom error handling:
```typescript
const { handleError } = useErrorHandler();

try {
  await customOperation();
} catch (error) {
  handleError(error, { context: { operation: 'custom' } });
}
```

### 3. Use Toast Service for Success Messages
```typescript
import { toastService } from '@/services/toastService';

const handleSubmit = async () => {
  try {
    await submitForm();
    toastService.showSuccess('Form gönderildi!');
  } catch (error) {
    // Error automatically handled by API client
  }
};
```

### 4. Use Global Loader for Long Operations
```typescript
const { setLoading } = useUIStore();

const handleLongOperation = async () => {
  setLoading(true, 'İşlem yapılıyor...');
  try {
    await longOperation();
  } finally {
    setLoading(false);
  }
};
```

### 5. Don't Duplicate Error Handling
The API client and React Query already handle most errors. Only add custom error handling when you need:
- Custom error messages
- Custom error recovery logic
- Additional context logging
- Different UI feedback

## Error Types

### NetworkError
- No response from server
- Connection timeout
- Connection refused
- DNS resolution failure

### ApiError
- 4xx client errors
- 5xx server errors
- Custom API error responses

### ValidationError
- 400 Bad Request
- 422 Unprocessable Entity
- Form validation errors

### AuthError
- 401 Unauthorized
- 403 Forbidden
- Token expiration

## Testing Error Handling

### Test Network Errors
```typescript
// Simulate network error
jest.mock('@/api/client', () => ({
  get: jest.fn().mockRejectedValue({
    name: 'NetworkError',
    message: 'Network error',
  }),
}));
```

### Test API Errors
```typescript
// Simulate API error
jest.mock('@/api/client', () => ({
  get: jest.fn().mockRejectedValue({
    response: {
      status: 500,
      data: { message: 'Server error' },
    },
  }),
}));
```

### Test Error Boundary
```typescript
const ThrowError = () => {
  throw new Error('Test error');
};

render(
  <ErrorBoundary>
    <ThrowError />
  </ErrorBoundary>
);

expect(screen.getByText('Bir Şeyler Yanlış Gitti')).toBeInTheDocument();
```

## Monitoring and Debugging

### Development Mode
- All errors logged to console with full details
- Error boundaries show error details
- Network errors show request details

### Production Mode
- Errors logged to external service (configure in errorLogger)
- User-friendly messages shown
- Sensitive information hidden
- Error tracking with context

### Configure External Logging
Update `utils/errorLogger.ts`:
```typescript
private sendToLoggingService(logData: any): void {
  // Example: Sentry
  Sentry.captureException(logData);
  
  // Example: Custom service
  fetch('https://your-logging-service.com/logs', {
    method: 'POST',
    body: JSON.stringify(logData),
  });
}
```

## Summary

The error handling system provides comprehensive coverage for:
- ✅ API errors with automatic retry and token refresh
- ✅ Network errors with user-friendly feedback
- ✅ Unhandled errors and promise rejections
- ✅ Error logging for debugging
- ✅ Toast notifications for user feedback
- ✅ Loading indicators through global loader
- ✅ Modal management through UI store
- ✅ React Query integration
- ✅ Error boundaries for rendering errors

All requirements from the specification are met:
- **Requirement 8.1**: API errors display through toast system ✅
- **Requirement 8.2**: Loading indicators through global loader ✅
- **Requirement 8.3**: Modal management through UI store ✅
- **Requirement 8.4**: Error logging for unhandled errors ✅
- **Requirement 8.5**: Network error feedback ✅
