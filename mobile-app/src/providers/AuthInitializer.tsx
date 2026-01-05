/**
 * @file AuthInitializer.tsx
 * @description Authentication initialization provider
 * 
 * Features:
 * - Initializes auth state on app startup (useAuthInitialization)
 * - Monitors app state for active session checks (useAppState)
 * 
 * CRITICAL: Only uses /api/mobile/* endpoints
 * 
 * @author MediKariyer Development Team
 * @version 3.0.0
 * @since 2024
 */

import { useAuthInitialization } from '@/hooks/useAuthInitialization';
import { useAppState } from '@/hooks/useAppState';

export const AuthInitializer = () => {
  // Initialize auth on app startup
  useAuthInitialization();
  
  // Monitor app state for active session checks
  useAppState();
  
  return null;
};

