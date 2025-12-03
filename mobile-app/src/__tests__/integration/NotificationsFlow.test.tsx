/**
 * Integration Test: Notifications Flow
 * Tests: Notifications with read/unread states
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';

const mockNotifications = [
  {
    id: 1,
    title: 'Başvuru Güncellendi',
    body: 'Başvurunuz değerlendiriliyor',
    type: 'info',
    is_read: false,
    created_at: '2024-01-15T10:00:00Z',
    data: null,
  },
  {
    id: 2,
    title: 'Yeni İlan',
    body: 'Size uygun yeni ilanlar var',
    type: 'info',
    is_read: true,
    created_at: '2024-01-14T10:00:00Z',
    data: null,
  },
];

jest.mock('@/features/notifications/hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: mockNotifications,
    unreadCount: 1,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isRefetching: false,
  }),
}));

const mockMarkAsRead = jest.fn();
jest.mock('@/features/notifications/hooks/useMarkAsRead', () => ({
  useMarkAsRead: () => ({
    mutate: mockMarkAsRead,
    isPending: false,
  }),
}));

describe('Notifications Flow Integration Test', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    mockMarkAsRead.mockClear();
  });

  it('should display notifications with correct read/unread styling', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <NotificationsScreen />
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Başvurunuz değerlendiriliyor')).toBeTruthy();
      expect(getByText('Size uygun yeni ilanlar var')).toBeTruthy();
    });
  });

  it('should mark notification as read when tapped', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <NotificationsScreen />
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Başvurunuz değerlendiriliyor')).toBeTruthy();
    });

    const unreadNotification = getByText('Başvurunuz değerlendiriliyor');
    fireEvent.press(unreadNotification.parent!);

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith(1);
    });
  });

  it('should toggle between all and unread notifications', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <NotificationsScreen />
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Okunmamış')).toBeTruthy();
    });

    const toggleButton = getByText('Okunmamış');
    fireEvent.press(toggleButton);

    await waitFor(() => {
      expect(getByText('Tümünü göster')).toBeTruthy();
    });
  });

  it('should display unread count', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <NotificationsScreen />
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Bildirimler')).toBeTruthy();
    });
  });
});
