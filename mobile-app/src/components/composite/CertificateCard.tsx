import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Award, Calendar, ExternalLink } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { colors, spacing } from '@/theme';

export interface CertificateCardProps {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  onPress?: () => void;
  onViewCredential?: () => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  name,
  issuer,
  issueDate,
  expiryDate,
  credentialId,
  credentialUrl,
  onPress,
  onViewCredential,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container onPress={onPress} activeOpacity={0.7}>
      <Card variant="outlined" padding="lg" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Award size={20} color={colors.warning[600]} />
          </View>
          <View style={styles.content}>
            <Typography variant="h4" style={styles.name}>
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
          {(credentialUrl || onViewCredential) && (
            <IconButton
              icon={<ExternalLink size={18} color={colors.primary[600]} />}
              onPress={onViewCredential || (() => {})}
              size="sm"
              variant="ghost"
            />
          )}
        </View>

        <View style={styles.footer}>
          <Chip
            label={`Verildi: ${issueDate}`}
            icon={<Calendar size={12} color={colors.neutral[600]} />}
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
});
