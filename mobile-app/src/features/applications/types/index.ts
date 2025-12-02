// Re-export application types from the global types directory
export type {
  ApplicationListItem,
  ApplicationDetail,
  ApplicationsPagination,
  ApplicationsResponse,
} from '@/types/application';

// Feature-specific types
export interface ApplicationFilters {
  status?: string;
}

export interface ApplicationModalState {
  visible: boolean;
  applicationId: number | null;
}
