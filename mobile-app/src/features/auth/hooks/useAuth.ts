/**
 * @file useAuth.ts
 * @description Kimlik doğrulama durumu ve yardımcı fonksiyonlar hook'u
 * 
 * Bu hook auth store'dan kimlik doğrulama durumunu ve kullanıcı bilgilerini sağlar.
 * Tüm ekranlarda kullanıcı durumunu kontrol etmek için kullanılır.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useAuthStore } from '@/store/authStore';
import type { AuthUser } from '@/types/auth';

/**
 * Kimlik doğrulama durumu hook'u
 * 
 * **Dönen Değerler:**
 * - user: Mevcut kullanıcı bilgileri
 * - authStatus: Kimlik doğrulama durumu (idle/authenticated/unauthenticated)
 * - isAuthenticated: Kullanıcı giriş yapmış mı?
 * - isUnauthenticated: Kullanıcı giriş yapmamış mı?
 * - isLoading: Yükleme durumu
 * - isHydrating: Store hydration durumu
 * 
 * **Kullanım:**
 * ```tsx
 * const { isAuthenticated, user } = useAuth();
 * if (isAuthenticated) {
 *   console.log('Hoşgeldin', user?.name);
 * }
 * ```
 * 
 * @returns Kimlik doğrulama durumu ve kullanıcı bilgileri
 */
export const useAuth = () => {
  // Auth store'dan state değerlerini al
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  // Türetilmiş durumlar - Kolay kullanım için boolean flag'ler
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
 * Mevcut kullanıcı bilgilerini getir
 * 
 * **Kullanım:**
 * ```tsx
 * const user = useCurrentUser();
 * if (user) {
 *   console.log('Kullanıcı ID:', user.id);
 * }
 * ```
 * 
 * @returns Mevcut kullanıcı veya null
 */
export const useCurrentUser = (): AuthUser | null => {
  return useAuthStore((state) => state.user);
};

/**
 * Kullanıcının belirli bir role sahip olup olmadığını kontrol et
 * 
 * **Kullanım:**
 * ```tsx
 * const isAdmin = useHasRole('admin');
 * if (isAdmin) {
 *   // Admin özelliklerini göster
 * }
 * ```
 * 
 * @param role - Kontrol edilecek rol (örn: 'admin', 'doctor')
 * @returns Kullanıcı bu role sahipse true
 */
export const useHasRole = (role: string): boolean => {
  const user = useAuthStore((state) => state.user);
  return user?.role === role;
};

/**
 * Kullanıcının onaylı olup olmadığını kontrol et
 * 
 * **ÖNEMLİ:** Backend'den farklı tiplerde onay flag'i gelebilir:
 * - boolean: true/false
 * - number: 1/0
 * - string: '1'/'0', 'true'/'false', 'evet'/'hayır'
 * 
 * Bu fonksiyon tüm tipleri normalize ederek kontrol eder.
 * 
 * **Kullanım:**
 * ```tsx
 * const isApproved = useIsApproved();
 * if (!isApproved) {
 *   navigation.navigate('PendingApproval');
 * }
 * ```
 * 
 * @returns Kullanıcı onaylıysa true
 */
export const useIsApproved = (): boolean => {
  const user = useAuthStore((state) => state.user);

  // Kullanıcı yoksa onaylı değil
  if (!user) return false;

  const isApproved = user.is_approved;

  // Boolean tip kontrolü
  if (typeof isApproved === 'boolean') {
    return isApproved;
  }

  // Number tip kontrolü (1 = onaylı, 0 = onaysız)
  if (typeof isApproved === 'number') {
    return isApproved === 1;
  }

  // String tip kontrolü - Normalize et ve kontrol et
  if (typeof isApproved === 'string') {
    const normalized = isApproved.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'evet';
  }

  // Bilinmeyen tip - Güvenli tarafta kal, onaysız say
  return false;
};
