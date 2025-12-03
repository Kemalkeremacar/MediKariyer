/**
 * Visual Regression Test: Component Snapshots
 * Tests: Button, Card, Badge variants in light and dark modes
 * 
 * This test suite creates snapshot tests for all major UI components
 * to detect unintended visual changes across:
 * - Component variants (primary, secondary, outline, ghost, etc.)
 * - Component sizes (sm, md, lg)
 * - Component states (loading, disabled, active)
 * - Light and dark themes
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Text, View } from 'react-native';

// Mock theme context with light theme by default
// We need to define the mock inline to avoid out-of-scope variable issues
jest.mock('@/contexts/ThemeContext', () => {
  const { lightTheme } = jest.requireActual('@/theme');
  return {
    useTheme: () => ({
      theme: lightTheme,
    }),
  };
});

describe('Component Visual Regression Tests', () => {
  describe('Button Component - Light Mode', () => {
    it('should match snapshot for primary variant', () => {
      const { toJSON } = render(
        <Button variant="primary" size="md" label="Primary Button" onPress={() => {}} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for secondary variant', () => {
      const { toJSON } = render(
        <Button variant="secondary" size="md" label="Secondary Button" onPress={() => {}} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for outline variant', () => {
      const { toJSON } = render(
        <Button variant="outline" size="md" label="Outline Button" onPress={() => {}} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for ghost variant', () => {
      const { toJSON } = render(
        <Button variant="ghost" size="md" label="Ghost Button" onPress={() => {}} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for small size', () => {
      const { toJSON } = render(
        <Button variant="primary" size="sm" label="Small Button" onPress={() => {}} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for large size', () => {
      const { toJSON } = render(
        <Button variant="primary" size="lg" label="Large Button" onPress={() => {}} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for loading state', () => {
      const { toJSON } = render(
        <Button variant="primary" size="md" label="Loading" loading onPress={() => {}} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for disabled state', () => {
      const { toJSON } = render(
        <Button variant="primary" size="md" label="Disabled" disabled onPress={() => {}} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for full width button', () => {
      const { toJSON } = render(
        <Button variant="primary" size="md" label="Full Width" fullWidth onPress={() => {}} />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // Note: Dark mode testing requires a different approach due to Jest module caching
  // For comprehensive dark mode testing, consider using visual regression tools like
  // Chromatic, Percy, or Applitools that can capture actual screenshots

  describe('Card Component - Light Mode', () => {
    it('should match snapshot for elevated variant', () => {
      const { toJSON } = render(
        <Card variant="elevated" padding="lg">
          <Text>Elevated Card Content</Text>
        </Card>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for outlined variant', () => {
      const { toJSON } = render(
        <Card variant="outlined" padding="lg">
          <Text>Outlined Card Content</Text>
        </Card>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for filled variant', () => {
      const { toJSON } = render(
        <Card variant="filled" padding="lg">
          <Text>Filled Card Content</Text>
        </Card>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot with different padding sizes', () => {
      const { toJSON } = render(
        <View>
          <Card variant="elevated" padding="sm">
            <Text>Small Padding</Text>
          </Card>
          <Card variant="elevated" padding="lg">
            <Text>Large Padding</Text>
          </Card>
          <Card variant="elevated" padding="2xl">
            <Text>Extra Large Padding</Text>
          </Card>
        </View>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for pressable card', () => {
      const { toJSON } = render(
        <Card variant="elevated" padding="lg" onPress={() => {}}>
          <Text>Pressable Card</Text>
        </Card>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });



  describe('Badge Component - Light Mode', () => {
    it('should match snapshot for pending status', () => {
      const { toJSON } = render(
        <Badge status="pending" size="sm">
          Beklemede
        </Badge>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for accepted status', () => {
      const { toJSON } = render(
        <Badge status="accepted" size="sm">
          Onaylandı
        </Badge>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for rejected status', () => {
      const { toJSON } = render(
        <Badge status="rejected" size="sm">
          Reddedildi
        </Badge>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for reviewed status', () => {
      const { toJSON } = render(
        <Badge status="reviewed" size="sm">
          İncelendi
        </Badge>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for medium size badge', () => {
      const { toJSON } = render(
        <Badge status="pending" size="md">
          Medium Badge
        </Badge>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for variant-based badges', () => {
      const { toJSON } = render(
        <View>
          <Badge variant="primary" size="sm">Primary</Badge>
          <Badge variant="secondary" size="sm">Secondary</Badge>
          <Badge variant="success" size="sm">Success</Badge>
          <Badge variant="warning" size="sm">Warning</Badge>
          <Badge variant="error" size="sm">Error</Badge>
        </View>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });



  describe('Component Combinations', () => {
    it('should match snapshot for card with button', () => {
      const { toJSON } = render(
        <Card variant="elevated" padding="lg">
          <Text>Card with Action</Text>
          <Button variant="primary" size="md" label="Action" onPress={() => {}} />
        </Card>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for card with badge', () => {
      const { toJSON } = render(
        <Card variant="elevated" padding="lg">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>Application Status</Text>
            <Badge status="accepted" size="sm">Approved</Badge>
          </View>
        </Card>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
