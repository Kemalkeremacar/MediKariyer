/**
 * API Services
 * 
 * Centralized exports for all API service modules.
 * Each service encapsulates API calls for a specific feature domain.
 */

export { authService } from './auth.service';
export { jobService } from './job.service';
export { applicationService } from './application.service';
export { profileService } from './profile.service';
export { notificationService } from './notification.service';
export { lookupService } from './lookup.service';
export { doctorService } from './doctor.service';

// Re-export types for convenience
export type { JobListParams, ApplyJobPayload } from './job.service';
export type { ApplicationListParams } from './application.service';
export type { NotificationListParams } from './notification.service';
