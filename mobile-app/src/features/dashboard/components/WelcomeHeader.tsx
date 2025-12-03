/**
 * Dashboard Feature Component - Welcome Header
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Calendar } from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

interface WelcomeHeaderProps {
  firstName: string;
  lastName: string;
  unreadCount: number;
  onNotificationPress: () => void;
}

export const WelcomeHeader = ({
  firstName,
  lastName,
  unreadCount,
  onNotificationPress,
}: WelcomeHeaderProps) => {
  const currentDate = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Typography variant="caption" style={styles.greeting}>
            Merhaba,
          </Typography>
          <Typography variant="h2" style={styles.userName}>
            {firstName} {lastName}
          </Typography>
          <View style={styles.dateContainer}>
            <Calendar size={14} color={colors.text.secondary} />
            <Typography variant="caption" style={styles.dateText}>
              {currentDate}
            </Typography>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress}>
          <Bell size={24} color={colors.text.primary} />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Typography variant="caption" style={styles.notificationCount}>
                {unreadCount}
              </Typography>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.primary[50],
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  userName: {
    marginBottom: spacing.xs,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  dateText: {
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.error[600],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  notificationCount: {
    color: colors.text.inverse,
    fontSize: 11,
    fontWeight: '600',
  },
});
