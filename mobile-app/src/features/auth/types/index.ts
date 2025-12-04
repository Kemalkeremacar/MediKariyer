/**
 * Auth Feature Types
 */

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

export interface AuthUser {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_approved?: boolean | number | string;
  is_active?: boolean | number;
  phone?: string;
  title?: string;
  specialty_name?: string;
  residence_city_name?: string;
  completion_percent?: number;
}

export interface AuthResponsePayload {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  profile?: any;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface DoctorRegistrationPayload {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  phone: string;
  title?: string;
  specialty_id?: number;
  subspecialty_id?: number;
  residence_city_id?: number;
  profile_photo?: string;
}

export interface DoctorRegistrationResponse {
  message: string;
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  authStatus: AuthStatus;
  isHydrating: boolean;
}
