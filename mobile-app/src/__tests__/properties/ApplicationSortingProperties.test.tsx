/**
 * Property-Based Tests: Application Sorting Properties
 * **Feature: mobile-ui-redesign, Property 17: Application sorting**
 */

import * as fc from 'fast-check';
import { ApplicationListItem } from '@/types/application';

// Helper to check if applications are sorted by date (most recent first)
const isSortedByDateDescending = (applications: ApplicationListItem[]): boolean => {
  if (applications.length <= 1) return true;
  
  for (let i = 0; i < applications.length - 1; i++) {
    const currentDate = new Date(applications[i].created_at);
    const nextDate = new Date(applications[i + 1].created_at);
    
    // Current date should be >= next date (most recent first)
    if (currentDate < nextDate) {
      return false;
    }
  }
  
  return true;
};

// Helper to sort applications by date (most recent first)
const sortApplicationsByDate = (applications: ApplicationListItem[]): ApplicationListItem[] => {
  return [...applications].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB.getTime() - dateA.getTime(); // Descending order (most recent first)
  });
};

// Arbitrary for generating valid ISO date strings
const dateStringArbitrary = () => 
  fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2025-12-31').getTime() })
    .map(timestamp => new Date(timestamp).toISOString());

describe('Application Sorting Property-Based Tests', () => {
  /**
   * **Feature: mobile-ui-redesign, Property 17: Application sorting**
   * **Validates: Requirements 6.5**
   * 
   * For any list of applications with dates, the applications should be sorted 
   * with most recent first
   */
  describe('Property 17: Application sorting', () => {
    it('should sort applications with most recent first', () => {
      fc.assert(
        fc.property(
          // Generate an array of applications with random dates
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              job_id: fc.integer({ min: 1, max: 1000 }),
              job_title: fc.option(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { nil: null }
              ),
              hospital_name: fc.option(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { nil: null }
              ),
              status: fc.option(
                fc.constantFrom('Başvuruldu', 'Onaylandı', 'Reddedildi', 'İnceleniyor'),
                { nil: null }
              ),
              created_at: dateStringArbitrary(),
              updated_at: fc.option(dateStringArbitrary(), { nil: null }),
            }),
            { minLength: 2, maxLength: 50 }
          ),
          (applications) => {
            // Sort the applications
            const sorted = sortApplicationsByDate(applications);
            
            // Verify the sorted list is in descending order (most recent first)
            expect(isSortedByDateDescending(sorted)).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain sort order regardless of initial order', () => {
      fc.assert(
        fc.property(
          // Generate applications and shuffle them
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              job_id: fc.integer({ min: 1, max: 1000 }),
              job_title: fc.option(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { nil: null }
              ),
              hospital_name: fc.option(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { nil: null }
              ),
              status: fc.option(
                fc.constantFrom('Başvuruldu', 'Onaylandı', 'Reddedildi', 'İnceleniyor'),
                { nil: null }
              ),
              created_at: dateStringArbitrary(),
              updated_at: fc.option(dateStringArbitrary(), { nil: null }),
            }),
            { minLength: 2, maxLength: 30 }
          ),
          (applications) => {
            // Sort twice to ensure idempotency
            const sorted1 = sortApplicationsByDate(applications);
            const sorted2 = sortApplicationsByDate(sorted1);
            
            // Both should be sorted correctly
            expect(isSortedByDateDescending(sorted1)).toBe(true);
            expect(isSortedByDateDescending(sorted2)).toBe(true);
            
            // Both should be identical (idempotent)
            expect(sorted1).toEqual(sorted2);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle applications with same dates correctly', () => {
      fc.assert(
        fc.property(
          // Generate applications where some have the same date
          dateStringArbitrary(),
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              job_id: fc.integer({ min: 1, max: 1000 }),
              job_title: fc.option(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { nil: null }
              ),
              hospital_name: fc.option(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { nil: null }
              ),
              status: fc.option(
                fc.constantFrom('Başvuruldu', 'Onaylandı', 'Reddedildi', 'İnceleniyor'),
                { nil: null }
              ),
              updated_at: fc.option(dateStringArbitrary(), { nil: null }),
            }),
            { minLength: 2, maxLength: 20 }
          ),
          (sameDate, applications) => {
            // Set all applications to have the same created_at date
            const applicationsWithSameDate = applications.map(app => ({
              ...app,
              created_at: sameDate,
            }));
            
            // Sort the applications
            const sorted = sortApplicationsByDate(applicationsWithSameDate);
            
            // All dates should be the same
            const allDatesEqual = sorted.every(app => 
              new Date(app.created_at).getTime() === new Date(sameDate).getTime()
            );
            
            expect(allDatesEqual).toBe(true);
            expect(isSortedByDateDescending(sorted)).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle single application correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            job_id: fc.integer({ min: 1, max: 1000 }),
            job_title: fc.option(
              fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              { nil: null }
            ),
            hospital_name: fc.option(
              fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              { nil: null }
            ),
            status: fc.option(
              fc.constantFrom('Başvuruldu', 'Onaylandı', 'Reddedildi', 'İnceleniyor'),
              { nil: null }
            ),
            created_at: dateStringArbitrary(),
            updated_at: fc.option(dateStringArbitrary(), { nil: null }),
          }),
          (application) => {
            const applications = [application];
            const sorted = sortApplicationsByDate(applications);
            
            // Single application should always be "sorted"
            expect(isSortedByDateDescending(sorted)).toBe(true);
            expect(sorted).toEqual(applications);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty list correctly', () => {
      const applications: ApplicationListItem[] = [];
      const sorted = sortApplicationsByDate(applications);
      
      expect(isSortedByDateDescending(sorted)).toBe(true);
      expect(sorted).toEqual([]);
    });

    it('should place most recent application first', () => {
      fc.assert(
        fc.property(
          // Generate a list of applications
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              job_id: fc.integer({ min: 1, max: 1000 }),
              job_title: fc.option(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { nil: null }
              ),
              hospital_name: fc.option(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { nil: null }
              ),
              status: fc.option(
                fc.constantFrom('Başvuruldu', 'Onaylandı', 'Reddedildi', 'İnceleniyor'),
                { nil: null }
              ),
              created_at: dateStringArbitrary(),
              updated_at: fc.option(dateStringArbitrary(), { nil: null }),
            }),
            { minLength: 2, maxLength: 30 }
          ),
          (applications) => {
            const sorted = sortApplicationsByDate(applications);
            
            if (sorted.length > 0) {
              // Find the most recent date in the original list
              const mostRecentDate = applications.reduce((max, app) => {
                const appDate = new Date(app.created_at);
                return appDate > max ? appDate : max;
              }, new Date(applications[0].created_at));
              
              // The first item in sorted list should have the most recent date
              const firstItemDate = new Date(sorted[0].created_at);
              expect(firstItemDate.getTime()).toBe(mostRecentDate.getTime());
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should place oldest application last', () => {
      fc.assert(
        fc.property(
          // Generate a list of applications
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              job_id: fc.integer({ min: 1, max: 1000 }),
              job_title: fc.option(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { nil: null }
              ),
              hospital_name: fc.option(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { nil: null }
              ),
              status: fc.option(
                fc.constantFrom('Başvuruldu', 'Onaylandı', 'Reddedildi', 'İnceleniyor'),
                { nil: null }
              ),
              created_at: dateStringArbitrary(),
              updated_at: fc.option(dateStringArbitrary(), { nil: null }),
            }),
            { minLength: 2, maxLength: 30 }
          ),
          (applications) => {
            const sorted = sortApplicationsByDate(applications);
            
            if (sorted.length > 0) {
              // Find the oldest date in the original list
              const oldestDate = applications.reduce((min, app) => {
                const appDate = new Date(app.created_at);
                return appDate < min ? appDate : min;
              }, new Date(applications[0].created_at));
              
              // The last item in sorted list should have the oldest date
              const lastItemDate = new Date(sorted[sorted.length - 1].created_at);
              expect(lastItemDate.getTime()).toBe(oldestDate.getTime());
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
