# Requirements Document

## Introduction

This specification defines the requirements for refactoring and stabilizing the UI overlay system in the React Native mobile application. The system includes Alert, Toast, Modal, Select (BottomSheet), and Portal components. The goal is to eliminate non-deterministic behavior, remove global mutable state patterns, ensure reliable callback execution, and create a predictable, production-grade overlay architecture.

## Glossary

- **Alert_System**: The custom alert component and provider that displays blocking dialogs requiring user action (success, error, info, confirm, confirmDestructive types)
- **Toast_System**: The non-blocking notification system that displays auto-dismissing messages at the top of the screen
- **Modal_Component**: A blocking overlay component for displaying contextual content that requires manual dismissal
- **Select_Component**: A dropdown selection component using BottomSheetModal from @gorhom/bottom-sheet
- **Portal_System**: The @gorhom/portal system that renders components outside the React Native hierarchy at a designated PortalHost
- **Overlay**: Any UI element that renders above the main content (Alert, Toast, Modal, Select)
- **Provider**: A React Context provider that manages state and exposes methods via hooks
- **Global_Handler**: A mutable module-level variable pattern used to bridge imperative calls to React context (anti-pattern to be removed)
- **Callback**: A function passed to an overlay to be executed on user action (onConfirm, onCancel) or lifecycle event (onClose)
- **Z_Index_System**: The centralized layering configuration that determines overlay stacking order

## Requirements

### Requirement 1: Alert System Architecture

**User Story:** As a developer, I want a deterministic alert system that uses React Context exclusively, so that alert behavior is predictable and testable without global mutable state.

#### Acceptance Criteria

1. THE Alert_System SHALL manage all alert state exclusively through AlertContext and useAlert hook
2. THE Alert_System SHALL NOT use any global mutable variables or module-level handler patterns
3. WHEN useAlert hook is called outside AlertProvider, THE Alert_System SHALL throw a descriptive error
4. THE Alert_System SHALL provide showAlert and hideAlert methods through the useAlert hook
5. WHEN showAlert is called, THE Alert_System SHALL queue the alert configuration in provider state
6. THE Alert_System SHALL support alert types: success, error, info, confirm, and confirmDestructive

### Requirement 2: Alert Callback Execution

**User Story:** As a developer, I want alert callbacks to execute exactly once with clear separation between user intent and cleanup, so that business logic is never duplicated or missed.

#### Acceptance Criteria

1. WHEN user presses the confirm button, THE Alert_System SHALL execute onConfirm callback exactly once before closing
2. WHEN user presses the cancel button, THE Alert_System SHALL execute onCancel callback exactly once before closing
3. THE Alert_System SHALL execute onClose callback exactly once after the alert is dismissed for state cleanup only
4. THE onClose callback SHALL NOT contain any business logic, only state cleanup operations
5. IF onConfirm or onCancel callbacks are not provided, THE Alert_System SHALL proceed with closing without error
6. THE Alert_System SHALL prevent multiple callback executions from rapid user interactions

### Requirement 3: Alert Lifecycle Management

**User Story:** As a developer, I want alerts to have predictable mount/unmount behavior, so that they work reliably during navigation resets, fast refresh, and error recovery.

#### Acceptance Criteria

1. WHEN AlertProvider unmounts, THE Alert_System SHALL clean up all pending alert state
2. WHEN navigation resets occur, THE Alert_System SHALL maintain alert visibility if currently displayed
3. WHEN fast refresh occurs during development, THE Alert_System SHALL restore to a clean state
4. WHEN ErrorBoundary catches an error, THE Alert_System SHALL remain functional for error display
5. THE Alert_System SHALL NOT use setTimeout or requestAnimationFrame for timing-based fixes
6. WHEN an alert is visible and showAlert is called again, THE Alert_System SHALL queue or replace based on configuration

### Requirement 4: Toast System Stability

**User Story:** As a developer, I want a non-blocking toast system that displays notifications without interfering with user interactions, so that informational messages don't disrupt the user experience.

#### Acceptance Criteria

1. THE Toast_System SHALL render toasts through Portal at the root PortalHost
2. THE Toast_System SHALL auto-dismiss toasts after the configured duration (default 3000ms)
3. WHEN multiple toasts are triggered, THE Toast_System SHALL stack them vertically without overlap
4. THE Toast_System SHALL NOT block touch events on underlying content
5. THE Toast_System SHALL support toast types: success, error, warning, and info
6. WHEN ToastProvider unmounts, THE Toast_System SHALL clean up all pending toast timers

