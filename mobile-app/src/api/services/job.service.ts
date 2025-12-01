import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse, PaginationMeta } from '@/types/api';
import { JobDetail, JobsResponse, JobListItem } from '@/types/job';

export interface JobListParams {
  page?: number;
  limit?: number;
  search?: string;
  city_id?: number;
  specialty_id?: number;
  subspecialty_id?: number;
}

export interface ApplyJobPayload {
  jobId: number;
  coverLetter?: string;
}

export const jobService = {
  async listJobs(params: JobListParams = {}) {
    // Backend sendPaginated response formatı:
    // { success, message, data: [...], pagination: {...}, timestamp }
    const response = await apiClient.get<
      ApiResponse<JobListItem[]> & { pagination?: PaginationMeta }
    >(endpoints.jobs.list, {
      params,
    });
    const responseData = response.data;
    return {
      data: responseData.data || [],
      pagination: responseData.pagination || responseData.meta,
    };
  },

  async getJobDetail(id: number): Promise<JobDetail> {
    const response = await apiClient.get<ApiResponse<JobDetail>>(
      endpoints.jobs.detail(id),
    );
    // Backend sendSuccess response formatı: { success, message, data: {...}, timestamp }
    return response.data.data;
  },

  async applyToJob(payload: ApplyJobPayload) {
    await apiClient.post<ApiResponse<null>>(endpoints.applications.create, {
      job_id: payload.jobId,
      cover_letter: payload.coverLetter?.trim() || undefined,
    });
  },
};

