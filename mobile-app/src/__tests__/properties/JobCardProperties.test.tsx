/**
 * Property-Based Tests: Job Card Properties
 * **Feature: mobile-ui-redesign, Property 10: Job card completeness**
 * **Feature: mobile-ui-redesign, Property 11: Job card optional fields**
 */

import * as fc from 'fast-check';
import React from 'react';
import { render } from '@testing-library/react-native';
import { JobCard, JobCardProps } from '@/features/jobs/components/JobCard';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Helper to render components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Helper to check if city is rendered (city is rendered with 📍 prefix)
const isCityRendered = (container: ReturnType<typeof render>, cityName: string) => {
  const { queryByText } = container;
  // City is rendered as "📍 {cityName}" in a single Text element
  const cityText = `📍 ${cityName}`;
  return queryByText(cityText) !== null;
};

describe('Job Card Property-Based Tests', () => {
  /**
   * **Feature: mobile-ui-redesign, Property 10: Job card completeness**
   * **Validates: Requirements 4.2**
   * 
   * For any job data with hospital name, department, and city, 
   * the JobCard should render all three fields
   */
  describe('Property 10: Job card completeness', () => {
    it('should render all required fields when hospital_name, specialty_name, and city_name are provided', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary non-empty strings for required fields
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (title, hospitalName, specialtyName, cityName) => {
            const props: JobCardProps = {
              title,
              hospital_name: hospitalName,
              specialty_name: specialtyName,
              city_name: cityName,
            };

            const container = renderWithTheme(<JobCard {...props} />);
            const { queryAllByText } = container;

            // Verify all three required fields are rendered
            // Use queryAllByText to handle cases where multiple fields have the same value
            const hospitalElements = queryAllByText(hospitalName);
            expect(hospitalElements.length).toBeGreaterThan(0);
            
            const specialtyElements = queryAllByText(specialtyName);
            expect(specialtyElements.length).toBeGreaterThan(0);
            
            // City is rendered with an icon prefix
            expect(isCityRendered(container, cityName)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render hospital_name when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (hospitalName) => {
            const props: JobCardProps = {
              title: 'Test Job',
              hospital_name: hospitalName,
            };

            const { getByText } = renderWithTheme(<JobCard {...props} />);
            expect(getByText(hospitalName)).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render specialty_name or title when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.option(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), { nil: undefined }),
          (title, specialtyName) => {
            const props: JobCardProps = {
              title,
              specialty_name: specialtyName,
            };

            const { getByText } = renderWithTheme(<JobCard {...props} />);
            
            // Should render specialty_name if provided, otherwise title
            const expectedText = specialtyName || title;
            expect(getByText(expectedText)).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render city_name when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (cityName) => {
            const props: JobCardProps = {
              title: 'Test Job',
              city_name: cityName,
            };

            const container = renderWithTheme(<JobCard {...props} />);
            
            // City is rendered with an icon prefix (📍)
            expect(isCityRendered(container, cityName)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle missing optional fields gracefully', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (title) => {
            const props: JobCardProps = {
              title,
              // All optional fields are undefined
            };

            const { getByText } = renderWithTheme(<JobCard {...props} />);
            
            // Should at least render the title
            expect(getByText(title)).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render all fields when complete job data is provided', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            hospital_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            specialty_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            city_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          }),
          (jobData) => {
            const props: JobCardProps = {
              ...jobData,
            };

            const container = renderWithTheme(<JobCard {...props} />);
            const { queryAllByText } = container;

            // Verify all fields are present
            // Use queryAllByText to handle cases where multiple fields have the same value
            const hospitalElements = queryAllByText(jobData.hospital_name);
            expect(hospitalElements.length).toBeGreaterThan(0);
            
            const specialtyElements = queryAllByText(jobData.specialty_name);
            expect(specialtyElements.length).toBeGreaterThan(0);
            
            // City is rendered with an icon prefix
            expect(isCityRendered(container, jobData.city_name)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: mobile-ui-redesign, Property 11: Job card optional fields**
   * **Validates: Requirements 4.3**
   * 
   * For any job data, if salary or application count is present, it should be displayed; 
   * if absent, it should not be displayed
   */
  describe('Property 11: Job card optional fields', () => {
    it('should display salary when present and not display when absent', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.option(
            fc.oneof(
              fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              fc.integer({ min: 1000, max: 1000000 }).map(n => n.toString())
            ),
            { nil: undefined }
          ),
          (title, salary) => {
            const props: JobCardProps = {
              title,
              salary,
            };

            const container = renderWithTheme(<JobCard {...props} />);
            const { queryByText } = container;

            if (salary !== undefined) {
              // Salary should be displayed with 💰 prefix
              const salaryText = `💰 ${salary}`;
              expect(queryByText(salaryText)).toBeTruthy();
            } else {
              // Salary should not be displayed - check that no 💰 icon is present
              const allText = container.UNSAFE_getAllByType(require('react-native').Text);
              const hasSalaryIcon = allText.some((textElement: any) => {
                const text = textElement.props.children;
                return typeof text === 'string' && text.includes('💰');
              });
              expect(hasSalaryIcon).toBe(false);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display application count when present and not display when absent', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
          (title, applicationCount) => {
            const props: JobCardProps = {
              title,
              application_count: applicationCount,
            };

            const container = renderWithTheme(<JobCard {...props} />);
            const { queryByText } = container;

            if (applicationCount !== undefined) {
              // Application count should be displayed with 👥 prefix
              const countText = `👥 ${applicationCount} başvuru`;
              expect(queryByText(countText)).toBeTruthy();
            } else {
              // Application count should not be displayed - check that no 👥 icon is present
              const allText = container.UNSAFE_getAllByType(require('react-native').Text);
              const hasCountIcon = allText.some((textElement: any) => {
                const text = textElement.props.children;
                return typeof text === 'string' && text.includes('👥');
              });
              expect(hasCountIcon).toBe(false);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle both optional fields independently', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.option(
            fc.oneof(
              fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              fc.integer({ min: 1000, max: 1000000 }).map(n => n.toString())
            ),
            { nil: undefined }
          ),
          fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
          (title, salary, applicationCount) => {
            const props: JobCardProps = {
              title,
              salary,
              application_count: applicationCount,
            };

            const container = renderWithTheme(<JobCard {...props} />);
            const { queryByText } = container;

            // Check salary display
            if (salary !== undefined) {
              const salaryText = `💰 ${salary}`;
              expect(queryByText(salaryText)).toBeTruthy();
            }

            // Check application count display
            if (applicationCount !== undefined) {
              const countText = `👥 ${applicationCount} başvuru`;
              expect(queryByText(countText)).toBeTruthy();
            }

            // If both are undefined, neither should be displayed
            if (salary === undefined && applicationCount === undefined) {
              const allText = container.UNSAFE_getAllByType(require('react-native').Text);
              const hasSalaryIcon = allText.some((textElement: any) => {
                const text = textElement.props.children;
                return typeof text === 'string' && text.includes('💰');
              });
              const hasCountIcon = allText.some((textElement: any) => {
                const text = textElement.props.children;
                return typeof text === 'string' && text.includes('👥');
              });
              expect(hasSalaryIcon).toBe(false);
              expect(hasCountIcon).toBe(false);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render correctly with all combinations of optional fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            salary: fc.option(
              fc.oneof(
                fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                fc.integer({ min: 1000, max: 1000000 }).map(n => n.toString())
              ),
              { nil: undefined }
            ),
            application_count: fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
          }),
          (jobData) => {
            const props: JobCardProps = {
              ...jobData,
            };

            const container = renderWithTheme(<JobCard {...props} />);
            
            // Component should render without crashing regardless of optional field presence
            expect(container).toBeTruthy();
            
            // Title should always be present
            expect(container.queryByText(jobData.title)).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
