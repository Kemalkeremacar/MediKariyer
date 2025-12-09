import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { authService } from '@/api/services/authService';
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
      console.log('🔵 useRegister: mutationFn called');
      try {
        const response = await authService.registerDoctor(data);
        console.log('✅ useRegister: registration successful');
        return response;
      } catch (error) {
        console.log('❌ useRegister: registration error:', error);
        throw error;
      }
    },
    ...options,
  });
};
