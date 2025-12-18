/**
 * @file usePushNotifications.ts
 * @description React hook for push notifications
 * 
 * Usage:
 * - Call in App.tsx to initialize push notifications
 * - Automatically registers device token on mount
 * - Handles notification received and tapped events
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useEffect, useRef } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { pushNotificationService } from '@/api/services/pushNotification.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { errorLogger } from '@/utils/errorLogger';
import type { RootNavigationParamList } from '@/navigation/types';

export const usePushNotifications = () => {
  const navigation = useNavigation<NavigationProp<RootNavigationParamList>>();
  const { isAuthenticated } = useAuth();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // Only register if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    // Register device token
    pushNotificationService.registerDeviceToken().catch((error) => {
      errorLogger.logError(error, {
        context: 'usePushNotifications - registerDeviceToken',
      });
    });

    // Listen for notifications received while app is in foreground
    notificationListener.current =
      pushNotificationService.addNotificationReceivedListener(
        (notification) => {
          console.log('Notification received:', notification);
          // You can show in-app notification here if needed
        }
      );

    // Listen for notification tapped by user
    responseListener.current =
      pushNotificationService.addNotificationResponseReceivedListener(
        (response) => {
          console.log('Notification tapped:', response);
          handleNotificationTapped(response);
        }
      );

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        try {
          Notifications.removeNotificationSubscription(
            notificationListener.current
          );
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      if (responseListener.current) {
        try {
          Notifications.removeNotificationSubscription(responseListener.current);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  /**
   * Handle notification tapped - navigate to relevant screen
   */
  const handleNotificationTapped = (
    response: any
  ) => {
    try {
      const data = response.notification.request.content.data;

      // Navigate based on notification type
      if (data?.type === 'application_status' && data?.applicationId) {
        navigation.navigate('Applications');
      } else if (data?.type === 'new_job' && data?.jobId) {
        navigation.navigate('JobsTab', {
          screen: 'JobDetail',
          params: { id: data.jobId },
        });
      } else if (data?.type === 'message') {
        navigation.navigate('Notifications');
      } else {
        // Default: navigate to notifications
        navigation.navigate('Notifications');
      }
    } catch (error) {
      errorLogger.logError(error as Error, {
        context: 'handleNotificationTapped',
      });
    }
  };

  return {
    requestPermissions: pushNotificationService.requestPermissions,
    getBadgeCount: pushNotificationService.getBadgeCount,
    setBadgeCount: pushNotificationService.setBadgeCount,
    clearBadge: pushNotificationService.clearBadge,
  };
};
