# Requirements Document

## Introduction

This specification defines the UI/UX redesign requirements for the MediKariyer mobile application. The application serves as a job board platform connecting doctors with healthcare institutions. The redesign focuses on creating a minimal, clinical, and professional design language that emphasizes clarity, trust, and ease of use for medical professionals.

## Glossary

- **Mobile Application**: The React Native (Expo + TypeScript) mobile application for doctors
- **Design System**: A collection of reusable UI components following consistent design principles
- **Job Listing**: A job posting from a healthcare institution seeking medical professionals
- **Application**: A doctor's submission to a specific job listing
- **Dashboard**: The main home screen showing quick actions and notifications
- **Bottom Navigation**: The primary navigation bar with 4 tabs (Home, Jobs, Applications, Profile)
- **Card Component**: A reusable UI element displaying information in a contained, elevated format
- **8px Grid System**: A spacing system where all margins and paddings are multiples of 8 (8, 16, 24, 32, 40)
- **Clinical Design**: A minimal, clean aesthetic using white and soft-blue tones that conveys professionalism and trust

## Requirements

### Requirement 1: Global Design System

**User Story:** As a developer, I want a consistent design system with reusable components, so that the application maintains visual consistency and development efficiency.

#### Acceptance Criteria

1. THE Mobile Application SHALL implement an 8px grid system WHERE all spacing values are multiples of 8 pixels (8, 16, 24, 32, 40)
2. THE Mobile Application SHALL use rounded corners of 16-24 pixels for buttons, cards, and modals
3. THE Mobile Application SHALL implement a typography hierarchy with Bold 22-24pt for headings, Semibold 18pt for subheadings, Medium 16pt for normal text, and Regular 14pt for descriptions
4. THE Mobile Application SHALL use a minimal color palette with white as the primary background and soft-blue tones for accents
5. THE Mobile Application SHALL apply subtle shadows to cards and elevated elements to create depth without visual clutter

### Requirement 2: Reusable Component Architecture

**User Story:** As a developer, I want clearly defined global and feature-specific components, so that I can build screens efficiently and maintain code quality.

#### Acceptance Criteria

1. THE Mobile Application SHALL provide global UI components (Button, Card, Input, Modal, Badge, Avatar) in the src/components directory
2. WHEN a UI component is used across multiple features THEN the component SHALL reside in src/components
3. WHEN a UI component is specific to a single feature THEN the component SHALL reside in features/{featureName}/components
4. THE Mobile Application SHALL implement a Card component with consistent padding, border radius, and shadow properties
5. THE Mobile Application SHALL implement a Button component with variants (primary, secondary, outline) following the design system

### Requirement 3: Simplified Dashboard Screen

**User Story:** As a doctor, I want a clean and simple home screen with quick access to main features, so that I can navigate efficiently without confusion.

#### Acceptance Criteria

1. WHEN a doctor opens the Mobile Application THEN the Dashboard SHALL display a personalized greeting with the doctor's name
2. THE Dashboard SHALL display two prominent action buttons for "İlanlar" (Jobs) and "Başvurularım" (My Applications)
3. THE Dashboard SHALL display a notifications section below the main action buttons
4. THE Dashboard SHALL display quick action cards for recent activities
5. THE Dashboard SHALL use ample whitespace and the 8px grid system to create a spacious, uncluttered layout

### Requirement 4: Job Listing Screen

**User Story:** As a doctor, I want to browse job listings in a clean card-based format, so that I can quickly scan opportunities and make decisions.

#### Acceptance Criteria

1. THE Job Listing Screen SHALL display each job as a card component with consistent spacing
2. WHEN displaying a job card THEN the card SHALL show hospital name, department/specialty, city, and an apply button
3. THE Job Listing Screen SHALL optionally display salary information and application count when available
4. THE Job Listing Screen SHALL use the Card component with proper padding and rounded corners
5. THE Job Listing Screen SHALL provide sufficient whitespace between cards to prevent visual clutter

### Requirement 5: Job Detail Screen

