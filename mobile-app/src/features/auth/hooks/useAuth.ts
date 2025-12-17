/**
 * useAuth Hook
 * Provides authentication state and helper functions
 */

import { useAuthStore } from '@/store/authStore';
import type { AuthUser } from '@/types/auth';

/**
 * Hook for accessing authentication state
 * @returns Authentication state and user data
 */
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  const isAuthenticated = authStatus === 'authenticated';
  const isUnauthenticated = authStatus === 'unauthenticated';
  const isLoading = authStatus === 'idle' || isHydrating;

  return {
    user,
    authStatus,
    isAuthenticated,
    isUnauthenticated,
    isLoading,
    isHydrating,
  };
};

/**
 * Hook for getting current user data
 * @returns Current user or null
 */
export const useCurrentUser = (): AuthUser | null => {
  return useAuthStore((state) => state.user);
};

/**
 * Hook for checking if user has a specific role
 * @param role - Role to check
 * @returns True if user has the role
 */
export const useHasRole = (role: string): boolean => {
  const user = useAuthStore((state) => state.user);
  return user?.role === role;
};

/**
 * Hook for checking if user is approved
 * @returns True if user is approved
 */
export const useIsApproved = (): boolean => {
  const user = useAuthStore((state) => state.user);

  if (!user) return false;

  const isApproved = user.is_approved;

  // Handle different types of approval flags
  if (typeof isApproved === 'boolean') {
    return isApproved;
  }

  if (typeof isApproved === 'number') {
    return isApproved === 1;
  }

  if (typeof isApproved === 'string') {
    const normalized = isApproved.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'evet';
  }

  return false;
};
