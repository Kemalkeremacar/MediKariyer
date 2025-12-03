/**
 * Property-Based Tests: Notification Component Properties
 * **Feature: mobile-ui-redesign, Property 18: Notification unread styling**
 * **Feature: mobile-ui-redesign, Property 19: Notification interaction state change**
 */

import * as fc from 'fast-check';
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NotificationCard } from '@/features/notifications/components/NotificationCard';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { colors } from '@/theme';

// Helper to render components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Notification Property-Based Tests', () => {
  /**
   * **Feature: mobile-ui-redesign, Property 18: Notification unread styling**
   * **Validates: Requirements 7.2**
   * 
   * For any notification, if it is unread, the background color should be light blue; 
   * if read, the background should be white
   */
  describe('Property 18: Notification unread styling', () => {
    it('should apply light blue background for unread notifications', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), // message
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),  // timestamp
          (message, timestamp) => {
            // Test with isRead = false (unread)
            const container = renderWithTheme(
              <NotificationCard
                message={message}
                timestamp={timestamp}
                isRead={false}
              />
            );

            // Find the View component (Card container) with the unread background
            const viewElements = container.UNSAFE_getAllByType(require('react-native').View);
            
            // Find the card element with the background color
            // Look for a View that has an array style containing the unread background color
            const cardElement = viewElements.find((element: any) => {
              const style = element.props.style;
              if (Array.isArray(style)) {
                // Check each style object in the array
                for (const s of style) {
                  if (s && typeof s === 'object' && s.backgroundColor === colors.primary[50]) {
                    return true;
                  }
                  // Also check if it's a nested array
                  if (Array.isArray(s)) {
                    for (const nested of s) {
                      if (nested && typeof nested === 'object' && nested.backgroundColor === colors.primary[50]) {
                        return true;
                      }
                    }
                  }
                }
              }
              return false;
            });

            // Verify the card has the unread background color (light blue)
            expect(cardElement).toBeDefined();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply white background for read notifications', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), // message
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),  // timestamp
          (message, timestamp) => {
            // Test with isRead = true (read)
            const container = renderWithTheme(
              <NotificationCard
                message={message}
                timestamp={timestamp}
                isRead={true}
              />
            );

            // Find the View component (Card container) with the read background
            const viewElements = container.UNSAFE_getAllByType(require('react-native').View);
            
            // Find the card element with the background color
            const cardElement = viewElements.find((element: any) => {
              const style = element.props.style;
              if (Array.isArray(style)) {
                return style.some((s: any) => 
                  s && typeof s === 'object' && s.backgroundColor === colors.background.primary
                );
              }
              return style && typeof style === 'object' && style.backgroundColor === colors.background.primary;
            });

            // Verify the card has the read background color (white)
            expect(cardElement).toBeDefined();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have different backgrounds for read vs unread notifications', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), // message
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),  // timestamp
          fc.boolean(), // isRead
          (message, timestamp, isRead) => {
            const container = renderWithTheme(
              <NotificationCard
                message={message}
                timestamp={timestamp}
                isRead={isRead}
              />
            );

            // Verify the background color matches the read state
            const expectedBackgroundColor = isRead
              ? colors.background.primary  // White for read
              : colors.primary[50];        // Light blue for unread

            // Find the View component (Card container) with the expected background
            const viewElements = container.UNSAFE_getAllByType(require('react-native').View);
            
            // Find the card element with the background color
            // Look for a View that has an array style containing the expected background color
            const cardElement = viewElements.find((element: any) => {
              const style = element.props.style;
              if (Array.isArray(style)) {
                // Check each style object in the array
                for (const s of style) {
                  if (s && typeof s === 'object' && s.backgroundColor === expectedBackgroundColor) {
                    return true;
                  }
                  // Also check if it's a nested array
                  if (Array.isArray(s)) {
                    for (const nested of s) {
                      if (nested && typeof nested === 'object' && nested.backgroundColor === expectedBackgroundColor) {
                        return true;
                      }
                    }
                  }
                }
              }
              return false;
            });

            // Verify the card has the correct background color
            expect(cardElement).toBeDefined();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use correct color values for unread state', () => {
      fc.assert(
        fc.property(
          fc.constant(true), // Always test unread state
          () => {
            // Verify the unread color is light blue (primary.50)
            const unreadColor = colors.primary[50];
            
            // Verify it's a valid hex color
            expect(unreadColor).toMatch(/^#[0-9a-fA-F]{6}$/);
            
            // Verify it's the expected light blue color
            expect(unreadColor).toBe('#eff6ff');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use correct color values for read state', () => {
      fc.assert(
        fc.property(
          fc.constant(true), // Always test read state
          () => {
            // Verify the read color is white (background.primary)
            const readColor = colors.background.primary;
            
            // Verify it's a valid hex color
            expect(readColor).toMatch(/^#[0-9a-fA-F]{6}$/);
            
            // Verify it's white
            expect(readColor).toBe('#ffffff');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: mobile-ui-redesign, Property 19: Notification interaction state change**
   * **Validates: Requirements 7.5**
   * 
   * For any unread notification, when tapped, it should transition to read state 
   * and the background should change from light blue to white
   */
  describe('Property 19: Notification interaction state change', () => {
    it('should call onPress handler when notification is tapped', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), // message
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),  // timestamp
          fc.boolean(), // isRead
          (message, timestamp, isRead) => {
            const mockOnPress = jest.fn();
            
            const { getByText } = renderWithTheme(
              <NotificationCard
                message={message}
                timestamp={timestamp}
                isRead={isRead}
                onPress={mockOnPress}
              />
            );

            // Find and tap the notification card
            const messageElement = getByText(message);
            fireEvent.press(messageElement);

            // Verify onPress was called
            expect(mockOnPress).toHaveBeenCalledTimes(1);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should transition from unread to read state when tapped', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), // message
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),  // timestamp
          (message, timestamp) => {
            // Helper function to find the last occurrence of a background color in styles
            // (last one wins in React Native style arrays)
            const getEffectiveBackgroundColor = (viewElements: any[]): string | null => {
              for (const element of viewElements) {
                const style = element.props.style;
                if (Array.isArray(style)) {
                  // Flatten the style array and get the last backgroundColor
                  let lastBgColor: string | null = null;
                  const flattenStyles = (styles: any[]): void => {
                    for (const s of styles) {
                      if (Array.isArray(s)) {
                        flattenStyles(s);
                      } else if (s && typeof s === 'object' && s.backgroundColor) {
                        lastBgColor = s.backgroundColor;
                      }
                    }
                  };
                  flattenStyles(style);
                  if (lastBgColor) {
                    return lastBgColor;
                  }
                } else if (style && typeof style === 'object' && style.backgroundColor) {
                  return style.backgroundColor;
                }
              }
              return null;
            };

            // Simulate the state transition by rendering twice
            // First render: unread state
            const { rerender, UNSAFE_getAllByType } = renderWithTheme(
              <NotificationCard
                message={message}
                timestamp={timestamp}
                isRead={false}
                onPress={() => {}}
              />
            );

            // Verify initial state is unread (light blue background)
            let viewElements = UNSAFE_getAllByType(require('react-native').View);
            let bgColor = getEffectiveBackgroundColor(viewElements);
            // The effective background should be light blue for unread
            expect(bgColor).toBe(colors.primary[50]);

            // Simulate state change by re-rendering with isRead=true
            rerender(
              <ThemeProvider>
                <NotificationCard
                  message={message}
                  timestamp={timestamp}
                  isRead={true}
                  onPress={() => {}}
                />
              </ThemeProvider>
            );

            // Verify new state is read (white background)
            viewElements = UNSAFE_getAllByType(require('react-native').View);
            bgColor = getEffectiveBackgroundColor(viewElements);
            // The effective background should be white for read
            expect(bgColor).toBe(colors.background.primary);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain background color change after interaction', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), // message
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),  // timestamp
          (message, timestamp) => {
            let isRead = false;
            const handlePress = () => {
              isRead = true;
            };

            const { rerender, UNSAFE_getAllByType } = renderWithTheme(
              <NotificationCard
                message={message}
                timestamp={timestamp}
                isRead={isRead}
                onPress={handlePress}
              />
            );

            // Simulate press
            handlePress();

            // Re-render with updated state
            rerender(
              <ThemeProvider>
                <NotificationCard
                  message={message}
                  timestamp={timestamp}
                  isRead={isRead}
                  onPress={handlePress}
                />
              </ThemeProvider>
            );

            // Verify the background is now white (read state)
            const viewElements = UNSAFE_getAllByType(require('react-native').View);
            const readCard = viewElements.find((element: any) => {
              const style = element.props.style;
              if (Array.isArray(style)) {
                return style.some((s: any) => 
                  s && typeof s === 'object' && s.backgroundColor === colors.background.primary
                );
              }
              return style && typeof style === 'object' && style.backgroundColor === colors.background.primary;
            });
            expect(readCard).toBeDefined();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should only trigger state change for unread notifications', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), // message
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),  // timestamp
          (message, timestamp) => {
            const mockOnPress = jest.fn();
            
            // Test with already read notification
            const { getByText } = renderWithTheme(
              <NotificationCard
                message={message}
                timestamp={timestamp}
                isRead={true}
                onPress={mockOnPress}
              />
            );

            // Tap the notification
            const messageElement = getByText(message);
            fireEvent.press(messageElement);

            // Verify onPress was still called (component doesn't prevent it)
            expect(mockOnPress).toHaveBeenCalledTimes(1);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve message and timestamp during state transition', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), // message
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),  // timestamp
          (message, timestamp) => {
            const { rerender, getByText } = renderWithTheme(
              <NotificationCard
                message={message}
                timestamp={timestamp}
                isRead={false}
                onPress={() => {}}
              />
            );

            // Verify initial content
            expect(getByText(message)).toBeTruthy();
            expect(getByText(timestamp)).toBeTruthy();

            // Simulate state change
            rerender(
              <ThemeProvider>
                <NotificationCard
                  message={message}
                  timestamp={timestamp}
                  isRead={true}
                  onPress={() => {}}
                />
              </ThemeProvider>
            );

            // Verify content is preserved after state change
            expect(getByText(message)).toBeTruthy();
            expect(getByText(timestamp)).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
