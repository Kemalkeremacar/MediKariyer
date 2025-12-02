import { create } from 'zustand';
import { NotificationItem } from '@/types/notification';

interface NotificationState {
  unreadCount: number;
  notifications: NotificationItem[];
  setUnreadCount: (count: number) => void;
  addNotification: (notification: NotificationItem) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  setNotifications: (notifications: NotificationItem[]) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  notifications: [],
  setUnreadCount: (count) =>
    set({
      unreadCount: count,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.is_read ? state.unreadCount : state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (!notification || notification.is_read) {
        return state;
      }
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    }),
  clearNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));
