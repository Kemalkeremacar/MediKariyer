import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, CheckCircle } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Typography } from '@/components/ui/Typography';
import { Progress } from '@/components/ui/Progress';
import { colors, spacing } from '@/theme';

export interface ProfileCardProps {
  name: string;
  specialty?: string;
  subspecialty?: string;
  photoUrl?: string;
  verified?: boolean;
  completionPercent?: number;
  onPress?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  specialty,
  subspecialty,
  photoUrl,
  verified = false,
  completionPercent,
  onPress,
}) => {
  const needsCompletion = completionPercent !== undefined && completionPercent < 100;

  return (
    <Card variant="elevated" padding="xl" style={styles.card}>
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.avatarContainer}>
          <Avatar
            source={photoUrl}
            size="xl"
            verified={verified}
          />
          {verified && (
            <View style={styles.verifiedBadge}>
              <CheckCircle size={20} color={colors.success[600]} fill={colors.background.secondary} />
            </View>
          )}
        </View>
        
        <View style={styles.info}>
          <Typography variant="h3" style={styles.name}>
            {name}
          </Typography>
          
          {specialty && (
            <Typography variant="body" style={styles.specialty}>
              {specialty}
              {subspecialty && ` • ${subspecialty}`}
            </Typography>
          )}

          {needsCompletion && (
            <View style={styles.completionContainer}>
              <View style={styles.completionHeader}>
                <Typography variant="caption" style={styles.completionLabel}>
                  Profil Tamamlanma
                </Typography>
                <Typography variant="caption" style={styles.completionPercent}>
                  {completionPercent}%
                </Typography>
              </View>
              <Progress
                value={completionPercent || 0}
                showLabel={false}
                size="md"
                color="primary"
              />
            </View>
          )}
        </View>

        {onPress && (
          <View style={styles.editButton}>
            <ChevronRight size={20} color={colors.primary[600]} />
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    elevation: 8,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  content: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 2,
    elevation: 4,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  info: {
    flex: 1,
    gap: spacing.sm,
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  specialty: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  completionContainer: {
    width: '100%',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  completionPercent: {
    fontSize: 12,
    color: colors.primary[600],
    fontWeight: '700',
  },
  editButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
