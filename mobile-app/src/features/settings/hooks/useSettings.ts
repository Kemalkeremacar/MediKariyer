import { useState, useCallback } from 'react';
import { useAlertHelpers } from '@/utils/alertHelpers';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/features/auth/hooks/useLogout';

type AccountAction = 'freeze' | 'delete';

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface SettingsData {
  notifications: NotificationSettings;
  language: string;
  theme: string;
}

interface SettingsUpdatePayload {
  notifications?: Partial<NotificationSettings>;
  language?: string;
  theme?: string;
}

/**
 * Hook for managing user settings
 * Provides functionality for updating preferences and account actions
 */
export const useSettings = () => {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const alert = useAlertHelpers();
  const [isLoading, setIsLoading] = useState(false);

  // Default settings - in a real app, these would be fetched from the API
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    language: 'tr',
    theme: 'system',
  });

  /**
   * Update user settings
   */
  const updateSettings = useCallback(async (payload: SettingsUpdatePayload) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to update settings
      // await settingsService.updateSettings(payload);
      
      setSettings((prev: SettingsData): SettingsData => ({
        notifications: payload.notifications 
          ? { ...prev.notifications, ...payload.notifications }
          : prev.notifications,
        language: payload.language ?? prev.language,
        theme: payload.theme ?? prev.theme,
      }));

      alert.success('Ayarlarınız güncellendi.');
    } catch (error) {
      alert.error('Ayarlar güncellenirken bir hata oluştu.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [alert]);

  /**
   * Handle logout with confirmation
   */
  const handleLogout = useCallback(() => {
    alert.confirmDestructive(
      'Çıkış Yap',
      'Hesabından çıkmak istediğine emin misin?',
      () => logoutMutation.mutate(),
      undefined,
      'Çıkış Yap'
    );
  }, [logoutMutation, alert]);

  /**
   * Handle account actions (freeze or delete)
   */
  const handleAccountAction = useCallback((action: AccountAction) => {
    const isDelete = action === 'delete';
    
    alert.confirmDestructive(
      isDelete ? 'Hesabı Sil' : 'Hesabı Dondur',
      isDelete 
        ? 'Bu işlem geri alınamaz. Tüm verilerin kalıcı olarak silinecek.'
        : 'Hesabını dondurduğunda profil görünmez olacak.',
      async () => {
        setIsLoading(true);
        try {
          // TODO: Implement API call for account action
          // await settingsService.performAccountAction(action);
          
          alert.info(`Hesap ${isDelete ? 'silme' : 'dondurma'} özelliği yakında eklenecek.`);
        } catch (error) {
          alert.error('İşlem gerçekleştirilemedi.');
        } finally {
          setIsLoading(false);
        }
      },
      undefined,
      isDelete ? 'Sil' : 'Dondur'
    );
  }, [alert]);

  /**
   * Navigate to a settings section
   */
  const navigateToSection = useCallback((section: string) => {
    // TODO: Implement navigation to specific settings sections
    alert.info(`${section} sayfası yakında eklenecek.`);
  }, [alert]);

  return {
    user,
    settings,
    isLoading,
    updateSettings,
    handleLogout,
    handleAccountAction,
    navigateToSection,
  };
};
