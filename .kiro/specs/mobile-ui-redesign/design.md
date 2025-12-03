# Design Document

## Overview

This design document outlines the UI/UX redesign for the MediKariyer mobile application, a React Native (Expo + TypeScript) job board platform for medical professionals. The redesign focuses on creating a minimal, clinical design language that emphasizes professionalism, clarity, and ease of use.

The design leverages the existing component architecture while introducing stricter design system guidelines based on an 8px grid system, refined typography hierarchy, and a clean color palette optimized for healthcare applications.

## Architecture

### Design System Architecture

The design system follows a three-tier component architecture:

1. **Global Components** (`src/components/ui/`): Reusable UI primitives used across all features
2. **Feature Components** (`src/features/{feature}/components/`): Domain-specific components used within a single feature
3. **Screen Compositions**: Screens that compose global and feature components

### Theme System

The application uses a centralized theme system (`src/theme/`) that provides:
- Color palettes (light and dark modes)
- Spacing scale based on 8px grid
- Typography system with semantic variants
- Border radius values
- Shadow definitions

The theme is accessed via React Context (`ThemeContext`) and supports dynamic theme switching.

### Navigation Architecture

The application uses React Navigation with a nested structure:
- **RootNavigator**: Handles authentication state
- **AuthNavigator**: Login, Register screens
- **AppNavigator**: Main authenticated app
  - **TabNavigator**: Bottom tabs (Home, Jobs, Applications, Profile)
  - **Stack Navigators**: Nested stacks for each tab

## Components and Interfaces

### Global UI Components

#### Button Component
**Location**: `src/components/ui/Button.tsx`

**Interface**:
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress: () => void;
  label?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
```

**Design Specifications**:
- Border radius: 12px (md) for all variants
- Minimum touch target: 44x44px (md size)
- Padding: Follows 8px grid (sm: 8/12px, md: 12/16px, lg: 16/20px)
- Typography: Semibold weight, size varies by button size

**Variants**:
- `primary`: Solid background with primary color (soft blue)
- `secondary`: Solid background with secondary color (teal)
- `outline`: Transparent background with colored border
- `ghost`: Transparent background, no border

#### Card Component
**Location**: `src/components/ui/Card.tsx`

**Interface**:
```typescript
interface CardProps {
  children: React.ReactNode;
  variant: 'elevated' | 'outlined' | 'filled';
  padding?: keyof Spacing | '2xl';
  shadow?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
}
```

**Design Specifications**:
- Border radius: 16px (lg) for clinical, modern appearance
- Default padding: 16px (lg)
- Shadow: Subtle elevation for depth without clutter
- Background: White (light mode) or dark surface (dark mode)

**Variants**:
- `elevated`: Default card with shadow
- `outlined`: Border instead of shadow
- `filled`: Filled background (secondary color)

#### Badge Component
**Location**: `src/components/ui/Badge.tsx`

**Interface**:
```typescript
interface BadgeProps {
  status: 'pending' | 'accepted' | 'rejected' | 'reviewed';
  label: string;
  size?: 'sm' | 'md';
}
```

**Design Specifications**:
- Border radius: 8px (md) for pill shape
- Padding: 4px/8px (xs/sm)
- Typography: Regular 14pt
- Color mapping:
  - `pending`: Yellow (warning.500)
  - `accepted`: Green (success.500)
  - `rejected`: Red (error.500)
  - `reviewed`: Blue (primary.500)

### Feature-Specific Components

#### JobCard Component
**Location**: `src/features/jobs/components/JobCard.tsx`

**Purpose**: Display job listing in a scannable card format

**Content Structure**:
- Hospital name (Semibold 18pt)
- Department/Specialty (Medium 16pt)
- City with location icon (Regular 14pt)
- Salary (optional, Regular 14pt)
- Application count (optional, Regular 14pt)
- Apply button (primary, md size)

**Layout**:
- Card padding: 16px
- Spacing between elements: 8px
- Apply button: Right-aligned or full-width at bottom

#### ApplicationCard Component
**Location**: `src/features/applications/components/ApplicationCard.tsx`

**Purpose**: Display application with status tracking

**Content Structure**:
- Hospital name (Semibold 18pt)
- Position (Medium 16pt)
- Status badge (color-coded)
- Application date (Regular 14pt, secondary text color)

**Layout**:
- Card padding: 16px
- Status badge: Top-right corner
- Spacing: 8px between elements

#### NotificationCard Component
**Location**: `src/features/notifications/components/NotificationCard.tsx`

**Purpose**: Display notification with read/unread state

**Content Structure**:
- Notification message (Medium 16pt)
- Timestamp (Regular 14pt, secondary text color)

**Visual States**:
- Unread: Light blue background (primary.50)
- Read: White background

**Layout**:
- Card padding: 16px
- Spacing: 8px between message and timestamp

### Screen Components

#### Dashboard Screen
**Location**: `src/features/dashboard/screens/DashboardScreen.tsx`

**Layout Structure**:
```
┌─────────────────────────────┐
│ Greeting Header             │
│ "Hoş geldin, Dr. Kerem"     │
├─────────────────────────────┤
│                             │
│  ┌──────────┐ ┌──────────┐ │
│  │ İlanlar  │ │Başvurular│ │
│  └──────────┘ └──────────┘ │
│                             │
├─────────────────────────────┤
│ Notifications Section       │
│ ┌─────────────────────────┐ │
│ │ Notification 1          │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Notification 2          │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Design Specifications**:
- Screen padding: 16px horizontal
- Greeting: Bold 24pt
- Action buttons: Large cards with icons, 48px height minimum
- Button spacing: 16px gap
- Section spacing: 24px between sections