### Requirement 5: Toast Context Integration

**User Story:** As a developer, I want to trigger toasts through a useToast hook, so that toast functionality is accessible throughout the component tree without prop drilling.

#### Acceptance Criteria

1. THE Toast_System SHALL provide showToast method through the useToast hook
2. WHEN useToast hook is called outside ToastProvider, THE Toast_System SHALL throw a descriptive error
3. THE showToast method SHALL accept message string and optional type parameter
4. THE Toast_System SHALL generate unique identifiers for each toast instance
5. WHEN a toast auto-dismisses, THE Toast_System SHALL remove it from state cleanly

### Requirement 6: Modal and Select Interaction Safety

**User Story:** As a developer, I want Modal and Select components to work correctly together without z-index conflicts, so that overlays render in the correct stacking order.

#### Acceptance Criteria

1. THE Modal_Component SHALL render using React Native Modal with proper z-index from Z_Index_System
2. THE Select_Component SHALL render using BottomSheetModal from the root-level BottomSheetModalProvider
3. WHEN Select is used inside a Modal, THE Select_Component SHALL render above the Modal
4. THE Select_Component SHALL NOT require local BottomSheetModalProvider instances
5. WHEN navigation uses presentation modes, THE Select_Component SHALL work with presentation: 'card' only
6. IF presentation: 'modal' is used on a screen with Select, THE system SHALL log a development warning

### Requirement 7: Overlay Stacking Order

**User Story:** As a developer, I want all overlays to respect a centralized z-index system, so that stacking order is consistent and predictable across the application.

#### Acceptance Criteria

1. THE Z_Index_System SHALL define stacking order: base < dropdown/select < bottomSheet < modal < alert < toast
2. THE Toast_System SHALL always render above Alert_System
3. THE Alert_System SHALL always render above Modal_Component
4. THE Select_Component SHALL render above regular content but below modals when opened from non-modal screens
5. WHEN multiple overlays are visible, THE system SHALL maintain correct stacking without manual z-index overrides
6. THE Z_Index_System SHALL be the single source of truth for all overlay z-index values

### Requirement 8: Helper Utility Design

**User Story:** As a developer, I want ergonomic helper functions for common alert patterns, so that I can trigger alerts with minimal boilerplate while keeping business logic in components.

#### Acceptance Criteria

1. THE Alert_System SHALL provide helper utilities: showAlert.success, showAlert.error, showAlert.info, showAlert.confirm, showAlert.confirmDestructive
2. THE helper utilities SHALL be thin wrappers that delegate to useAlert hook internally
3. THE helper utilities SHALL NOT contain any business logic or side effects
4. THE helper utilities SHALL accept callbacks as parameters without modifying them
5. WHEN helper utilities are called before AlertProvider mounts, THE system SHALL fall back to native Alert.alert
6. THE helper utilities SHALL provide TypeScript type safety for all parameters

### Requirement 9: Development Safeguards

**User Story:** As a developer, I want the overlay system to provide warnings and defensive checks during development, so that misuse is caught early and debugging is easier.

#### Acceptance Criteria

1. WHEN useAlert or useToast is called outside their respective providers, THE system SHALL throw a clear error message
2. WHEN presentation: 'modal' is detected on a screen using Select, THE system SHALL log a warning in development mode
3. THE Alert_System SHALL log lifecycle events (show, hide, callback execution) in development mode
4. WHEN callbacks are executed, THE system SHALL validate they are functions before calling
5. THE system SHALL NOT include development warnings or logs in production builds
6. WHEN an overlay component receives invalid props, THE system SHALL provide descriptive prop validation errors

### Requirement 10: System Resilience

**User Story:** As a developer, I want the overlay system to handle edge cases gracefully, so that the app remains stable during navigation changes, errors, and rapid user interactions.

#### Acceptance Criteria

1. WHEN navigation state resets, THE overlay system SHALL not crash or leave orphaned overlays
2. WHEN ErrorBoundary triggers, THE Alert_System SHALL remain available for error display
3. WHEN rapid show/hide calls occur, THE system SHALL process them in order without race conditions
4. WHEN the app goes to background and returns, THE overlay system SHALL maintain correct state
5. IF an overlay callback throws an error, THE system SHALL catch it and log without crashing the app
6. THE system SHALL handle unmount during animation gracefully without memory leaks
