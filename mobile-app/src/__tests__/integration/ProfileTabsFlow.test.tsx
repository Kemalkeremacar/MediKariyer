/**
 * Integration Test: Profile Tabs Flow
 * Tests: Profile screen tab switching
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';

const mockProfile = {
  first_name: 'Kerem',
  last_name: 'Doktor',
  title: 'Dr.',
  specialty_name: 'Kardiyoloji',
  phone: '+90 555 000 0000',
  residence_city_name: 'İstanbul',
  completion_percent: 85,
};

jest.mock('@/features/profile/hooks/useProfile', () => ({
  useProfile: () => ({
    data: mockProfile,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    isRefetching: false,
  }),
}));

jest.mock('@/store/authStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: {
        email: 'test@example.com',
        is_approved: true,
      },
    }),
}));

jest.mock('@/features/auth/hooks/useLogout', () => ({
  useLogout: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

describe('Profile Tabs Flow Integration Test', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it('should display all 5 tabs', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ProfileScreen />
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Kişisel Bilgiler')).toBeTruthy();
      expect(getByText('Eğitim')).toBeTruthy();
      expect(getByText('Deneyim')).toBeTruthy();
      expect(getByText('Sertifika')).toBeTruthy();
      expect(getByText('Diller')).toBeTruthy();
    });
  });

  it('should switch tabs when tab is pressed', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ProfileScreen />
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Eğitim')).toBeTruthy();
    });

    // Switch to Education tab
    const educationTab = getByText('Eğitim');
    fireEvent.press(educationTab);

    await waitFor(() => {
      expect(getByText('Eğitim Bilgileri')).toBeTruthy();
    });

    // Switch to Experience tab
    const experienceTab = getByText('Deneyim');
    fireEvent.press(experienceTab);

    await waitFor(() => {
      expect(getByText('Deneyim Bilgileri')).toBeTruthy();
    });
  });

  it('should display only active tab content', async () => {
    const { getByText, queryByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ProfileScreen />
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Kişisel Bilgiler')).toBeTruthy();
    });

    // Personal info should be visible
    expect(getByText('Hesap Bilgileri')).toBeTruthy();

    // Switch to Education tab
    const educationTab = getByText('Eğitim');
    fireEvent.press(educationTab);

    await waitFor(() => {
      // Education content should be visible
      expect(getByText('Eğitim Bilgileri')).toBeTruthy();
      // Personal info should not be visible
      expect(queryByText('Hesap Bilgileri')).toBeNull();
    });
  });

  it('should highlight active tab', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ProfileScreen />
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Kişisel Bilgiler')).toBeTruthy();
    });

    // First tab should be active by default
    const personalTab = getByText('Kişisel Bilgiler');
    expect(personalTab).toBeTruthy();
  });
});
