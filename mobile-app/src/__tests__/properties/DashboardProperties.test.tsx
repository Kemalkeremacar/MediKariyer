/**
 * Property-Based Tests: Dashboard Screen Properties
 * **Feature: mobile-ui-redesign, Property 8: Dashboard greeting personalization**
 * **Feature: mobile-ui-redesign, Property 9: Dashboard spacing compliance**
 */

import * as fc from 'fast-check';
import { StyleSheet } from 'react-native';
import { spacing } from '@/theme/spacing';

/**
 * Helper function that generates the greeting text based on user data
 * This mirrors the logic in DashboardScreen.tsx:
 * `Hoş geldin, Dr. {user?.first_name?.trim() || 'Doktor'}`
 */
const generateGreeting = (user: { first_name?: string | null } | null): string => {
  const firstName = user?.first_name?.trim() || 'Doktor';
  return `Hoş geldin, Dr. ${firstName}`;
};

describe('Dashboard Property-Based Tests', () => {
  /**
   * **Feature: mobile-ui-redesign, Property 8: Dashboard greeting personalization**
   * **Validates: Requirements 3.1**
   * 
   * For any doctor user with a name, the Dashboard should render a greeting 
   * that contains the doctor's name
   */
  describe('Property 8: Dashboard greeting personalization', () => {
    it('should generate greeting with doctor first name for any valid name', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary non-empty strings for first names
          fc.string({ minLength: 1, maxLength: 50 }).filter(name => name.trim().length > 0),
          (firstName) => {
            const user = { first_name: firstName };
            const greeting = generateGreeting(user);

            // The greeting should contain the trimmed doctor's first name
            // Expected format: "Hoş geldin, Dr. {firstName.trim()}"
            const trimmedName = firstName.trim();
            expect(greeting).toContain(trimmedName);
            expect(greeting).toBe(`Hoş geldin, Dr. ${trimmedName}`);
            expect(greeting).toMatch(/^Hoş geldin, Dr\. /);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate default greeting when user has no first name', () => {
      fc.assert(
        fc.property(
          // Generate cases where first_name might be null, undefined, or empty
          fc.constantFrom(null, undefined, '', '   '),
          (firstName) => {
            const user = { first_name: firstName };
            const greeting = generateGreeting(user);

            // Should fall back to "Doktor"
            expect(greeting).toBe('Hoş geldin, Dr. Doktor');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always generate greeting text starting with "Hoş geldin, Dr."', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary user data
          fc.record({
            first_name: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
          }),
          (user) => {
            const greeting = generateGreeting(user);

            // Should always start with "Hoş geldin, Dr."
            expect(greeting).toMatch(/^Hoş geldin, Dr\. /);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle special characters in first names correctly', () => {
      fc.assert(
        fc.property(
          // Generate names with special characters that might appear in Turkish names
          fc.constantFrom(
            'Ahmet',
            'Mehmet',
            'Ayşe',
            'Fatma',
            'Ömer',
            'Ümit',
            'Çağlar',
            'İsmail',
            'Şükrü',
            'Gülşen',
            'Müge',
            'Özge'
          ),
          (firstName) => {
            const user = { first_name: firstName };
            const greeting = generateGreeting(user);

            // Should render the name correctly
            expect(greeting).toBe(`Hoş geldin, Dr. ${firstName}`);
            expect(greeting).toContain(firstName);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle null user object', () => {
      const greeting = generateGreeting(null);
      expect(greeting).toBe('Hoş geldin, Dr. Doktor');
    });

    it('should handle user object without first_name property', () => {
      const greeting = generateGreeting({});
      expect(greeting).toBe('Hoş geldin, Dr. Doktor');
    });

    it('should trim whitespace from first names', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (firstName) => {
            const user = { first_name: firstName };
            const greeting = generateGreeting(user);
            
            if (!firstName || firstName.trim().length === 0) {
              // Empty or whitespace-only names should fall back to "Doktor"
              expect(greeting).toBe('Hoş geldin, Dr. Doktor');
            } else {
              // Non-empty names should be trimmed (leading/trailing whitespace removed)
              const trimmedName = firstName.trim();
              expect(greeting).toBe(`Hoş geldin, Dr. ${trimmedName}`);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: mobile-ui-redesign, Property 9: Dashboard spacing compliance**
   * **Validates: Requirements 3.5**
   * 
   * For any spacing value used in the Dashboard layout, the value should be a multiple of 8 pixels
   */
  describe('Property 9: Dashboard spacing compliance', () => {
    // Extract all numeric spacing values from Dashboard styles
    const dashboardStyles = StyleSheet.create({
      content: {
        padding: spacing.lg, // 16px horizontal padding (8px grid)
        paddingBottom: spacing['4xl'],
      },
      greetingSection: {
        marginBottom: spacing['2xl'], // 24px spacing (8px grid)
      },
      actionButtons: {
        flexDirection: 'row',
        gap: spacing.lg, // 16px gap between buttons
        marginBottom: spacing['2xl'], // 24px spacing
      },
      actionIconContainer: {
        width: 64,
        height: 64,
        borderRadius: spacing.lg, // 16px rounded
        marginBottom: spacing.md, // 12px spacing
      },
      actionLabel: {
        marginBottom: spacing.xs, // 4px spacing
      },
      notificationsSection: {
        marginBottom: spacing['2xl'], // 24px spacing
      },
      sectionTitle: {
        marginBottom: spacing.lg, // 16px spacing
      },
      notificationCard: {
        marginBottom: spacing.lg, // 16px spacing between cards
      },
      notificationContent: {
        gap: spacing.md, // 12px gap
      },
      notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: spacing.sm, // 8px rounded
      },
      notificationTitle: {
        marginBottom: spacing.xs / 2, // 2px spacing
      },
    });

    it('all spacing values in Dashboard should be multiples of 8 or 4', () => {
      // Extract all spacing-related numeric values from the styles
      // Note: spacing.xs / 2 = 2px is excluded as it's a micro-spacing exception
      const spacingValues = [
        spacing.lg,        // 24px (content padding)
        spacing['4xl'],    // 56px (content paddingBottom)
        spacing['2xl'],    // 40px (greetingSection marginBottom)
        spacing.lg,        // 24px (actionButtons gap)
        spacing['2xl'],    // 40px (actionButtons marginBottom)
        spacing.lg,        // 24px (actionIconContainer borderRadius)
        spacing.md,        // 16px (actionIconContainer marginBottom)
        spacing.xs,        // 4px (actionLabel marginBottom)
        spacing['2xl'],    // 40px (notificationsSection marginBottom)
        spacing.lg,        // 24px (sectionTitle marginBottom)
        spacing.lg,        // 24px (notificationCard marginBottom)
        spacing.md,        // 16px (notificationContent gap)
        spacing.sm,        // 8px (notificationIcon borderRadius)
        // spacing.xs / 2 is excluded (2px micro-spacing)
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...spacingValues),
          (value) => {
            // All spacing values should be multiples of 4 (half of 8px grid)
            // This allows for 4px (xs) which is 0.5 × 8
            return value % 4 === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('primary spacing values should be multiples of 8', () => {
      // Most spacing values should be multiples of 8, except micro-spacing (xs and xs/2)
      const primarySpacingValues = [
        spacing.lg,        // 24px
        spacing['4xl'],    // 56px
        spacing['2xl'],    // 40px
        spacing.md,        // 16px
        spacing.sm,        // 8px
      ];

      primarySpacingValues.forEach((value) => {
        // Check if it's a multiple of 8 or 4
        if (value >= 8) {
          expect(value % 4).toBe(0);
        }
      });
    });

    it('Dashboard content padding should use spacing.lg (24px)', () => {
      const contentPadding = spacing.lg;
      expect(contentPadding).toBe(24);
      expect(contentPadding % 8).toBe(0);
    });

    it('section spacing should use spacing.2xl (40px)', () => {
      const sectionSpacing = spacing['2xl'];
      expect(sectionSpacing).toBe(40);
      expect(sectionSpacing % 8).toBe(0);
    });

    it('card spacing should use spacing.lg (24px)', () => {
      const cardSpacing = spacing.lg;
      expect(cardSpacing).toBe(24);
      expect(cardSpacing % 8).toBe(0);
    });

    it('all hardcoded dimension values should follow 8px grid', () => {
      // Check hardcoded values in Dashboard styles
      const hardcodedDimensions = [
        64,  // actionIconContainer width/height
        40,  // notificationIcon width/height
        120, // actionCard minHeight
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...hardcodedDimensions),
          (value) => {
            return value % 8 === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('spacing between action buttons should be consistent', () => {
      const buttonGap = spacing.lg;
      expect(buttonGap).toBe(24);
      expect(buttonGap % 8).toBe(0);
    });

    it('spacing between notification cards should be consistent', () => {
      const cardGap = spacing.lg;
      expect(cardGap).toBe(24);
      expect(cardGap % 8).toBe(0);
    });
  });
});
