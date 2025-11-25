import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import { JobDetail, JobsResponse } from '@/types/job';

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
    const response = await apiClient.get<ApiResponse<JobsResponse>>(
      endpoints.jobs.list,
      {
        params,
      },
    );
    return response.data.data;
  },

  async getJobDetail(id: number) {
    const response = await apiClient.get<ApiResponse<JobDetail>>(
      endpoints.jobs.detail(id),
    );
    return response.data.data;
  },

  async applyToJob(payload: ApplyJobPayload) {
    await apiClient.post<ApiResponse<null>>(endpoints.applications.create, {
      job_id: payload.jobId,
      cover_letter: payload.coverLetter?.trim() || undefined,
    });
  },
};