**User Story:** As a doctor, I want to view detailed job information with a clear call-to-action, so that I can make informed application decisions.

#### Acceptance Criteria

1. WHEN a doctor views a job detail THEN the screen SHALL display the hospital logo and name at the top
2. THE Job Detail Screen SHALL display job details as icon-labeled rows for easy scanning
3. THE Job Detail Screen SHALL provide a scrollable description section for detailed information
4. THE Job Detail Screen SHALL display a fixed "BAŞVUR" (Apply) button at the bottom that remains visible during scrolling
5. THE Job Detail Screen SHALL use the design system's typography hierarchy to distinguish headings from body text

### Requirement 6: Applications Screen

**User Story:** As a doctor, I want to track my job applications with clear status indicators, so that I can monitor my application progress efficiently.

#### Acceptance Criteria

1. THE Applications Screen SHALL display each application as a card component
2. WHEN displaying an application card THEN the card SHALL show hospital name, position, status, and application date
3. THE Applications Screen SHALL use color-coded badges to indicate application status (Pending, Accepted, Rejected, Reviewed)
4. THE Applications Screen SHALL use distinct colors for each status: yellow for Pending, green for Accepted, red for Rejected, blue for Reviewed
5. THE Applications Screen SHALL sort applications with most recent first

### Requirement 7: Notifications Screen

**User Story:** As a doctor, I want to receive and view notifications about my applications, so that I stay informed about important updates.

#### Acceptance Criteria

1. THE Notifications Screen SHALL display each notification as a card component
2. WHEN a notification is unread THEN the notification card SHALL have a light blue background to distinguish it from read notifications
3. THE Notifications Screen SHALL display notification messages such as "Başvurun değerlendiriliyor" (Your application is being reviewed)
4. THE Notifications Screen SHALL display timestamps for each notification
5. WHEN a doctor taps a notification THEN the notification SHALL be marked as read and the background SHALL change to white

### Requirement 8: Profile Screen with Tabbed Navigation

**User Story:** As a doctor, I want to manage my profile information in organized sections, so that I can maintain comprehensive professional information without feeling overwhelmed.

#### Acceptance Criteria

1. THE Profile Screen SHALL organize information into tabs: Personal Information, Education, Experience, Certificates, and Languages
2. WHEN a doctor views the Profile Screen THEN the active tab SHALL be visually highlighted
3. THE Profile Screen SHALL display only the content of the selected tab to avoid information overload
4. THE Profile Screen SHALL use the Card component to display information within each tab
5. THE Profile Screen SHALL allow horizontal swiping between tabs for easy navigation

### Requirement 9: Bottom Tab Navigation

**User Story:** As a doctor, I want simple bottom navigation with 4 main sections, so that I can access key features quickly using familiar navigation patterns.

#### Acceptance Criteria

1. THE Mobile Application SHALL implement bottom tab navigation with exactly 4 tabs: Home, İlanlar (Jobs), Başvurular (Applications), and Profil (Profile)
2. WHEN a tab is active THEN the tab icon and label SHALL be highlighted with the primary accent color
3. THE Bottom Navigation SHALL remain visible and accessible from all main screens
4. THE Bottom Navigation SHALL use icons that clearly represent each section
5. THE Bottom Navigation SHALL follow the 8px grid system for spacing and sizing

### Requirement 10: Component Spacing and Layout Consistency

**User Story:** As a user, I want consistent spacing throughout the application, so that the interface feels cohesive and professional.

#### Acceptance Criteria

1. THE Mobile Application SHALL apply padding to screen containers using values from the 8px grid system (typically 16 or 24)
2. THE Mobile Application SHALL apply margins between components using values from the 8px grid system
3. WHEN displaying lists of cards THEN the spacing between cards SHALL be consistent (typically 16px)
4. THE Mobile Application SHALL use consistent horizontal padding for all screens (typically 16px)
5. THE Mobile Application SHALL ensure touch targets for buttons and interactive elements are at least 44x44 pixels for accessibility
