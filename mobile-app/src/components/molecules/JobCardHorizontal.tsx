import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import {
  Box,
  HStack,
  VStack,
  Badge,
  BadgeText,
  Icon,
} from '@gluestack-ui/themed';
import { MapPin, Briefcase, Building2 } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';
import { colors, spacing } from '@/constants/theme';
import type { JobListItem } from '@/types/job';
import type { DashboardJob } from '@/types/dashboard';

type JobCardHorizontalProps = {
  item: JobListItem | DashboardJob;
  onPress: () => void;
};

export const JobCardHorizontal = ({ item, onPress }: JobCardHorizontalProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" padding="md" style={styles.card}>
        <HStack space="md" alignItems="flex-start">
          {/* Sol: Hastane Logosu */}
          <Box
            w={50}
            h={50}
            borderRadius="$lg"
            borderWidth={1}
            borderColor="$coolGray100"
            justifyContent="center"
            alignItems="center"
            bg="$white"
            style={styles.logoContainer}
          >
            <Icon as={Building2} size="md" color={colors.primary[600]} />
          </Box>

          {/* Sağ: İçerik */}
          <VStack flex={1} space="xs">
            <Typography variant="subtitle" style={styles.title} numberOfLines={1}>
              {item.title ?? 'İş İlanı'}
            </Typography>

            <Typography
              variant="bodySecondary"
              style={styles.company}
              numberOfLines={1}
            >
              {item.hospital_name ?? 'Kurum bilgisi yok'}
            </Typography>

            {/* Alt Bilgiler: Lokasyon ve Tip */}
            <HStack space="sm" mt="$1" alignItems="center" flexWrap="wrap">
              <HStack space="xs" alignItems="center">
                <Icon as={MapPin} size="xs" color={colors.neutral[400]} />
                <Typography variant="caption" style={styles.metaText}>
                  {item.city_name ?? '-'}
                </Typography>
              </HStack>

              <Box
                w={3}
                h={3}
                borderRadius="$full"
                bg={colors.neutral[300]}
                mx="$1"
              />

              <HStack space="xs" alignItems="center">
                <Icon as={Briefcase} size="xs" color={colors.neutral[400]} />
                <Typography variant="caption" style={styles.metaText}>
                  {item.work_type ?? '-'}
                </Typography>
              </HStack>
            </HStack>

            {/* Başvuru Durumu */}
            {item.is_applied && (
              <HStack mt="$1">
                <Badge
                  action="success"
                  variant="solid"
                  rounded="$full"
                  px="$2"
                  py="$1"
                >
                  <BadgeText fontSize="$xs">Başvuruldu</BadgeText>
                </Badge>
              </HStack>
            )}
          </VStack>
        </HStack>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    marginRight: spacing.md,
  },
  logoContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontWeight: '600',
    color: colors.text.primary,
    fontSize: 14,
  },
  company: {
    color: colors.primary[600],
    fontWeight: '500',
    fontSize: 12,
  },
  metaText: {
    color: colors.neutral[500],
    fontSize: 11,
  },
});

