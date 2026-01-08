/**
 * Generic CRUD Mutation Hook
 * TD-003: Profile CRUD hook'larındaki tekrar eden pattern'i ortadan kaldırır
 * 
 * Kullanım:
 * const educationMutation = useCRUDMutation({
 *   entityName: 'Eğitim bilgisi',
 *   queryKey: ['profile', 'educations'],
 *   endpoint: '/doctor/educations',
 *   service: {
 *     create: profileService.createEducation,
 *     update: profileService.updateEducation,
 *     delete: profileService.deleteEducation,
 *   },
 * });
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlertHelpers } from '@/utils/alertHelpers';
import { handleApiError } from '@/utils/errorHandler';

/**
 * CRUD servis metodları için interface
 */
export interface CRUDService<TCreate, TUpdate, TItem> {
  create: (data: TCreate) => Promise<TItem>;
  update: (id: number, data: TUpdate) => Promise<TItem>;
  delete: (id: number) => Promise<void>;
}

/**
 * CRUD hook konfigürasyonu
 * ARCH-003: queryKey artık readonly tuple tipinde
 */
export interface CRUDConfig<TCreate, TUpdate, TItem> {
  /** Entity'nin Türkçe adı (alert mesajlarında kullanılır) */
  entityName: string;
  /** React Query cache key */
  queryKey: readonly unknown[];
  /** API endpoint (error logging için) */
  endpoint: string;
  /** CRUD servis metodları */
  service: CRUDService<TCreate, TUpdate, TItem>;
  /** Opsiyonel: Ek invalidate edilecek query key'ler */
  additionalInvalidateKeys?: readonly unknown[][];
}

/**
 * CRUD mutation sonuçları
 */
export interface CRUDMutationResult<TCreate, TUpdate, TItem> {
  create: ReturnType<typeof useMutation<TItem, Error, TCreate>>;
  update: ReturnType<typeof useMutation<TItem, Error, { id: number; data: TUpdate }>>;
  delete: ReturnType<typeof useMutation<void, Error, number>>;
}

/**
 * Generic CRUD Mutation Hook
 * Create, Update, Delete işlemleri için standart pattern sağlar
 */
export function useCRUDMutation<TCreate, TUpdate, TItem>(
  config: CRUDConfig<TCreate, TUpdate, TItem>
): CRUDMutationResult<TCreate, TUpdate, TItem> {
  const queryClient = useQueryClient();
  const alert = useAlertHelpers();
  const { entityName, queryKey, endpoint, service, additionalInvalidateKeys = [] } = config;

  // Sadece kendi cache key'ini invalidate et (Domain-Driven Design)
  // Global invalidate yapma - her domain kendi cache'ini yönetir
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: queryKey as unknown[] });
    additionalInvalidateKeys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key as unknown[] });
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: TCreate) => service.create(data),
    onSuccess: () => {
      invalidateQueries();
      alert.success(`${entityName} eklendi`);
    },
    onError: (error: Error) => {
      const message = handleApiError(error, endpoint);
      alert.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TUpdate }) => service.update(id, data),
    onSuccess: () => {
      invalidateQueries();
      alert.success(`${entityName} güncellendi`);
    },
    onError: (error: Error) => {
      const message = handleApiError(error, endpoint);
      alert.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => service.delete(id),
    onSuccess: () => {
      invalidateQueries();
      alert.success(`${entityName} silindi`);
    },
    onError: (error: Error) => {
      const message = handleApiError(error, endpoint);
      alert.error(message);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
}
