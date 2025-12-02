import React, { useMemo } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ModalProps as RNModalProps,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface ModalProps extends Omit<RNModalProps, 'visible'> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  containerStyle?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  containerStyle,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.container, styles[`size_${size}`], containerStyle]}>
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.content}>{children}</View>
          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
      </View>
    </RNModal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.overlay,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.xl,
    maxHeight: '90%',
  },
  size_sm: {
    width: '70%',
  },
  size_md: {
    width: '85%',
  },
  size_lg: {
    width: '95%',
  },
  size_full: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeText: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.text.secondary,
  },
  content: {
    padding: theme.spacing.lg,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
});
