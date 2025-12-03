/**
 * Accessibility Test: Color Contrast
 * Tests: WCAG 2.1 contrast ratios (4.5:1 for normal text, 3:1 for large text)
 */

import { lightColors } from '@/theme/colors';

// Helper function to calculate relative luminance
function getLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Helper function to calculate contrast ratio
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Color Contrast Accessibility Tests', () => {
  describe('Text on Background', () => {
    it('primary text on white background should meet 4.5:1 ratio', () => {
      const ratio = getContrastRatio(
        lightColors.text.primary,
        lightColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('secondary text on white background should meet 4.5:1 ratio', () => {
      const ratio = getContrastRatio(
        lightColors.text.secondary,
        lightColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('primary button text (white) on primary background should meet 4.5:1 ratio', () => {
      const ratio = getContrastRatio(
        lightColors.text.inverse,
        lightColors.primary[600]
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Large Text (18pt+)', () => {
    it('large text should meet 3:1 ratio minimum', () => {
      // For headings and large text, 3:1 is acceptable
      const ratio = getContrastRatio(
        lightColors.text.secondary,
        lightColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Status Colors', () => {
    it('success text should have sufficient contrast', () => {
      const ratio = getContrastRatio(
        lightColors.success[700],
        lightColors.success[100]
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('warning text should have sufficient contrast', () => {
      const ratio = getContrastRatio(
        lightColors.warning[700],
        lightColors.warning[100]
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('error text should have sufficient contrast', () => {
      const ratio = getContrastRatio(
        lightColors.error[700],
        lightColors.error[100]
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Interactive Elements', () => {
    it('primary button should have sufficient contrast', () => {
      const ratio = getContrastRatio(
        lightColors.text.inverse,
        lightColors.primary[600]
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('outline button text should have sufficient contrast', () => {
      const ratio = getContrastRatio(
        lightColors.primary[600],
        lightColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});
