# Implementation Plan: UI Overlay System Refactor

## Overview

This implementation plan refactors the UI overlay system to eliminate global mutable state, ensure deterministic callback execution, and create a production-grade overlay architecture. The tasks are ordered to build incrementally, with property tests validating each component before integration.

## Tasks

- [x] 1. Set up testing infrastructure
  - [x] 1.1 Install fast-check and configure test environment
    - Add fast-check to devDependencies
    - Configure Jest for property-based testing
    - Create test utilities for rendering providers
    - _Requirements: Testing Strategy_

- [x] 2. Refactor Alert System Core
  - [x] 2.1 Create new AlertContext types and interfaces
    - Define AlertConfig, AlertContextType, AlertType interfaces
    - Remove global handler type definitions from alert.ts
    - _Requirements: 1.1, 1.4, 1.6_

  - [x] 2.2 Implement deterministic AlertProvider
    - Remove global handler registration (setGlobalAlertHandler)
    - Add callback refs to prevent stale closures
    - Add isExecuting guard for rapid click prevention
    - Implement showAlert and hideAlert with proper state management
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.6, 3.1_

  - [ ]* 2.3 Write property test for callback single execution
    - **Property 5: Callback Single Execution**
    - **Validates: Requirements 2.1, 2.2, 2.6**

  - [x] 2.4 Implement useAlert hook with error boundary
    - Add descriptive error when called outside provider
    - Return showAlert, hideAlert, isVisible
    - _Requirements: 1.3, 1.4_

  - [ ]* 2.5 Write property test for hook outside provider error
    - **Property 3: Hook Outside Provider Error**
    - **Validates: Requirements 1.3, 5.2, 9.1**

- [x] 3. Refactor CustomAlert Component
  - [x] 3.1 Make CustomAlert stateless
    - Remove internal callback logic
    - Accept onConfirm and onCancel as required props (handled by provider)
    - Keep only animation and rendering logic
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 Add callback validation and error handling
    - Validate callbacks are functions before calling
    - Wrap callback execution in try-catch
    - Log errors in development mode only
    - _Requirements: 9.4, 10.5_

  - [ ]* 3.3 Write property test for callback error handling
    - **Property 16: Callback Error Handling**
    - **Validates: Requirements 10.5**

- [x] 4. Create Alert Helper Utilities
  - [x] 4.1 Implement useAlertHelpers hook
    - Create hook that wraps useAlert with convenience methods
    - Implement success, error, info, confirm, confirmDestructive helpers
    - Ensure callbacks pass through without modification
    - _Requirements: 8.1, 8.4_

  - [x] 4.2 Implement imperative alert API with ref
    - Create alertRef for non-component code access
    - Implement fallback to native Alert.alert when ref unavailable
    - Connect AlertProvider to alertRef via useImperativeHandle
    - _Requirements: 8.5_

  - [ ]* 4.3 Write property test for helper utilities API
    - **Property 14: Helper Utilities API**
    - **Validates: Requirements 8.1, 8.4**

  - [x] 4.4 Remove deprecated global handler pattern
    - Delete setGlobalAlertHandler function
    - Delete globalAlertHandler variable
    - Update all imports to use new hook-based API
    - _Requirements: 1.2_

- [ ] 5. Checkpoint - Alert System Complete
  - Ensure all alert tests pass, ask the user if questions arise.

- [-] 6. Refactor Toast System
  - [x] 6.1 Enhance ToastProvider with proper cleanup
    - Add timersRef for tracking all active timers
    - Implement cleanup on unmount
    - Generate unique IDs with collision prevention
    - _Requirements: 4.6, 5.4_

  - [ ]* 6.2 Write property test for toast unique IDs
    - **Property 12: Toast Unique IDs**
    - **Validates: Requirements 5.4**

  - [x] 6.3 Implement useToast hook with error boundary
    - Add descriptive error when called outside provider
    - Return showToast method
    - _Requirements: 5.1, 5.2_

  - [ ]* 6.4 Write property test for toast auto-dismiss
    - **Property 9: Toast Auto-Dismiss**
    - **Validates: Requirements 4.2**

  - [ ]* 6.5 Write property test for toast stacking
    - **Property 10: Toast Stacking**
    - **Validates: Requirements 4.3**

- [-] 7. Validate Z-Index System
  - [x] 7.1 Audit zIndex.ts for correct ordering
    - Verify all overlay z-index values follow: base < dropdown < bottomSheet < modal < alert < toast
    - Add JSDoc comments explaining the hierarchy
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 7.2 Write property test for z-index stacking order
    - **Property 13: Z-Index Stacking Order**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

- [ ] 8. Checkpoint - Core Systems Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Update Consuming Components
  - [x] 9.1 Migrate SettingsScreen to new alert API
    - Replace showAlert imports with useAlertHelpers hook
    - Update handleLogout and handleDeleteAccount
    - _Requirements: 8.1_

  - [x] 9.2 Migrate useCRUDMutation to new alert API
    - Replace showAlert imports with useAlertHelpers hook
    - Update success and error handlers
    - _Requirements: 8.1_

  - [x] 9.3 Migrate remaining screens using showAlert
    - Update RegisterScreen, LoginScreen, ForgotPasswordScreen
    - Update useSettings hook
    - _Requirements: 8.1_

  - [x] 9.4 Update API interceptor to use imperative alert
    - Replace global showAlert with imperativeAlert
    - Ensure fallback works when provider not mounted
    - _Requirements: 8.5_

- [x] 10. Add Development Safeguards
  - [x] 10.1 Add development-only logging
    - Create devLog and devWarn utilities
    - Add lifecycle logging to AlertProvider (show, hide, callback)
    - Ensure logs are stripped in production
    - _Requirements: 9.3, 9.5_

  - [x] 10.2 Add prop validation to overlay components
    - Add runtime prop validation for CustomAlert
    - Add runtime prop validation for Toast
    - Log descriptive errors for invalid props
    - _Requirements: 9.6_

  - [ ]* 10.3 Write property test for callback validation
    - **Property 15: Callback Validation**
    - **Validates: Requirements 9.4**

- [x] 11. Handle Edge Cases
  - [x] 11.1 Implement alert replacement behavior
    - When showAlert called while alert visible, replace current alert
    - Ensure previous callbacks are not executed
    - _Requirements: 3.6_

  - [ ]* 11.2 Write property test for alert replacement
    - **Property 8: Alert Replacement Behavior**
    - **Validates: Requirements 3.6**

  - [x] 11.3 Implement animation cleanup on unmount
    - Cancel animations when component unmounts
    - Prevent state updates on unmounted components
    - _Requirements: 10.6_

  - [ ]* 11.4 Write property test for animation cleanup
    - **Property 18: Animation Cleanup**
    - **Validates: Requirements 10.6**

  - [ ]* 11.5 Write property test for rapid interaction handling
    - **Property 17: Rapid Interaction Handling**
    - **Validates: Requirements 10.3**

- [x] 12. Final Integration and Cleanup
  - [x] 12.1 Remove deprecated code
    - Delete old global handler code from alert.ts
    - Remove console.log statements used for debugging
    - Clean up unused imports
    - _Requirements: 1.2_

  - [x] 12.2 Update documentation
    - Update UI_COMPONENTS_DOCUMENTATION.md with new API
    - Add migration guide for deprecated patterns
    - Document anti-patterns section
    - _Requirements: Documentation_

 

- [ ] 13. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The migration tasks (9.x) should be done carefully to avoid breaking existing functionality
