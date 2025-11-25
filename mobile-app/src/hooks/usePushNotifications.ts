import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { notificationService } from '@/api/services/notification.service';
import { useAuthStore } from '@/store/authStore';
import { navigate, navigationRef } from '@/navigation/navigationRef';

let notificationHandlerRegistered = false;

const configureNotificationHandler = () => {
  if (notificationHandlerRegistered) {
    return;
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    }),
  });
  notificationHandlerRegistered = true;
};

const getDeviceIdentifier = async () => {
  if (Platform.OS === 'ios' && Application.getIosIdForVendorAsync) {
    const iosId = await Application.getIosIdForVendorAsync();
    if (iosId) {
      return iosId;
    }
  }

  if (Platform.OS === 'android' && Application.androidId) {
    return Application.androidId;
  }

  return `${Platform.OS}-${Device.modelName ?? 'unknown'}-${Application.applicationId}`;
};

const getProjectId = () => {
  const easProjectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

  if (!easProjectId) {
    console.warn(
      'Expo projectId bulunamadı. app.json içinde "extra.eas.projectId" tanımladığınızdan emin olun.',
    );
  }

  return easProjectId;
};

const requestPermissionsAsync = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return existingStatus;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
};

const SUPPORTED_SCREENS = ['Dashboard', 'Jobs', 'Applications', 'Notifications', 'Profile'] as const;

const handleNotificationNavigation = (data: Record<string, unknown> | null | undefined) => {
  if (!data || typeof data !== 'object') {
    return;
  }
  const screen = (data.screen as string) ?? undefined;
  const params = (data.params as Record<string, unknown>) ?? undefined;
  if (!screen) {
    return;
  }
  if (!SUPPORTED_SCREENS.includes(screen as any)) {
    console.warn(`Desteklenmeyen hedef ekran: ${screen}`);
    return;
  }
  if (!navigationRef.isReady()) {
    console.warn('Navigation hazır değil, bildirim yönlendirmesi ertelendi.');
    return;
  }
  navigate(screen as any, params as any);
};

export const usePushNotifications = () => {
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);
  const hasRegisteredRef = useRef(false);
  const notificationReceivedListener = useRef<{ remove?: () => void } | null>(null);
  const notificationResponseListener = useRef<{ remove?: () => void } | null>(null);

  useEffect(() => {
    configureNotificationHandler();

    notificationReceivedListener.current = Notifications.addNotificationReceivedListener(
      (notification: any) => {
        console.log('📩 Notification received:', notification.request.content.title);
      },
    );
    notificationResponseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        console.log('👉 Notification response:', response.notification.request.content.data);
        handleNotificationNavigation(response.notification.request.content.data as Record<string, unknown>);
      },
    );

    return () => {
      if (notificationReceivedListener.current) {
        Notifications.removeNotificationSubscription(
          notificationReceivedListener.current as any,
        );
        notificationReceivedListener.current = null;
      }
      if (notificationResponseListener.current) {
        Notifications.removeNotificationSubscription(
          notificationResponseListener.current as any,
        );
        notificationResponseListener.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !user || user.role !== 'doctor') {
      hasRegisteredRef.current = false;
      return;
    }

    if (hasRegisteredRef.current) {
      return;
    }

    const registerDeviceToken = async () => {
      try {
        if (!Device.isDevice) {
          console.warn('Push bildirimleri fiziksel bir cihazda test edilmelidir.');
          return;
        }

        const permissionStatus = await requestPermissionsAsync();
        if (permissionStatus !== 'granted') {
          Alert.alert(
            'Bildirim izni gerekli',
            'Push bildirimleri almak için bildirim izni vermeniz gerekir.',
          );
          return;
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Varsayılan',
            importance: Notifications.AndroidImportance.MAX,
          });
        }

        const projectId = getProjectId();
        const tokenResponse = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        );
        const expoPushToken =
          typeof tokenResponse === 'string' ? tokenResponse : tokenResponse.data;

        if (!expoPushToken) {
          console.warn('Expo push token alınamadı.');
          return;
        }

        const deviceId = await getDeviceIdentifier();
        const appVersion =
          Application.nativeApplicationVersion ?? Application.nativeBuildVersion ?? 'dev';

        await notificationService.registerDeviceToken({
          expo_push_token: expoPushToken,
          device_id: deviceId,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
          app_version: appVersion,
        });

        hasRegisteredRef.current = true;
      } catch (error) {
        console.warn('Push token kaydedilemedi:', error);
      }
    };

    registerDeviceToken();
  }, [authStatus, user?.id, user?.role]);
};

