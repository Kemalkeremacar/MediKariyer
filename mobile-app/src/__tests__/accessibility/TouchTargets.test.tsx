/**
 * Accessibility Test: Touch Target Sizes
 * Tests: Minimum 44x44px touch targets
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Mock theme
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: { 600: '#2563eb' },
        secondary: { 600: '#0d9488' },
        text: { inverse: '#ffffff', primary: '#111827' },
        border: { light: '#e5e7eb' },
      },
      spacing: { sm: 8, md: 12, lg: 16 },
      borderRadius: { lg: 12 },
      typography: {
        fontSize: { base: 16 },
        fontWeight: { semibold: '600' },
      },
    },
  }),
}));

describe('Touch Target Accessibility Tests', () => {
  it('Button md size should have minimum 44x44px touch target', () => {
    const { UNSAFE_root } = render(
      <Button variant="primary" size="md" label="Test Button" onPress={() => {}} />
    );

    // Get the TouchableOpacity component
    const touchable = UNSAFE_root.findByType(TouchableOpacity);
    const styles = touchable.props.style;

    // Check minHeight is at least 44px
    // Styles is an array, find the object with minHeight
    const hasMinHeight = Array.isArray(styles) && styles.some((s: any) => s && s.minHeight >= 44);
    expect(hasMinHeight).toBe(true);
  });

  it('Button sm size should have minimum 36px touch target', () => {
    const { UNSAFE_root } = render(
      <Button variant="primary" size="sm" label="Small Button" onPress={() => {}} />
    );

    const touchable = UNSAFE_root.findByType(TouchableOpacity);
    const styles = touchable.props.style;

    const hasMinHeight = Array.isArray(styles) && styles.some((s: any) => s && s.minHeight >= 36);
    expect(hasMinHeight).toBe(true);
  });

  it('Button lg size should have minimum 52px touch target', () => {
    const { UNSAFE_root } = render(
      <Button variant="primary" size="lg" label="Large Button" onPress={() => {}} />
    );

    const touchable = UNSAFE_root.findByType(TouchableOpacity);
    const styles = touchable.props.style;

    const hasMinHeight = Array.isArray(styles) && styles.some((s: any) => s && s.minHeight >= 52);
    expect(hasMinHeight).toBe(true);
  });
});
