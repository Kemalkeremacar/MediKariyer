import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { theme } from '@/theme';

export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastManagerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      handleDismiss();
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(toast.id);
    });
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return theme.colors.success[500];
      case 'error':
        return theme.colors.error[500];
      case 'warning':
        return theme.colors.warning[500];
      case 'info':
      default:
        return theme.colors.primary[600];
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toastContent}
        onPress={handleDismiss}
        activeOpacity={0.9}
      >
        <Text style={styles.toastText} numberOfLines={3}>
          {toast.message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onDismiss }) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastContainer: {
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.lg,
    maxWidth: Dimensions.get('window').width - theme.spacing['2xl'] * 2,
  },
  toastContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  toastText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
});
