/**
 * @file CertificateCard.tsx
 * @description Sertifika kartı bileşeni
 * 
 * Özellikler:
 * - Sertifika bilgileri (ad, veren kurum, tarihler, kimlik)
 * - Düzenleme ve silme butonları
 * - Sertifika görüntüleme butonu
 * - İkon ve chip'ler
 * - Tıklanabilir kart
 * - Modern tasarım
 * 
 * Kullanım:
 * ```tsx
 * <CertificateCard
 *   name="CPR Sertifikası"
 *   issuer="Kızılay"
 *   issueDate="2023"
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { colors, spacing } from '@/theme';

/**
 * CertificateCard bileşeni props interface'i
 */
export interface CertificateCardProps {
  /** Sertifika adı */
  name: string;
  /** Veren kurum */
  issuer: string;
  /** Verilme tarihi */
  issueDate: string;
  /** Bitiş tarihi (opsiyonel) */
  expiryDate?: string;
  /** Sertifika kimlik numarası (opsiyonel) */
  credentialId?: string;
  /** Sertifika URL'i (opsiyonel) */
  credentialUrl?: string;
  /** Tıklama fonksiyonu */
  onPress?: () => void;
  /** Düzenleme fonksiyonu */
  onEdit?: () => void;
  /** Sertifika görüntüleme fonksiyonu */
  onViewCredential?: () => void;
  /** Silme fonksiyonu */
  onDelete?: () => void;
}

/**
 * Sertifika Kartı Bileşeni
 * Profil sertifikalarını gösterir
 */
export const CertificateCard: React.FC<CertificateCardProps> = ({
  name,
  issuer,
  issueDate,
  expiryDate,
  credentialId,
  credentialUrl,
  onPress,
  onEdit,
  onViewCredential,
  onDelete,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container onPress={onPress} activeOpacity={0.7}>
      <Card variant="outlined" padding="lg" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="ribbon" size={20} color={colors.warning[600]} />
          </View>
          <View style={styles.content}>
            <Typography variant="h3" style={styles.name}>
              {name}
            </Typography>
            <Typography variant="body" style={styles.issuer}>
              {issuer}
            </Typography>
            {credentialId && (
              <Typography variant="caption" style={styles.credentialId}>
                ID: {credentialId}
              </Typography>
            )}
          </View>
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                <Ionicons name="pencil-outline" size={18} color={colors.primary[600]} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color={colors.error[600]} />
              </TouchableOpacity>
            )}
            {(credentialUrl || onViewCredential) && !onDelete && (
              <IconButton
                icon={<Ionicons name="open" size={18} color={colors.primary[600]} />}
                onPress={onViewCredential || (() => {})}
                size="sm"
                variant="ghost"
              />
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Chip
            label={`Verildi: ${issueDate}`}
            icon={<Ionicons name="calendar" size={12} color={colors.neutral[600]} />}
            variant="soft"
            color="neutral"
            size="sm"
          />
          {expiryDate && (
            <Chip
              label={`Bitiş: ${expiryDate}`}
              variant="soft"
              color="warning"
              size="sm"
            />
          )}
        </View>
      </Card>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warning[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  issuer: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  credentialId: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    // Modern: Border kaldırıldı
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
    // Modern: Border kaldırıldı
  },
});
