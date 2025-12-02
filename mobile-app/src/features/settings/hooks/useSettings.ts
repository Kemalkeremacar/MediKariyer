import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { SettingsData, SettingsUpdatePayload, AccountAction } from '../types';

/**
 * Hook for managing user settings
 * Provides functionality for updating preferences and account actions
 */
export const useSettings = () => {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
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
      
      setSettings((prev) => ({
        ...prev,
        ...payload,
      }));

      Alert.alert('Başarılı', 'Ayarlarınız güncellendi.');
    } catch (error) {
      Alert.alert('Hata', 'Ayarlar güncellenirken bir hata oluştu.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle logout with confirmation
   */
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabından çıkmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            logoutMutation.mutate();
          },
        },
      ],
    );
  }, [logoutMutation]);

  /**
   * Handle account actions (freeze or delete)
   */
  const handleAccountAction = useCallback((action: AccountAction) => {
    const isDelete = action === 'delete';
    
    Alert.alert(
      isDelete ? 'Hesabı Sil' : 'Hesabı Dondur',
      isDelete 
        ? 'Bu işlem geri alınamaz. Tüm verilerin kalıcı olarak silinecek.'
        : 'Hesabını dondurduğunda profil görünmez olacak.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: isDelete ? 'Sil' : 'Dondur',
          style: isDelete ? 'destructive' : 'default',
          onPress: async () => {
            setIsLoading(true);
            try {
              // TODO: Implement API call for account action
              // await settingsService.performAccountAction(action);
              
              Alert.alert(
                'Bilgi', 
                `Hesap ${isDelete ? 'silme' : 'dondurma'} özelliği yakında eklenecek.`
              );
            } catch (error) {
              Alert.alert('Hata', 'İşlem gerçekleştirilemedi.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  }, []);

  /**
   * Navigate to a settings section
   */
  const navigateToSection = useCallback((section: string) => {
    // TODO: Implement navigation to specific settings sections
    Alert.alert('Bilgi', `${section} sayfası yakında eklenecek.`);
  }, []);

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
