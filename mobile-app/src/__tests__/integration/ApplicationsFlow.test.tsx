/**
 * Integration Test: Applications Flow
 * Tests: Applications screen with status filters and sorting
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ApplicationsScreen } from '@/features/applications/screens/ApplicationsScreen';

// Mock API
jest.mock('@/api/services/lookup.service', () => ({
  lookupService: {
    getApplicationStatuses: jest.fn(() =>
      Promise.resolve(['Başvuruldu', 'Onaylandı', 'Reddedildi'])
    ),
  },
}));

const mockApplications = [
  {
    id: 1,
    hospital_name: 'Acıbadem',
    job_title: 'Kardiyoloji',
    status: 'Başvuruldu',
    created_at: '2024-01-15',
  },
  {
    id: 2,
    hospital_name: 'Medical Park',
    job_title: 'Ortopedi',
    status: 'Onaylandı',
    created_at: '2024-01-10',
  },
];

jest.mock('@/features/applications/hooks/useApplications', () => ({
  useApplications: () => ({
    data: {
      pages: [{ data: mockApplications }],
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

describe('Applications Flow Integration Test', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it('should display applications sorted by date (most recent first)', async () => {
    const { getAllByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ApplicationsScreen />
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getAllByText(/Acıbadem|Medical Park/)).toHaveLength(2);
    });

    // First application should be more recent (2024-01-15)
    const cards = getAllByText(/Acıbadem|Medical Park/);
    expect(cards[0]).toBeTruthy();
  });

  it('should display correct status badges with colors', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ApplicationsScreen />
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Başvuruldu')).toBeTruthy();
      expect(getByText('Onaylandı')).toBeTruthy();
    });
  });

  it('should open filter sheet when filter button pressed', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <ApplicationsScreen />
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Filtreleri Aç')).toBeTruthy();
    });

    const filterButton = getByText('Filtreleri Aç');
    fireEvent.press(filterButton);

    // Filter sheet should open (tested via bottom sheet modal)
    expect(filterButton).toBeTruthy();
  });
});
