/**
 * @file job.service.ts
 * @description Job service - İş ilanı işlemleri için API servisi
 * 
 * Ana İşlevler:
 * - List jobs (iş ilanı listesi - pagination, filters)
 * - Get job detail (iş ilanı detayı)
 * - Apply to job (iş ilanına başvuru)
 * 
 * Endpoint'ler: /api/mobile/jobs/*
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse, PaginationMeta } from '@/types/api';
import { JobDetail, JobsResponse, JobListItem } from '@/types/job';

export interface JobListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  city_id?: number;
  specialty_id?: number;
  subspecialty_id?: number;
  employment_type?: string;
}

export interface ApplyJobPayload {
  jobId: number;
  coverLetter?: string;
}

export const jobService = {
  /**
   * İş ilanı listesini getirir (pagination ve filters ile)
   * @param {JobListParams} params - Filtreleme ve pagination parametreleri
   * @returns {Promise<JobsResponse>} İş ilanı listesi ve pagination bilgisi
   */
  async listJobs(params: JobListParams = {}): Promise<JobsResponse> {
    const response = await apiClient.get<
      ApiResponse<JobListItem[]> & { pagination?: PaginationMeta }
    >(endpoints.jobs.list, {
      params,
    });
    const responseData = response.data;
    const pagination = responseData.pagination || responseData.meta;
    
    if (!pagination) {
      throw new Error('Pagination bilgisi alınamadı');
    }
    
    return {
      data: responseData.data || [],
      pagination,
    };
  },

  /**
   * İş ilanı detayını getirir
   * @param {number} id - İş ilanı ID'si
   * @returns {Promise<JobDetail>} İş ilanı detayı
   */
  async getJobDetail(id: number): Promise<JobDetail> {
    const response = await apiClient.get<ApiResponse<JobDetail>>(
      endpoints.jobs.detail(id),
    );
    return response.data.data;
  },

  /**
   * İş ilanına başvuru yapar
   * @param {ApplyJobPayload} payload - Başvuru bilgileri (jobId, coverLetter)
   * @returns {Promise<void>}
   */
  async applyToJob(payload: ApplyJobPayload): Promise<void> {
    await apiClient.post<ApiResponse<null>>(endpoints.applications.create, {
      job_id: payload.jobId,
      cover_letter: payload.coverLetter?.trim() || undefined,
    });
  },
};

