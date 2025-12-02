// Re-export the application service from the API layer
// This allows the feature to have its own service namespace
export { applicationService } from '@/api/services/application.service';
export type {
  ApplicationListParams,
  ApplicationsListResponse,
} from '@/api/services/application.service';
