import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { authService } from '@/api/services/authService';
import { devLog } from '@/utils/devLogger';
import type { DoctorRegistrationPayload, DoctorRegistrationResponse } from '@/types/auth';

type UseRegisterOptions = Omit<
  UseMutationOptions<DoctorRegistrationResponse, Error, DoctorRegistrationPayload>,
  'mutationFn'
>;

/**
 * Hook for doctor registration
 */
export const useRegister = (options?: UseRegisterOptions) => {
  return useMutation({
    mutationFn: async (data: DoctorRegistrationPayload) => {
      devLog.log('🔵 useRegister: mutationFn called');
      try {
        const response = await authService.registerDoctor(data);
        devLog.log('✅ useRegister: registration successful');
        return response;
      } catch (error) {
        devLog.log('❌ useRegister: registration error:', error);
        throw error;
      }
    },
    ...options,
  });
};
