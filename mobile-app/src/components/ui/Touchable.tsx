/**
 * @file Touchable.tsx
 * @description Optimized touchable component to prevent gesture conflicts
 */

import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Platform } from 'react-native';

interface TouchableProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

/**
 * Optimized Touchable component
 * - Prevents gesture conflicts
 * - Better performance
 * - Consistent behavior across platforms
 */
export const Touchable: React.FC<TouchableProps> = ({
  children,
  activeOpacity = 0.7,
  delayPressIn = 0,
  delayPressOut = 100,
  ...props
}) => {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      delayPressIn={delayPressIn}
      delayPressOut={delayPressOut}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};
