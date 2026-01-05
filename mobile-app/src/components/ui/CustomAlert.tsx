/**
 * @file CustomAlert.tsx
 * @description Özelleştirilmiş, güzel alert component'i
 */

import React from 'react';
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

export type AlertType = 'success' | 'error' | 'info' | 'confirm' | 'confirmDestructive';

interface CustomAlertProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
  onConfirm,
  onCancel,
  confirmText = 'Tamam',
  cancelText = 'İptal',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle' as const, color: '#10B981' };
      case 'error':
        return { name: 'close-circle' as const, color: '#EF4444' };
      case 'info':
        return { name: 'information-circle' as const, color: '#3B82F6' };
      case 'confirm':
      case 'confirmDestructive':
        return { name: 'help-circle' as const, color: '#F59E0B' };
      default:
        return { name: 'information-circle' as const, color: '#3B82F6' };
    }
  };

  const iconConfig = getIconConfig();
  const isConfirm = type === 'confirm' || type === 'confirmDestructive';

  const handleConfirm = () => {
    console.log('🔴 CustomAlert handleConfirm called', {
      hasOnConfirm: !!onConfirm,
      type,
      confirmText,
    });
    
    // Close alert immediately to prevent UI blocking
    onClose();
    
    // Call onConfirm after modal closes (prevents blocking)
    if (onConfirm) {
      console.log('🔴 Scheduling onConfirm callback');
      // Use requestAnimationFrame to ensure modal is fully closed
      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            console.log('🔴 Executing onConfirm callback');
            onConfirm();
            console.log('🔴 onConfirm callback executed successfully');
          } catch (error) {
            console.error('🔴 Error in onConfirm callback:', error);
          }
        }, 100);
      });
    } else {
      console.warn('🔴 onConfirm callback is undefined!');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...(Platform.OS === 'ios' ? { presentationStyle: 'overFullScreen' as const } : { statusBarTranslucent: true })}
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.backdrop} pointerEvents="auto">
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1} 
            onPress={onClose}
          />
        </View>
        <Animated.View
          style={[
            styles.alertContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
          pointerEvents="box-none"
        >
          <View pointerEvents="auto">
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
            {isConfirm ? (
              <>
                <Button
                  variant="outline"
                  onPress={() => {
                    if (onCancel) {
                      onCancel();
                    }
                    onClose();
                  }}
                  style={styles.button}
                >
                  <Typography variant="body" style={styles.cancelButtonText}>
                    {cancelText}
                  </Typography>
                </Button>
                {type === 'confirmDestructive' ? (
                  <TouchableOpacity
                    style={[styles.button, styles.destructiveButton]}
                    onPress={() => {
                      console.log('🔴 Destructive button pressed');
                      handleConfirm();
                    }}
                    activeOpacity={0.8}
                  >
                    <Typography variant="body" style={styles.destructiveButtonText}>
                      {confirmText}
                    </Typography>
                  </TouchableOpacity>
                ) : (
                  <Button
                    variant="gradient"
                    label={confirmText}
                    onPress={handleConfirm}
                    gradientColors={['#4A90E2', '#2E5C8A']}
                    style={styles.button}
                  />
                )}
              </>
            ) : (
              <Button
                variant="gradient"
                label={confirmText}
                onPress={onClose}
                gradientColors={['#4A90E2', '#2E5C8A']}
                fullWidth
              />
            )}
            </View>
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
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
