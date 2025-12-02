import { DoctorProfile } from '@/types/profile';

/**
 * Authentication status enum
 */
export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

/**
 * Authenticated user data
 */
export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  title?: string;
  status?: string;
  profile_completion_percent?: number;
  is_approved?: boolean | number | string;
  is_active?: boolean | number | string;
  role?: string;
}

/**
 * Auth response payload from login/refresh endpoints
 */
export interface AuthResponsePayload {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  profile?: DoctorProfile | null;
}

/**
 * Login request payload
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Doctor registration request payload
 */
export interface DoctorRegistrationPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  title: 'Dr.' | 'Uz. Dr.' | 'Dr. Öğr. Üyesi' | 'Doç. Dr.' | 'Prof. Dr.';
  specialty_id: number;
  subspecialty_id?: number | null;
  region:
    | 'ist_avrupa'
    | 'ist_anadolu'
    | 'ankara'
    | 'izmir'
    | 'diger'
    | 'yurtdisi';
  profile_photo: string;
}

/**
 * Doctor registration response
 */
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

/**
 * Auth state for Zustand store
 */
export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  authStatus: AuthStatus;
  isHydrating: boolean;
  setAuthState: (payload: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  markUnauthenticated: () => void;
  setHydrating: (value: boolean) => void;
}
