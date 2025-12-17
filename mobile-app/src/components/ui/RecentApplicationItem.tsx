import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { colors } from '@/theme';
import { ApplicationListItem } from '@/types/application';
import { formatDate } from '@/utils/date';

interface RecentApplicationItemProps {
  application: ApplicationListItem;
  onPress: () => void;
}

export const RecentApplicationItem: React.FC<RecentApplicationItemProps> = ({ application, onPress }) => {
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return colors.success[600];
      case 'rejected':
        return colors.error[600];
      case 'pending':
        return colors.warning[600];
      default:
        return colors.neutral[500];
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return 'Kabul Edildi';
      case 'rejected':
        return 'Reddedildi';
      case 'pending':
        return 'Değerlendiriliyor';
      case 'withdrawn':
        return 'Geri Çekildi';
      default:
        return status || 'Bilinmiyor';
    }
  };

  const statusColor = getStatusColor(application.status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="document-text" size={20} color={colors.primary[600]} />
      </View>
      
      <View style={styles.content}>
        <Typography variant="body" style={styles.title} numberOfLines={1}>
          {application.job_title}
        </Typography>
        <Typography variant="caption" style={styles.subtitle} numberOfLines={1}>
          {application.hospital_name}
        </Typography>
      </View>

      <View style={styles.rightContent}>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Typography variant="caption" style={{ ...styles.statusText, color: statusColor }}>
            {getStatusText(application.status)}
          </Typography>
        </View>
        <Typography variant="caption" style={styles.date}>
          {formatDate(application.created_at)}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontWeight: '600',
    color: colors.neutral[900],
    fontSize: 14,
    marginBottom: 2,
  },
  subtitle: {
    color: colors.neutral[500],
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  date: {
    color: colors.neutral[400],
    fontSize: 10,
  },
});
