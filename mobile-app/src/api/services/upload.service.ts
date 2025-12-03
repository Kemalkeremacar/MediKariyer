/**
 * Upload Service
 * Dosya yükleme işlemleri için API servisi
 */

import apiClient from '../client';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

/**
 * Profil fotoğrafı yükle (Base64 format)
 */
export const uploadProfilePhoto = async (uri: string, base64: string): Promise<UploadResponse> => {
  const base64String = `data:image/jpeg;base64,${base64}`;
  
  const response = await apiClient.post<{ data: UploadResponse }>(
    '/upload/profile-photo',
    {
      photo: base64String,
    }
  );

  return response.data.data;
};

export const uploadService = {
  uploadProfilePhoto,
};
