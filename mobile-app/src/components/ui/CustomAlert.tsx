/**
 * @file CustomAlert.tsx
 * @description Stateless alert component - purely presentational
 * 
 * All callback logic is handled by AlertProvider.
 * This component only handles:
 * - Animation
 * - Rendering UI based on props
 * - Forwarding button presses to provider callbacks
 * 
 * Requirements:
 * - 2.1: onConfirm callback execution (delegated to provider)
 * - 2.2: onCancel callback execution (delegated to provider)
 * - 2.3: onClose callback for cleanup (handled by provider)
 * - 9.4: Validate callbacks are functions before calling
 * - 9.6: Provide descriptive prop validation errors
 * - 10.5: Wrap callback execution in try-catch, log errors in dev only
 */

import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { Button } from './Button';
import type { AlertType } from '@/types/alert';

// Re-export AlertType for backward compatibility
export type { AlertType } from '@/types/alert';

interface CustomAlertProps {
  /** Whether the alert is visible */
  visible: boolean;
  /** Type of alert determining icon and color scheme */
  type: AlertType;
  /** Title displayed at the top of the alert */
  title: string;
  /** Message body of the alert */
  message: string;
  /** Callback when confirm button is pressed - handled by provider */
  onConfirm: () => void;
  /** Callback when cancel button is pressed - handled by provider */
  onCancel: () => void;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
}

const ICON_CONFIG: Record<AlertType, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  success: { name: 'checkmark-circle', color: '#10B981' },
  error: { name: 'close-circle', color: '#EF4444' },
  info: { name: 'information-circle', color: '#3B82F6' },
  confirm: { name: 'help-circle', color: '#F59E0B' },
  confirmDestructive: { name: 'warning', color: '#EF4444' },
};

/** Valid alert types for prop validation */
const VALID_ALERT_TYPES: AlertType[] = ['success', 'error', 'info', 'confirm', 'confirmDestructive'];

/**
 * Development-only prop validation for CustomAlert
 * Logs descriptive errors for invalid props (Requirement 9.6)
 * 
 * @param props - The component props to validate
 * @returns true if all props are valid, false otherwise
 */
const validateProps = (props: CustomAlertProps): boolean => {
  if (!__DEV__) return true;
  
  let isValid = true;
  
  // Validate visible prop
  if (typeof props.visible !== 'boolean') {
    console.error(
      `[CustomAlert] Invalid prop 'visible': expected boolean, received ${typeof props.visible}. ` +
      `The alert visibility state must be a boolean value.`
    );
    isValid = false;
  }
  
  // Validate type prop
  if (!VALID_ALERT_TYPES.includes(props.type)) {
    console.error(
      `[CustomAlert] Invalid prop 'type': received '${props.type}'. ` +
      `Valid types are: ${VALID_ALERT_TYPES.join(', ')}.`
    );
    isValid = false;
  }
  
  // Validate title prop
  if (typeof props.title !== 'string') {
    console.error(
      `[CustomAlert] Invalid prop 'title': expected string, received ${typeof props.title}. ` +
      `The alert title must be a string.`
    );
    isValid = false;
  } else if (props.title.trim() === '') {
    console.warn(
      `[CustomAlert] Warning: 'title' prop is an empty string. ` +
      `Consider providing a meaningful title for better user experience.`
    );
  }
  
  // Validate message prop
  if (typeof props.message !== 'string') {
    console.error(
      `[CustomAlert] Invalid prop 'message': expected string, received ${typeof props.message}. ` +
      `The alert message must be a string.`
    );
    isValid = false;
  }
  
  // Validate onConfirm prop
  if (typeof props.onConfirm !== 'function') {
    console.error(
      `[CustomAlert] Invalid prop 'onConfirm': expected function, received ${typeof props.onConfirm}. ` +
      `The onConfirm callback must be a function provided by AlertProvider.`
    );
    isValid = false;
  }
  
  // Validate onCancel prop
  if (typeof props.onCancel !== 'function') {
    console.error(
      `[CustomAlert] Invalid prop 'onCancel': expected function, received ${typeof props.onCancel}. ` +
      `The onCancel callback must be a function provided by AlertProvider.`
    );
    isValid = false;
  }
  
  // Validate optional confirmText prop
  if (props.confirmText !== undefined && typeof props.confirmText !== 'string') {
    console.error(
      `[CustomAlert] Invalid prop 'confirmText': expected string or undefined, received ${typeof props.confirmText}. ` +
      `The confirm button text must be a string.`
    );
    isValid = false;
  }
  
  // Validate optional cancelText prop
  if (props.cancelText !== undefined && typeof props.cancelText !== 'string') {
    console.error(
      `[CustomAlert] Invalid prop 'cancelText': expected string or undefined, received ${typeof props.cancelText}. ` +
      `The cancel button text must be a string.`
    );
    isValid = false;
  }
  
  return isValid;
};

