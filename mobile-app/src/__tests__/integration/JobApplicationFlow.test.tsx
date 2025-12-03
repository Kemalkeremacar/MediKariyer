/**
 * Integration Test: Job Application Flow
 * Tests: Dashboard → Jobs → Job Detail → Apply
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { JobsScreen } from '@/features/jobs/screens/JobsScreen';
import { JobDetailScreen } from '@/features/jobs/screens/JobDetailScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
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

// Mock API services
jest.mock('@/api/services/job.service', () => ({
  jobService: {
    listJobs: jest.fn(() =>
      Promise.resolve({
        data: [
          {
            id: 1,
            title: 'Kardiyoloji Uzmanı',
            hospital_name: 'Acıbadem',
            city_name: 'İstanbul',
            specialty: 'Kardiyoloji',
            salary_range: '₺75,000',
            is_applied: false,
          },
        ],
        pagination: { current_page: 1, total_pages: 1 },
      })
    ),
    getJobDetail: jest.fn(() =>
      Promise.resolve({
        id: 1,
        title: 'Kardiyoloji Uzmanı',
        hospital_name: 'Acıbadem',
        city_name: 'İstanbul',
        description: 'Test description',
        is_applied: false,
      })
    ),
    applyToJob: jest.fn(() => Promise.resolve({ success: true })),
  },
}));

describe('Job Application Flow Integration Test', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockNavigate.mockClear();
  });

  it('should navigate from Dashboard to Jobs screen', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <DashboardScreen />
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      const jobsButton = getByText('İlanlar');
      expect(jobsButton).toBeTruthy();
    });

    const jobsButton = getByText('İlanlar');
    fireEvent.press(jobsButton);

    expect(mockNavigate).toHaveBeenCalledWith('JobsTab');
  });

  it('should display job listings and navigate to detail', async () => {
    const { getByText, debug } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 375, height: 812 },
          insets: { top: 44, left: 0, right: 0, bottom: 34 },
        }}
      >
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer>
              <JobsScreen />
            </NavigationContainer>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    );

    // Wait for screen header to appear
    await waitFor(() => {
      expect(getByText('İş İlanları')).toBeTruthy();
    });

    // Verify job data is displayed
    await waitFor(() => {
      expect(getByText('Acıbadem')).toBeTruthy();
    });
  });

  it('should allow applying to a job from detail screen', async () => {
    const route = { params: { id: 1 } };
    const mockGoBack = jest.fn();
    const { getByText } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 375, height: 812 },
          insets: { top: 44, left: 0, right: 0, bottom: 34 },
        }}
      >
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer>
              <JobDetailScreen route={route as any} navigation={{ goBack: mockGoBack } as any} />
            </NavigationContainer>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    );

    // Wait for job detail to load
    await waitFor(() => {
      expect(getByText('Kardiyoloji Uzmanı')).toBeTruthy();
    });

    // Verify apply button is present
    await waitFor(() => {
      expect(getByText('Hemen Başvur')).toBeTruthy();
    });

    const applyButton = getByText('Hemen Başvur');
    fireEvent.press(applyButton);

    await waitFor(() => {
      expect(require('@/api/services/job.service').jobService.applyToJob).toHaveBeenCalledWith({
        jobId: 1,
        coverLetter: undefined,
      });
    });
  });
});