#### Job Listing Screen
**Location**: `src/features/jobs/screens/JobsScreen.tsx`

**Layout Structure**:
- FlatList of JobCard components
- Card spacing: 16px between cards
- Pull-to-refresh functionality
- Empty state with illustration

#### Job Detail Screen
**Location**: `src/features/jobs/screens/JobDetailScreen.tsx`

**Layout Structure**:
```
┌─────────────────────────────┐
│ Hospital Logo & Name        │
├─────────────────────────────┤
│ ScrollView                  │
│ ┌─────────────────────────┐ │
│ │ 📍 City                 │ │
│ │ 💼 Department           │ │
│ │ 💰 Salary               │ │
│ │ 📅 Duration             │ │
│ └─────────────────────────┘ │
│                             │
│ Description                 │
│ (scrollable)                │
│                             │
└─────────────────────────────┘
┌─────────────────────────────┐
│ [BAŞVUR] (Fixed Button)     │
└─────────────────────────────┘
```

**Design Specifications**:
- Header: Fixed, with hospital logo (64x64) and name
- Detail rows: Icon + text, 8px gap, 12px vertical padding
- Description: Regular 16pt, relaxed line height
- Fixed button: 16px padding from edges, always visible

#### Profile Screen
**Location**: `src/features/profile/screens/ProfileScreen.tsx`

**Layout Structure**:
- Tab navigation at top
- Tabs: Personal Info, Education, Experience, Certificates, Languages
- Active tab indicator: Underline with primary color
- Tab content: Scrollable cards

**Design Specifications**:
- Tab bar: 48px height, horizontal scroll if needed
- Tab spacing: 24px between tabs
- Active indicator: 3px height, primary color
- Content padding: 16px

## Data Models

### Theme Interface
```typescript
interface Theme {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
  borderRadius: BorderRadius;
  shadows: Shadows;
}

interface Spacing {
  xs: 4;
  sm: 8;
  md: 12;
  lg: 16;
  xl: 20;
  '2xl': 24;
  '3xl': 32;
  '4xl': 40;
  '5xl': 48;
  '6xl': 64;
}

interface Typography {
  fontSize: {
    xs: 12;
    sm: 14;
    base: 16;
    lg: 18;
    xl: 20;
    '2xl': 24;
    '3xl': 28;
    '4xl': 32;
  };
  fontWeight: {
    normal: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
  };
}

interface BorderRadius {
  xs: 4;
  sm: 6;
  md: 8;
  lg: 12;
  xl: 16;
  '2xl': 20;
  '3xl': 24;
  full: 9999;
}
```

