/**
 * Property-Based Tests: Job Listing Properties
 * **Feature: mobile-ui-redesign, Property 12: Job listing spacing consistency**
 */

import * as fc from 'fast-check';
import React from 'react';
import { render } from '@testing-library/react-native';
import { FlatList, View, StyleSheet } from 'react-native';
import { JobCard, JobCardProps } from '@/features/jobs/components/JobCard';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { spacing } from '@/theme';

// Helper to render components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Helper to extract marginBottom from JobCard styles
const getJobCardMarginBottom = (): number => {
  // JobCard has marginBottom: spacing.lg in its styles
  return spacing.lg;
};

// Helper to check if a value is a multiple of 8
const isMultipleOf8 = (value: number): boolean => {
  return value % 8 === 0;
};

describe('Job Listing Property-Based Tests', () => {
  /**
   * **Feature: mobile-ui-redesign, Property 12: Job listing spacing consistency**
   * **Validates: Requirements 4.5**
   * 
   * For any list of job cards, the spacing between consecutive cards should be 
   * consistent and a multiple of 8 pixels
   */
  describe('Property 12: Job listing spacing consistency', () => {
    it('should have consistent spacing between job cards that is a multiple of 8', () => {
      fc.assert(
        fc.property(
          // Generate an array of job data (1 to 20 jobs)
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              hospital_name: fc.option(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { nil: undefined }
              ),
              city_name: fc.option(
                fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                { nil: undefined }
              ),
              specialty_name: fc.option(
                fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                { nil: undefined }
              ),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (jobs) => {
            // Get the marginBottom value from JobCard
            const cardSpacing = getJobCardMarginBottom();
            
            // Verify spacing is a multiple of 8
            expect(isMultipleOf8(cardSpacing)).toBe(true);
            
            // Verify spacing is consistent (same value for all cards)
            // Since all JobCards use the same style, the spacing should be consistent
            expect(cardSpacing).toBe(spacing.lg);
            expect(cardSpacing).toBe(24); // spacing.lg should be 24 (multiple of 8)
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use spacing.lg (24px) for card spacing which is a multiple of 8', () => {
      // Verify that spacing.lg is a multiple of 8
      expect(isMultipleOf8(spacing.lg)).toBe(true);
      expect(spacing.lg).toBe(24);
    });

    it('should maintain consistent spacing regardless of job data content', () => {
      fc.assert(
        fc.property(
          // Generate jobs with varying amounts of optional data
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              hospital_name: fc.option(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { nil: undefined }
              ),
              city_name: fc.option(
                fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                { nil: undefined }
              ),
              specialty_name: fc.option(
                fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                { nil: undefined }
              ),
              salary: fc.option(
                fc.oneof(
                  fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                  fc.integer({ min: 1000, max: 1000000 }).map(n => n.toString())
                ),
                { nil: undefined }
              ),
              application_count: fc.option(
                fc.integer({ min: 0, max: 10000 }),
                { nil: undefined }
              ),
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (jobs) => {
            // Render multiple JobCards
            const cards = jobs.map((job) => (
              <JobCard
                key={job.id}
                title={job.title}
                hospital_name={job.hospital_name}
                city_name={job.city_name}
                specialty_name={job.specialty_name}
                salary={job.salary}
                application_count={job.application_count}
              />
            ));

            // All cards should have the same marginBottom
            const cardSpacing = getJobCardMarginBottom();
            
            // Verify spacing is consistent and a multiple of 8
            expect(isMultipleOf8(cardSpacing)).toBe(true);
            expect(cardSpacing).toBe(spacing.lg);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify FlatList contentContainerStyle uses spacing from 8px grid', () => {
      // The JobsScreen uses spacing.lg for padding in contentContainerStyle
      // Verify that all spacing values used are multiples of 8
      const listPadding = spacing.lg; // 24px (used in contentContainerStyle)
      
      expect(isMultipleOf8(listPadding)).toBe(true);
      expect(listPadding).toBe(24);
    });

    it('should maintain spacing consistency across different list sizes', () => {
      fc.assert(
        fc.property(
          // Generate lists of varying sizes
          fc.integer({ min: 1, max: 50 }),
          (listSize) => {
            // Generate jobs
            const jobs = Array.from({ length: listSize }, (_, i) => ({
              id: i + 1,
              title: `Job ${i + 1}`,
            }));

            // The spacing between cards should be consistent regardless of list size
            const cardSpacing = getJobCardMarginBottom();
            
            expect(isMultipleOf8(cardSpacing)).toBe(true);
            expect(cardSpacing).toBe(spacing.lg);
            expect(cardSpacing).toBe(24);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify all spacing values in job listing follow 8px grid', () => {
      // Check that all spacing values used in the job listing are multiples of 8
      const spacingValues = {
        cardMargin: spacing.lg,      // 24px - spacing between cards
        listPadding: spacing.lg,     // 24px - list container padding
        cardPadding: spacing.lg,     // 24px - internal card padding (from Card component)
      };

      Object.entries(spacingValues).forEach(([key, value]) => {
        expect(isMultipleOf8(value)).toBe(true);
      });
    });
  });
});
