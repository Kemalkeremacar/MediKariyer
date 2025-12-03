/**
 * Integration Test: Theme Switching Flow
 * Tests: Theme switching across all screens
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { JobsScreen } from '@/features/jobs/screens/JobsScreen';
import { ApplicationsScreen } from '@/features/applications/screens/ApplicationsScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
}));

// Mock auth store
jest.mock('@/store/authStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: {
        first_name: 'Kerem',
        email: 'test@example.com',
        is_approved: true,
      },
    }),
}));

// Mock dashboard hook
jest.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: () => ({
    data: {
      stats: { profile_completion_percent: 85 },
      recommended_jobs: [{ id: 1, title: 'Test Job' }],
      recent_applications: [{ id: 1, hospital_name: 'Test Hospital' }],
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    isRefetching: false,
  }),
}));

// Mock jobs hook
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useInfiniteQuery: () => ({
    data: {
      pages: [
        {
          data: [
            {
              id: 1,
              title: 'Kardiyoloji Uzmanı',
              hospital_name: 'Acıbadem',
              city_name: 'İstanbul',
              specialty: 'Kardiyoloji',
              is_applied: false,
            },
          ],
          pagination: { current_page: 1, total_pages: 1 },
        },
      ],
    },
    isLoading: false,
    isError: false,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: jest.fn(),
    isRefetching: false,
  }),
}));

// Mock applications hook
jest.mock('@/features/applications/hooks/useApplications', () => ({
  useApplications: () => ({
    data: {
      pages: [
        {
          data: [
            {
              id: 1,
              hospital_name: 'Acıbadem',
              job_title: 'Kardiyoloji',
              status: 'Başvuruldu',
              created_at: '2024-01-15',
            },
          ],
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isRefetching: false,
  }),
}));

// Mock notifications hook
jest.mock('@/features/notifications/hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [
      {
        id: 1,
        title: 'Test Notification',
        body: 'Test body',
        type: 'info',
        is_read: false,
        created_at: '2024-01-15T10:00:00Z',
        data: null,
      },
    ],
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

// Mock profile hook
jest.mock('@/features/profile/hooks/useProfile', () => ({
  useProfile: () => ({
    data: {
      first_name: 'Kerem',
      last_name: 'Doktor',
      title: 'Dr.',
      specialty_name: 'Kardiyoloji',
      phone: '+90 555 000 0000',
      residence_city_name: 'İstanbul',
      completion_percent: 85,
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    isRefetching: false,
  }),
}));

// Mock logout hook
jest.mock('@/features/auth/hooks/useLogout', () => ({
  useLogout: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

// Mock lookup service
jest.mock('@/api/services/lookup.service', () => ({
  lookupService: {
    getApplicationStatuses: jest.fn(() =>
      Promise.resolve(['Başvuruldu', 'Onaylandı', 'Reddedildi'])
    ),
  },
}));

// Mock mark as read hook
jest.mock('@/features/notifications/hooks/useMarkAsRead', () => ({
  useMarkAsRead: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

// Test component that uses theme and provides a toggle button
const ThemeTestWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return (
    <View>
      {children}
      <TouchableOpacity testID="theme-toggle" onPress={toggleTheme}>
        <Text>Toggle Theme</Text>
      </TouchableOpacity>
      <Text testID="theme-mode">{isDark ? 'dark' : 'light'}</Text>
      <Text testID="theme-bg-color">{theme.colors.background.primary}</Text>
    </View>
  );
};

describe('Theme Switching Flow Integration Test', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    jest.clearAllMocks();
  });

  it('should switch theme on Dashboard screen', async () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ThemeTestWrapper>
              <DashboardScreen />
            </ThemeTestWrapper>
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    // Wait for screen to load
    await waitFor(() => {
      expect(getByText(/Hoş geldin/)).toBeTruthy();
    });

    // Check initial theme is light
    const initialMode = getByTestId('theme-mode').props.children;
    expect(initialMode).toBe('light');

    // Toggle theme
    const toggleButton = getByTestId('theme-toggle');
    fireEvent.press(toggleButton);

    // Wait for theme to change
    await waitFor(() => {
      const newMode = getByTestId('theme-mode').props.children;
      expect(newMode).toBe('dark');
    });

    // Verify AsyncStorage was called to persist theme
    expect(mockAsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should switch theme on Jobs screen', async () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ThemeTestWrapper>
              <JobsScreen />
            </ThemeTestWrapper>
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    // Wait for screen to load
    await waitFor(() => {
      expect(getByText('İş İlanları')).toBeTruthy();
    });

    // Check initial theme
    const initialBgColor = getByTestId('theme-bg-color').props.children;
    expect(initialBgColor).toBeTruthy();

    // Toggle theme
    const toggleButton = getByTestId('theme-toggle');
    fireEvent.press(toggleButton);

    // Wait for theme to change
    await waitFor(() => {
      const newBgColor = getByTestId('theme-bg-color').props.children;
      expect(newBgColor).not.toBe(initialBgColor);
    });
  });

  it('should switch theme on Applications screen', async () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ThemeTestWrapper>
              <ApplicationsScreen />
            </ThemeTestWrapper>
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    // Wait for screen to load
    await waitFor(() => {
      expect(getByText('Acıbadem')).toBeTruthy();
    });

    // Toggle theme
    const toggleButton = getByTestId('theme-toggle');
    fireEvent.press(toggleButton);

    // Verify theme changed
    await waitFor(() => {
      const newMode = getByTestId('theme-mode').props.children;
      expect(newMode).toBe('dark');
    });
  });

  it('should switch theme on Notifications screen', async () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ThemeTestWrapper>
              <NotificationsScreen />
            </ThemeTestWrapper>
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    // Wait for screen to load
    await waitFor(() => {
      expect(getByText('Test body')).toBeTruthy();
    });

    // Toggle theme
    const toggleButton = getByTestId('theme-toggle');
    fireEvent.press(toggleButton);

    // Verify theme changed
    await waitFor(() => {
      const newMode = getByTestId('theme-mode').props.children;
      expect(newMode).toBe('dark');
    });
  });

  it('should switch theme on Profile screen', async () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ThemeTestWrapper>
              <ProfileScreen />
            </ThemeTestWrapper>
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    // Wait for screen to load
    await waitFor(() => {
      expect(getByText('Kişisel Bilgiler')).toBeTruthy();
    });

    // Toggle theme
    const toggleButton = getByTestId('theme-toggle');
    fireEvent.press(toggleButton);

    // Verify theme changed
    await waitFor(() => {
      const newMode = getByTestId('theme-mode').props.children;
      expect(newMode).toBe('dark');
    });
  });

  it('should persist theme preference across app restarts', async () => {
    // Simulate saved theme preference
    mockAsyncStorage.getItem.mockResolvedValue('dark');

    const { getByTestId } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ThemeTestWrapper>
              <DashboardScreen />
            </ThemeTestWrapper>
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    // Wait for theme to load from storage
    await waitFor(() => {
      const mode = getByTestId('theme-mode').props.children;
      expect(mode).toBe('dark');
    });

    // Verify AsyncStorage was queried
    expect(mockAsyncStorage.getItem).toHaveBeenCalled();
  });

  it('should toggle between light and dark modes multiple times', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ThemeTestWrapper>
              <DashboardScreen />
            </ThemeTestWrapper>
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    const toggleButton = getByTestId('theme-toggle');

    // Initial state should be light
    expect(getByTestId('theme-mode').props.children).toBe('light');

    // Toggle to dark
    fireEvent.press(toggleButton);
    await waitFor(() => {
      expect(getByTestId('theme-mode').props.children).toBe('dark');
    });

    // Toggle back to light
    fireEvent.press(toggleButton);
    await waitFor(() => {
      expect(getByTestId('theme-mode').props.children).toBe('light');
    });

    // Toggle to dark again
    fireEvent.press(toggleButton);
    await waitFor(() => {
      expect(getByTestId('theme-mode').props.children).toBe('dark');
    });
  });
});
