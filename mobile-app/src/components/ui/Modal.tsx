import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { Typography } from './Typography';
import { IconButton } from './IconButton';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  dismissable?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  dismissable = true,
}) => {
  const sizeStyles = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    full: styles.sizeFull,
  };

  // Modal kapatıldığında pointerEvents'i temizle
  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissable ? handleClose : undefined}
      onDismiss={() => {
        // Modal tamamen kapandığında state'i temizle
        // Bu, modal kapatıldıktan sonra tıklama sorunlarını önler
      }}
    >
      <View style={styles.overlay} pointerEvents={visible ? 'auto' : 'none'}>
        <TouchableWithoutFeedback onPress={dismissable ? handleClose : undefined}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          style={styles.modalWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents={visible ? 'box-none' : 'none'}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.container, sizeStyles[size]]} pointerEvents="auto">
              {/* Header */}
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  {title && (
                    <Typography variant="h3" style={styles.title}>
                      {title}
                    </Typography>
                  )}
                  {showCloseButton && (
                    <IconButton
                      icon={<Ionicons name="close" size={20} color={colors.neutral[600]} />}
                      onPress={handleClose}
                      size="sm"
                      variant="ghost"
                    />
                  )}
                </View>
              )}

              {/* Content */}
              <View style={styles.content}>
                {children}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.overlay || 'rgba(0, 0, 0, 0.5)',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: colors.background.card,
    borderRadius: 28,
    overflow: 'hidden',
    // Modern: Soft pastel shadow
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 6,
    maxHeight: '90%',
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    // Modern: Border kaldırıldı, boşluk ile ayrım sağlanıyor
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  content: {
    padding: spacing.lg,
  },
  sizeSm: {
    maxHeight: '40%',
  },
  sizeMd: {
    maxHeight: '85%',
  },
  sizeLg: {
    maxHeight: '80%',
  },
  sizeFull: {
    height: '100%',
  },
});
