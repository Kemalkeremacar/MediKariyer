/**
 * @file NotificationPermissionModal.tsx
 * @description Bildirim izni için "soft ask" (yumuşak soru) modal'ı
 * 
 * ✅ UX EN İYİ UYGULAMALARI:
 * - Sistem popup'ından ÖNCE gösterilir
 * - Faydaları açıklar (özellikleri değil)
 * - Maksimum 3 madde
 * - "Geç" seçeneği her zaman mevcut
 * - "Zorunlu" ifadesi yok
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';

interface NotificationPermissionModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

interface BenefitItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

/**
 * Fayda maddesi bileşeni
 * İkon ve açıklama metni gösterir
 */
const BenefitItem: React.FC<BenefitItemProps> = ({ icon, text }) => (
  <View style={styles.benefitItem}>
    <View style={styles.benefitIconContainer}>
      <Ionicons name={icon} size={20} color={colors.primary[600]} />
    </View>
    <Typography variant="body" style={styles.benefitText}>
      {text}
    </Typography>
  </View>
);

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDecline}
    >
      {/* Overlay - Dışarı tıklanınca kapat */}
      <Pressable style={styles.overlay} onPress={onDecline}>
        {/* Modal içeriği - Tıklanınca kapanmasın */}
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          {/* İkon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name="notifications" size={48} color={colors.primary[600]} />
            </View>
          </View>

          {/* Başlık */}
          <Typography variant="h2" style={styles.title}>
            Bildirimleri Açmak İster misin?
          </Typography>

          {/* Alt başlık */}
          <Typography variant="body" style={styles.subtitle}>
            Önemli güncellemeleri kaçırma
          </Typography>

          {/* Faydalar (maksimum 3) */}
          <View style={styles.benefits}>
            <BenefitItem
              icon="checkmark-circle"
              text="Başvurularınla ilgili anlık güncellemeler"
            />
            <BenefitItem
              icon="chatbubble"
              text="Yeni mesajlar ve önemli hatırlatmalar"
            />
            <BenefitItem
              icon="shield-checkmark"
              text="Hesabınla ilgili kritik bildirimler"
            />
          </View>

          {/* Ana buton - Kabul et */}
          <Button
            label="Bildirimleri Aç"
            onPress={onAccept}
            variant="primary"
            fullWidth
            style={styles.primaryButton}
          />

          {/* İkincil buton - Reddet */}
          <TouchableOpacity onPress={onDecline} style={styles.skipButton}>
            <Typography variant="caption" style={styles.skipText}>
              Şimdilik Geç
            </Typography>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modal: {
    backgroundColor: colors.background.primary,
    borderRadius: 24,
    padding: spacing['2xl'],
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  benefits: {
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  benefitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  primaryButton: {
    marginBottom: spacing.md,
  },
  skipButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
});
