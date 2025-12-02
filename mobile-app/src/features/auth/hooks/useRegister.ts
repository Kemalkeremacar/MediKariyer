import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { DoctorRegistrationPayload, DoctorRegistrationResponse } from '../types';

type UseRegisterOptions = Omit<
  UseMutationOptions<DoctorRegistrationResponse, Error, DoctorRegistrationPayload>,
  'mutationFn'
>;

/**
 * Hook for doctor registration functionality
 * Handles registration submission
 */
export const useRegister = (options?: UseRegisterOptions) => {
  return useMutation({
    mutationFn: async (data: DoctorRegistrationPayload) => {
      const response = await authService.registerDoctor(data);
      return response;
    },
    ...options,
  });
};
