/**
 * Accessibility Test: Screen Reader Labels
 * Tests: Accessibility labels for interactive elements
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';
import { JobCard } from '@/features/jobs/components/JobCard';
import { ApplicationCard } from '@/features/applications/components/ApplicationCard';

// Mock theme
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: { 600: '#2563eb', 50: '#eff6ff', 100: '#dbeafe' },
        secondary: { 600: '#0d9488', 100: '#ccfbf1' },
        success: { 600: '#16a34a', 100: '#dcfce7' },
        warning: { 600: '#d97706', 100: '#fef3c7' },
        error: { 600: '#dc2626', 100: '#fee2e2' },
        neutral: { 100: '#f1f5f9' },
        text: { inverse: '#ffffff', secondary: '#6b7280', primary: '#111827', disabled: '#d1d5db' },
        background: { primary: '#ffffff', secondary: '#f8fafc' },
        border: { light: '#e5e7eb' },
      },
      spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
      borderRadius: { md: 8, lg: 12, xl: 16 },
      typography: {
        fontSize: { sm: 14, base: 16, lg: 18 },
        fontWeight: { semibold: '600', medium: '500' },
      },
      shadows: {
        md: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
        },
      },
    },
  }),
}));

describe('Screen Reader Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should have accessible label', () => {
      const { getByText } = render(
        <Button variant="primary" size="md" label="Başvur" onPress={() => {}} />
      );

      const button = getByText('Başvur');
      expect(button).toBeTruthy();
    });

    it('should indicate loading state', () => {
      const { UNSAFE_root } = render(
        <Button
          variant="primary"
          size="md"
          label="Yükleniyor"
          loading
          onPress={() => {}}
        />
      );

      // ActivityIndicator should be present when loading
      const activityIndicator = UNSAFE_root.findAllByType('ActivityIndicator' as any);
      expect(activityIndicator.length).toBeGreaterThan(0);
    });
  });

  describe('JobCard Component', () => {
    it('should have accessible content', () => {
      const { getByText } = render(
        <JobCard
          title="Kardiyoloji Uzmanı"
          hospital_name="Acıbadem"
          city_name="İstanbul"
          specialty_name="Kardiyoloji"
          onPress={() => {}}
        />
      );

      expect(getByText('Acıbadem')).toBeTruthy();
      expect(getByText('Kardiyoloji')).toBeTruthy();
      expect(getByText(/İstanbul/)).toBeTruthy();
    });
  });

  describe('ApplicationCard Component', () => {
    it('should have accessible status information', () => {
      const { getByText } = render(
        <ApplicationCard
          hospitalName="Medical Park"
          position="Ortopedi"
          status="accepted"
          statusLabel="Onaylandı"
          date="15.12.2024"
          onPress={() => {}}
        />
      );

      expect(getByText('Medical Park')).toBeTruthy();
      expect(getByText('Ortopedi')).toBeTruthy();
      expect(getByText('Onaylandı')).toBeTruthy();
      expect(getByText('15.12.2024')).toBeTruthy();
    });
  });
});