### Component Props Models

All component interfaces follow TypeScript strict typing with:
- Required props clearly marked
- Optional props with sensible defaults
- Style props for customization
- Event handlers with proper typing


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Design System Properties

**Property 1: Spacing grid consistency**
*For any* spacing value defined in the theme, the value should be a multiple of 8 pixels
**Validates: Requirements 1.1**

**Property 2: Border radius range compliance**
*For any* Button, Card, or Modal component instance, the border radius should be between 16 and 24 pixels
**Validates: Requirements 1.2**

**Property 3: Typography hierarchy correctness**
*For any* text variant in the typography system, the font size and weight should match the defined hierarchy (Bold 22-24pt for headings, Semibold 18pt for subheadings, Medium 16pt for normal, Regular 14pt for descriptions)
**Validates: Requirements 1.3**

**Property 4: Color palette compliance**
*For any* light theme configuration, the primary background should be white and primary accent colors should be in the blue spectrum
**Validates: Requirements 1.4**

**Property 5: Shadow subtlety**
*For any* shadow definition in the theme, the shadow opacity should be less than 0.3 to maintain subtlety
**Validates: Requirements 1.5**

### Component Properties

**Property 6: Card component consistency**
*For any* Card component instance, it should accept and correctly apply padding, borderRadius, and shadow props
**Validates: Requirements 2.4**

**Property 7: Button variant support**
*For any* Button component instance, it should support all variants (primary, secondary, outline, ghost) and render with correct styling
**Validates: Requirements 2.5**

### Screen Layout Properties

**Property 8: Dashboard greeting personalization**
*For any* doctor user with a name, the Dashboard should render a greeting that contains the doctor's name
**Validates: Requirements 3.1**

**Property 9: Dashboard spacing compliance**
*For any* spacing value used in the Dashboard layout, the value should be a multiple of 8 pixels
**Validates: Requirements 3.5**

**Property 10: Job card completeness**
*For any* job data with hospital name, department, and city, the JobCard should render all three fields
**Validates: Requirements 4.2**

**Property 11: Job card optional fields**
*For any* job data, if salary or application count is present, it should be displayed; if absent, it should not be displayed
**Validates: Requirements 4.3**

**Property 12: Job listing spacing consistency**
*For any* list of job cards, the spacing between consecutive cards should be consistent and a multiple of 8 pixels
**Validates: Requirements 4.5**

**Property 13: Job detail completeness**
*For any* job detail data with hospital information, the screen should display both hospital logo and name
**Validates: Requirements 5.1**

**Property 14: Job detail typography hierarchy**
*For any* text element in the Job Detail Screen, headings should use larger font sizes and heavier weights than body text
**Validates: Requirements 5.5**

**Property 15: Application card completeness**
*For any* application data, the ApplicationCard should display hospital name, position, status badge, and date
**Validates: Requirements 6.2**

**Property 16: Application status color mapping**
*For any* application status (Pending, Accepted, Rejected, Reviewed), the status badge should use the correct color (yellow, green, red, blue respectively)
**Validates: Requirements 6.4**

**Property 17: Application sorting**
*For any* list of applications with dates, the applications should be sorted with most recent first
**Validates: Requirements 6.5**

**Property 18: Notification unread styling**
*For any* notification, if it is unread, the background color should be light blue; if read, the background should be white
**Validates: Requirements 7.2**

**Property 19: Notification interaction state change**
*For any* unread notification, when tapped, it should transition to read state and the background should change from light blue to white
**Validates: Requirements 7.5**

**Property 20: Profile tab content exclusivity**
*For any* Profile Screen state with a selected tab, only the content of that tab should be visible
**Validates: Requirements 8.3**

**Property 21: Active tab highlighting**
*For any* tab navigation with an active tab, the active tab should be visually highlighted with the primary accent color
**Validates: Requirements 8.2, 9.2**

**Property 22: Bottom navigation spacing compliance**
*For any* spacing value in the bottom navigation, the value should be a multiple of 8 pixels
**Validates: Requirements 9.5**

**Property 23: Screen padding consistency**
*For any* screen container, the horizontal padding should be consistent across all screens (typically 16px)
**Validates: Requirements 10.4**

