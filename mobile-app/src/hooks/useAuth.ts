/**
 * useAuth Hook
 * Re-exports from the auth feature for backward compatibility
 * @deprecated Import directly from '@/features/auth' instead
 */

export {
  useAuth,
  useLogin,
  useRegister,
  useLogout,
  useCurrentUser,
  useHasRole,
  useIsApproved,
} from '@/features/auth';
