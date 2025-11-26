import { DoctorProfile } from '@/types/profile';

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  title?: string;
  status?: string;
  profile_completion_percent?: number;
  is_approved?: boolean | number | string;
  role?: string;
}

export interface AuthResponsePayload {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  profile?: DoctorProfile | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface DoctorRegistrationPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  title: 'Dr.' | 'Uz. Dr.' | 'Dr. Öğr. Üyesi' | 'Doç. Dr.' | 'Prof. Dr.';
  specialty_id: number;
  subspecialty_id?: number | null;
  region: 'ist_avrupa' | 'ist_anadolu' | 'ankara' | 'izmir' | 'diger' | 'yurtdisi';
  profile_photo: string;
}

export interface DoctorRegistrationResponse {
  user: {
    id: number;
    email: string;
    role: string;
    is_approved: boolean;
  };
  profile: {
    id: number;
    first_name: string;
    last_name: string;
    title: string;
    specialty_id: number;
    subspecialty_id?: number | null;
    region: string;
    profile_photo: string;
    photo_status?: string;
  };
}

