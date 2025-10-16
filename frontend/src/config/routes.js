/**
 * @fileoverview Route configuration for the application
 * @description Defines all application routes organized by user roles
 * Based on the actual routes defined in src/routes/index.jsx
 */

// Public routes
export const ROUTE_CONFIG = {
  PUBLIC: {
    HOME: '/',
    ABOUT: '/about',
    CONTACT: '/contact',
    LOGIN: '/login',
    REGISTER: '/register',
    PENDING_APPROVAL: '/pending-approval',
  },
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    USER_DETAIL: '/admin/users/:id',
    JOBS: '/admin/jobs',
    JOB_DETAIL: '/admin/jobs/:id',
    APPLICATIONS: '/admin/applications',
    APPLICATION_DETAIL: '/admin/applications/:id',
    NOTIFICATIONS: '/admin/notifications',
    CONTACT_MESSAGES: '/admin/contact-messages',
    PHOTO_APPROVALS: '/admin/photo-approvals',
  },
  
  // Doctor routes
  DOCTOR: {
    DASHBOARD: '/doctor',
    PROFILE: '/doctor/profile',
    JOBS: '/doctor/jobs',
    APPLICATIONS: '/doctor/applications',
  },
  
  // Hospital routes
  HOSPITAL: {
    DASHBOARD: '/hospital',
    PROFILE: '/hospital/profile',
    JOBS: '/hospital/jobs',
    JOB_CREATE: '/hospital/jobs/new',
    APPLICATIONS: '/hospital/applications',
    DOCTORS: '/hospital/doctors',
    DEPARTMENTS: '/hospital/departments',
    CONTACTS: '/hospital/contacts',
  },
  
  // Shared routes
  SHARED: {
    NOTIFICATIONS: '/notifications',
  },
};
