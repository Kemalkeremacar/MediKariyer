/**
 * Property-Based Tests: Application Card Properties
 * **Feature: mobile-ui-redesign, Property 15: Application card completeness**
 */

import * as fc from 'fast-check';
import React from 'react';
import { render } from '@testing-library/react-native';
import { ApplicationCard, ApplicationCardProps } from '@/features/applications/components/ApplicationCard';
import { BadgeStatus } from '@/components/ui/Badge';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Helper to render components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Application Card Property-Based Tests', () => {
  /**
   * **Feature: mobile-ui-redesign, Property 15: Application card completeness**
   * **Validates: Requirements 6.2**
   * 
   * For any application data, the ApplicationCard should display 
   * hospital name, position, status badge, and date
   */
  describe('Property 15: Application card completeness', () => {
    it('should render all required fields when hospitalName, position, status, and date are provided', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary non-empty strings for required fields
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.constantFrom<BadgeStatus>('pending', 'accepted', 'rejected', 'reviewed'),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (hospitalName, position, status, statusLabel, date) => {
            const props: ApplicationCardProps = {
              hospitalName,
              position,
              status,
              statusLabel,
              date,
            };

            const container = renderWithTheme(<ApplicationCard {...props} />);
            const { getByText } = container;

            // Verify all four required fields are rendered
            expect(getByText(hospitalName)).toBeTruthy();
            expect(getByText(position)).toBeTruthy();
            expect(getByText(statusLabel)).toBeTruthy();
            expect(getByText(date)).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render hospital name when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (hospitalName) => {
            const props: ApplicationCardProps = {
              hospitalName,
              position: 'Test Position',
              status: 'pending',
              statusLabel: 'Beklemede',
              date: '2024-01-01',
            };

            const { getByText } = renderWithTheme(<ApplicationCard {...props} />);
            expect(getByText(hospitalName)).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render position when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (position) => {
            const props: ApplicationCardProps = {
              hospitalName: 'Test Hospital',
              position,
              status: 'pending',
              statusLabel: 'Beklemede',
              date: '2024-01-01',
            };

            const { getByText } = renderWithTheme(<ApplicationCard {...props} />);
            expect(getByText(position)).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render status badge when provided', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<BadgeStatus>('pending', 'accepted', 'rejected', 'reviewed'),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (status, statusLabel) => {
            const props: ApplicationCardProps = {
              hospitalName: 'Test Hospital',
              position: 'Test Position',
              status,
              statusLabel,
              date: '2024-01-01',
            };

            const { getByText } = renderWithTheme(<ApplicationCard {...props} />);
            expect(getByText(statusLabel)).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render date when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (date) => {
            const props: ApplicationCardProps = {
              hospitalName: 'Test Hospital',
              position: 'Test Position',
              status: 'pending',
              statusLabel: 'Beklemede',
              date,
            };

            const { getByText } = renderWithTheme(<ApplicationCard {...props} />);
            expect(getByText(date)).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render all fields when complete application data is provided', () => {
      fc.assert(
        fc.property(
          fc.record({
            hospitalName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            position: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            status: fc.constantFrom<BadgeStatus>('pending', 'accepted', 'rejected', 'reviewed'),
            statusLabel: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            date: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          }),
          (applicationData) => {
            const props: ApplicationCardProps = {
              ...applicationData,
            };

            const container = renderWithTheme(<ApplicationCard {...props} />);
            const { getByText } = container;

            // Verify all fields are present
            expect(getByText(applicationData.hospitalName)).toBeTruthy();
            expect(getByText(applicationData.position)).toBeTruthy();
            expect(getByText(applicationData.statusLabel)).toBeTruthy();
            expect(getByText(applicationData.date)).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle all status types correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<BadgeStatus>('pending', 'accepted', 'rejected', 'reviewed'),
          (status) => {
            const statusLabels: Record<BadgeStatus, string> = {
              pending: 'Beklemede',
              accepted: 'Kabul Edildi',
              rejected: 'Reddedildi',
              reviewed: 'İnceleniyor',
            };

            const props: ApplicationCardProps = {
              hospitalName: 'Test Hospital',
              position: 'Test Position',
              status,
              statusLabel: statusLabels[status],
              date: '2024-01-01',
            };

            const container = renderWithTheme(<ApplicationCard {...props} />);
            const { getByText } = container;

            // Verify the status label is rendered
            expect(getByText(statusLabels[status])).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render without crashing for any valid application data', () => {
      fc.assert(
        fc.property(
          fc.record({
            hospitalName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            position: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            status: fc.constantFrom<BadgeStatus>('pending', 'accepted', 'rejected', 'reviewed'),
            statusLabel: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            date: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          }),
          (applicationData) => {
            const props: ApplicationCardProps = {
              ...applicationData,
            };

            const container = renderWithTheme(<ApplicationCard {...props} />);
            
            // Component should render without crashing
            expect(container).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