**Property 24: Touch target accessibility**
*For any* interactive element (button, touchable), the minimum touch target size should be at least 44x44 pixels
**Validates: Requirements 10.5**

## Error Handling

### Component Error Boundaries

All screens should be wrapped in ErrorBoundary components to gracefully handle rendering errors:
- Display user-friendly error messages
- Log errors for debugging
- Provide recovery options (retry, go back)

### Theme Fallbacks

If theme context is unavailable:
- Components should fall back to default theme values
- Console warnings should be logged in development mode
- Application should remain functional with default styling

### Missing Data Handling

Components should handle missing or incomplete data gracefully:
- Optional fields should not break rendering
- Default values should be provided where appropriate
- Empty states should be displayed for lists with no data

### Navigation Error Handling

Navigation errors should be caught and handled:
- Invalid routes should redirect to home or 404 screen
- Navigation state should be preserved during errors
- User should receive feedback about navigation issues

## Testing Strategy

### Unit Testing

Unit tests will verify individual component behavior and styling:

**Component Rendering Tests**:
- Test that components render without crashing
- Test that props are correctly applied
- Test that variants render with correct styles
- Test that conditional rendering works correctly

**Theme Tests**:
- Test that spacing values are multiples of 8
- Test that color values are valid hex/rgba
- Test that typography values match specifications
- Test that border radius values are in correct ranges

**Utility Function Tests**:
- Test helper functions for data formatting
- Test validation functions
- Test transformation functions

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using **fast-check** (JavaScript/TypeScript property-based testing library).

**Configuration**: Each property-based test should run a minimum of 100 iterations to ensure thorough coverage.

**Test Tagging**: Each property-based test must include a comment tag in this exact format:
```typescript
// **Feature: mobile-ui-redesign, Property {number}: {property_text}**
```

**Property Test Coverage**:
- Design system properties (spacing, typography, colors)
- Component consistency properties (Card, Button variants)
- Screen layout properties (spacing, completeness)
- Data rendering properties (conditional fields, sorting)
- Interaction properties (state changes, navigation)

### Integration Testing

Integration tests will verify feature workflows:
- Navigation between screens
- Data flow from API to UI
- User interactions across multiple components
- Theme switching behavior

### Visual Regression Testing

Visual tests will ensure UI consistency:
- Screenshot comparison for key screens
- Component snapshot testing
- Theme variant comparison
- Responsive layout verification

### Accessibility Testing

Accessibility tests will ensure usability:
- Touch target size verification
- Color contrast checking
- Screen reader compatibility
- Keyboard navigation support

## Implementation Notes

### Migration Strategy

The redesign will be implemented incrementally:

1. **Phase 1: Design System Foundation**
   - Update theme configuration
   - Refine global components (Button, Card, Badge)
   - Establish spacing and typography standards

2. **Phase 2: Core Screens**
   - Redesign Dashboard screen
   - Update Job Listing and Job Detail screens
   - Implement new JobCard component

3. **Phase 3: Secondary Screens**
   - Redesign Applications screen
   - Update Notifications screen
   - Implement ApplicationCard and NotificationCard

4. **Phase 4: Profile and Navigation**
   - Redesign Profile screen with tabs
   - Update Bottom Tab Navigation
   - Ensure consistent spacing across all screens

5. **Phase 5: Polish and Testing**
   - Visual refinements
   - Performance optimization
   - Comprehensive testing
   - Documentation updates

### Performance Considerations

- Use React.memo for expensive components
- Implement FlatList for long lists (jobs, applications, notifications)
- Optimize images (hospital logos, avatars)
- Lazy load tab content in Profile screen
- Use theme memoization to prevent unnecessary re-renders

### Accessibility Considerations

- Minimum touch target: 44x44px
- Color contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Screen reader labels for all interactive elements
- Keyboard navigation support
- Focus indicators for interactive elements

### Dark Mode Support

All components should support dark mode:
- Use theme colors instead of hardcoded values
- Test all screens in both light and dark modes
- Ensure sufficient contrast in both modes
- Provide smooth theme transition animations
