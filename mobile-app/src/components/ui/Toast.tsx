/**
 * @file Toast.tsx
 * @description Toast notification component for displaying non-blocking messages
 * 
 * Requirements:
 * - 4.5: Support toast types: success, error, warning, info
 * - 9.6: Provide descriptive prop validation errors
 */

import React, { useEffect } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { Typography } from './Typography';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

/** Valid toast types for prop validation */
const VALID_TOAST_TYPES: ToastType[] = ['success', 'error', 'warning', 'info'];

/**
 * Development-only prop validation for Toast
 * Logs descriptive errors for invalid props (Requirement 9.6)
 * 
 * @param props - The component props to validate
 * @returns true if all props are valid, false otherwise
 */
const validateProps = (props: ToastProps): boolean => {
  if (!__DEV__) return true;
  
  let isValid = true;
  
  // Validate message prop
  if (typeof props.message !== 'string') {
    console.error(
      `[Toast] Invalid prop 'message': expected string, received ${typeof props.message}. ` +
      `The toast message must be a string.`
    );
    isValid = false;
  } else if (props.message.trim() === '') {
    console.warn(
      `[Toast] Warning: 'message' prop is an empty string. ` +
      `Consider providing a meaningful message for better user experience.`
    );
  }
  
  // Validate type prop (optional, defaults to 'info')
  if (props.type !== undefined && !VALID_TOAST_TYPES.includes(props.type)) {
    console.error(
      `[Toast] Invalid prop 'type': received '${props.type}'. ` +
      `Valid types are: ${VALID_TOAST_TYPES.join(', ')}. Defaulting to 'info'.`
    );
    isValid = false;
  }
  
  // Validate duration prop (optional)
  if (props.duration !== undefined) {
    if (typeof props.duration !== 'number') {
      console.error(
        `[Toast] Invalid prop 'duration': expected number, received ${typeof props.duration}. ` +
        `The duration must be a number in milliseconds.`
      );
      isValid = false;
    } else if (props.duration <= 0) {
      console.warn(
        `[Toast] Warning: 'duration' prop is ${props.duration}ms. ` +
        `Consider using a positive duration for the toast to be visible.`
      );
    } else if (props.duration < 500) {
      console.warn(
        `[Toast] Warning: 'duration' prop is ${props.duration}ms which is very short. ` +
        `Users may not have time to read the message.`
      );
    }
  }
  
  // Validate onHide prop (optional)
  if (props.onHide !== undefined && typeof props.onHide !== 'function') {
    console.error(
      `[Toast] Invalid prop 'onHide': expected function or undefined, received ${typeof props.onHide}. ` +
      `The onHide callback must be a function.`
    );
    isValid = false;
  }
  
  return isValid;
};

const iconMap = {
  success: 'checkmark-circle' as const,
  error: 'close-circle' as const,
  warning: 'alert-circle' as const,
  info: 'information-circle' as const,
};

const colorMap = {
  success: colors.success[600],
  error: colors.error[600],
  warning: colors.warning[600],
  info: colors.primary[600],
};

const bgColorMap = {
  success: colors.success[50],
  error: colors.error[50],
  warning: colors.warning[50],
  info: colors.primary[50],
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  // Validate props in development mode (Requirement 9.6)
  useEffect(() => {
    validateProps({ message, type, duration, onHide });
  }, [message, type, duration, onHide]);

  // Use useRef to persist animated values across renders
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-20)).current;
  
  // Track animation references for cleanup on unmount (Requirement 10.6)
  const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);
  const hideAnimationRef = React.useRef<Animated.CompositeAnimation | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = React.useRef(true);
  
  const iconName = iconMap[type];

  useEffect(() => {
    isMountedRef.current = true;
    
    // Start show animation
    animationRef.current = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);
    
    animationRef.current.start(() => {
      // Clear reference after animation completes
      animationRef.current = null;
    });

    timerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      // Start hide animation
      hideAnimationRef.current = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
      
      hideAnimationRef.current.start(() => {
        // Clear reference after animation completes
        hideAnimationRef.current = null;
        // Only call onHide if still mounted
        if (isMountedRef.current) {
          onHide?.();
        }
      });
    }, duration);

    // Cleanup function - cancel animations and timers on unmount (Requirement 10.6)
    return () => {
      isMountedRef.current = false;
      
      // Clear timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Cancel show animation if running
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      
      // Cancel hide animation if running
      if (hideAnimationRef.current) {
        hideAnimationRef.current.stop();
        hideAnimationRef.current = null;
      }
    };
  }, [duration, onHide, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bgColorMap[type],
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Ionicons name={iconName} size={20} color={colorMap[type]} />
      <Typography variant="body" style={{ ...styles.message, color: colorMap[type] }}>
        {message}
      </Typography>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
