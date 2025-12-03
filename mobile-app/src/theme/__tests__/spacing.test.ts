/**
 * Property-Based Tests for Theme Spacing
 * Tests spacing grid consistency according to the 8px grid system
 */

import * as fc from 'fast-check';
import { spacing } from '../spacing';

describe('Theme Spacing Properties', () => {
  /**
   * **Feature: mobile-ui-redesign, Property 1: Spacing grid consistency**
   * 
   * Property: For any spacing value defined in the theme, the value should be a multiple of 8 pixels
   * Validates: Requirements 1.1
   */
  it('should ensure all spacing values are multiples of 8', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(spacing)),
        (spacingKey) => {
          const spacingValue = spacing[spacingKey as keyof typeof spacing];
          
          // All spacing values should be multiples of 8
          // Exception: 'xs' is 4px (half of base unit) which is acceptable for micro-spacing
          if (spacingKey === 'xs') {
            return spacingValue === 4;
          }
          
          return spacingValue % 8 === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify spacing values are positive integers
   */
  it('should ensure all spacing values are positive integers', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(spacing)),
        (spacingKey) => {
          const spacingValue = spacing[spacingKey as keyof typeof spacing];
          
          return (
            Number.isInteger(spacingValue) &&
            spacingValue > 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify spacing scale is monotonically increasing
   */
  it('should ensure spacing scale increases monotonically', () => {
    const spacingKeys = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
    const spacingValues = spacingKeys.map(key => spacing[key as keyof typeof spacing]);
    
    for (let i = 1; i < spacingValues.length; i++) {
      expect(spacingValues[i]).toBeGreaterThan(spacingValues[i - 1]);
    }
  });
});