/**
 * Safely execute a callback with validation and error handling
 * - Validates callback is a function before calling (Requirement 9.4)
 * - Wraps execution in try-catch (Requirement 10.5)
 * - Logs errors in development mode only (Requirement 10.5)
 * 
 * @param callback - The callback function to execute
 * @param callbackName - Name of the callback for error logging
 */
const safeExecuteCallback = (
  callback: (() => void) | undefined,
  callbackName: string
): void => {
  // Validate callback is a function before calling (Requirement 9.4)
  if (typeof callback !== 'function') {
    if (__DEV__) {
      console.warn(`[CustomAlert] ${callbackName} is not a function, skipping execution`);
    }
    return;
  }

  // Wrap callback execution in try-catch (Requirement 10.5)
  try {
    callback();
  } catch (error) {
    // Log errors in development mode only (Requirement 10.5)
    if (__DEV__) {
      console.error(`[CustomAlert] Error executing ${callbackName}:`, error);
    }
    // Continue without crashing - the alert will still dismiss
  }
};

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Tamam',
  cancelText = 'İptal',
}) => {
  // Validate props in development mode (Requirement 9.6)
  useEffect(() => {
    validateProps({ visible, type, title, message, onConfirm, onCancel, confirmText, cancelText });
  }, [visible, type, title, message, onConfirm, onCancel, confirmText, cancelText]);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const isMountedRef = useRef(true);

  // Track mount state for animation cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancel any running animation on unmount to prevent memory leaks
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (visible) {
      // Store animation reference for cleanup
      animationRef.current = Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      });
      animationRef.current.start(() => {
        // Clear reference after animation completes
        animationRef.current = null;
      });
    } else {
      // Cancel any running animation before resetting
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      // Reset animation value when not visible
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim]);

  const iconConfig = ICON_CONFIG[type];
  const isConfirmType = type === 'confirm' || type === 'confirmDestructive';
  const isDestructive = type === 'confirmDestructive';

  /**
   * Handle confirm button press
   * Validates and safely executes the onConfirm callback
   */
  const handleConfirmPress = (): void => {
    safeExecuteCallback(onConfirm, 'onConfirm');
  };

  /**
   * Handle cancel button press
   * Validates and safely executes the onCancel callback
   */
  const handleCancelPress = (): void => {
    safeExecuteCallback(onCancel, 'onCancel');
  };

  /**
   * Handle dismiss action for non-confirm alert types
   * For single-button alerts, dismiss triggers the confirm callback
   */
  const handleDismiss = (): void => {
    handleConfirmPress();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isConfirmType ? handleCancelPress : handleDismiss}
      statusBarTranslucent
      {...(Platform.OS === 'ios' && { presentationStyle: 'overFullScreen' })}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.alertContainer, { transform: [{ scale: scaleAnim }] }]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${iconConfig.color}15` }]}>
            <Ionicons name={iconConfig.name} size={48} color={iconConfig.color} />
          </View>

          {/* Title */}
          <Typography variant="h3" style={styles.title}>
            {title}
          </Typography>

          {/* Message */}
          <Typography variant="body" style={styles.message}>
            {message}
          </Typography>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {isConfirmType ? (
              <>
                <Button
                  variant="outline"
                  label={cancelText}
                  onPress={handleCancelPress}
                  style={styles.button}
                />
                <TouchableOpacity
                  style={[
                    styles.button,
                    isDestructive ? styles.destructiveButton : styles.confirmButton,
                  ]}
                  onPress={handleConfirmPress}
                  activeOpacity={0.8}
                >
                  <Typography variant="body" style={styles.confirmButtonText}>
                    {confirmText}
                  </Typography>
                </TouchableOpacity>
              </>
            ) : (
              <Button
                variant="gradient"
                label={confirmText}
                onPress={handleDismiss}
                gradientColors={['#4A90E2', '#2E5C8A']}
                fullWidth
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
