/**
 * @file CongressDetailScreen.tsx
 * @description Kongre detay ekranı - Kongre bilgilerini görüntüleme
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { CongressesStackParamList } from '@/navigation/types';
import { colors, spacing, borderRadius } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { formatDate } from '@/utils/date';
import { useCongressDetail } from '../hooks/useCongressDetail';
import { Image } from 'expo-image';

type Props = NativeStackScreenProps<CongressesStackParamList, 'CongressDetail'>;

export const CongressDetailScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;

  const {
    data: congress,
    isLoading,
    isError,
  } = useCongressDetail(id);

  const handleOpenWebsite = () => {
    if (congress?.website_url) {
      const url = congress.website_url.startsWith('http') 
        ? congress.website_url 
        : `https://${congress.website_url}`;
      Linking.openURL(url);
    }
  };

  const getDaysDuration = () => {
    if (!congress) return null;
    const start = new Date(congress.start_date);
    const end = new Date(congress.end_date);
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return duration;
  };

  const getCongressStatus = () => {
    if (!congress) return null;
    const start = new Date(congress.start_date);
    const end = new Date(congress.end_date);
    const now = new Date();
    
    // Gün bazında karşılaştırma için saatleri sıfırla
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const daysToStart = Math.round((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysToEnd = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Henüz başlamamış kongreler
    if (daysToStart > 0) {
      return null; // Status gösterme
    }
    
    // Bugün başlayan kongreler
    if (daysToStart === 0) {
      if (daysToEnd === 0) {
        return { label: 'Bugün (Tek Gün)', color: colors.warning[600] };
      }
      return { label: 'Bugün Başlıyor', color: colors.warning[600] };
    }
    
    // Devam eden kongreler
    if (daysToEnd > 0) {
      return { label: 'Devam Ediyor', color: colors.primary[600] };
    }
    
    // Bugün biten kongreler
    if (daysToEnd === 0) {
      return { label: 'Son Gün', color: colors.warning[600] };
    }
    
    // Bu duruma hiç gelmemeli çünkü backend bitmiş kongreleri filtreliyor
    return null;
  };

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      </Screen>
    );
  }

  if (isError || !congress) {
    return (
      <Screen scrollable={false}>
        <View style={[styles.centerContainer, { padding: spacing.lg }]}>
          <Typography variant="h3" style={{ marginBottom: spacing.md }}>
            Kongre detayları yüklenemedi
          </Typography>
          <Button 
            label="Geri Dön" 
            variant="secondary" 
            onPress={() => navigation.goBack()} 
          />
        </View>
      </Screen>
    );
  }

  const status = getCongressStatus();
  const duration = getDaysDuration();
  const locationText = [congress.city, congress.country].filter(Boolean).join(', ');

  return (
    <Screen scrollable={false} contentContainerStyle={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Typography variant="h3" style={styles.headerTitle} numberOfLines={2}>
              {congress.title}
            </Typography>
          </View>

          {status && (
            <View style={[styles.statusDot, { backgroundColor: status.color }]}>
              <Ionicons name="time" size={16} color="#ffffff" />
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Görsel */}
        {(congress.image_url || congress.poster_image_url) && (
          <Card variant="elevated" style={styles.imageCard}>
            {congress.image_url ? (
              <View style={styles.bannerImageContainer}>
                <Image
                  source={{ uri: congress.image_url }}
                  style={styles.bannerImage}
                  contentFit="contain"
                  transition={200}
                />
              </View>
            ) : (
              <View style={styles.posterImageContainer}>
                <Image
                  source={{ uri: congress.poster_image_url }}
                  style={styles.posterImage}
                  contentFit="contain"
                  transition={200}
                />
              </View>
            )}
          </Card>
        )}

        {/* Status Badge */}
        {status && (
          <View style={[styles.statusBadge, { backgroundColor: `${status.color}15`, borderColor: `${status.color}40` }]}>
            <Ionicons name="time" size={16} color={status.color} />
            <Typography variant="body" style={[styles.statusText, { color: status.color }] as any}>
              {status.label}
            </Typography>
          </View>
        )}

        {/* Uzmanlık Badges */}
        {(congress.specialties && congress.specialties.length > 0) || congress.specialty_name || congress.subspecialty_name ? (
          <View style={styles.specialtyContainer}>
            {congress.specialties && congress.specialties.length > 0 ? (
              congress.specialties.map((s: { id: number; name: string }) => (
                <View key={s.id} style={styles.specialtyBadge}>
                  <Ionicons name="medical" size={14} color={colors.primary[700]} />
                  <Typography variant="caption" style={styles.specialtyText}>
                    {s.name}
                  </Typography>
                </View>
              ))
            ) : congress.specialty_name ? (
              <View style={styles.specialtyBadge}>
                <Ionicons name="medical" size={14} color={colors.primary[700]} />
                <Typography variant="caption" style={styles.specialtyText}>
                  {congress.specialty_name}
                </Typography>
              </View>
            ) : null}
            {congress.subspecialty_name && (
              <View style={[styles.specialtyBadge, styles.subspecialtyBadge]}>
                <Ionicons name="git-branch" size={14} color={colors.secondary[700]} />
                <Typography variant="caption" style={styles.subspecialtyText}>
                  {congress.subspecialty_name}
                </Typography>
              </View>
            )}
          </View>
        ) : null}

        {/* Tarih Bilgileri */}
        <Card variant="elevated" padding="2xl" style={styles.contentCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="calendar" size={20} color={colors.primary[600]} />
            </View>
            <Typography variant="h3" style={styles.sectionTitle}>
              Tarih Bilgileri
            </Typography>
          </View>
          <View style={styles.dateInfoGrid}>
            <View style={styles.dateInfoItem}>
              <Typography variant="caption" style={styles.dateInfoLabel}>
                Başlangıç
              </Typography>
              <Typography variant="body" style={styles.dateInfoValue}>
                {formatDate(congress.start_date)}
              </Typography>
            </View>
            <View style={styles.dateInfoItem}>
              <Typography variant="caption" style={styles.dateInfoLabel}>
                Bitiş
              </Typography>
              <Typography variant="body" style={styles.dateInfoValue}>
                {formatDate(congress.end_date)}
              </Typography>
            </View>
            {duration && (
              <View style={styles.dateInfoItem}>
                <Typography variant="caption" style={styles.dateInfoLabel}>
                  Süre
                </Typography>
                <Typography variant="body" style={styles.dateInfoValue}>
                  {duration} gün
                </Typography>
              </View>
            )}
          </View>
        </Card>

        {/* Organizatör */}
        {congress.organizer && (
          <Card variant="elevated" padding="2xl" style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="people" size={20} color={colors.primary[600]} />
              </View>
              <Typography variant="h3" style={styles.sectionTitle}>
                Organizatör
              </Typography>
            </View>
            <Typography variant="body" style={styles.organizerText}>
              {congress.organizer}
            </Typography>
          </Card>
        )}

        {/* Konum */}
        {(congress.location || locationText) && (
          <Card variant="elevated" padding="2xl" style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="location" size={20} color={colors.primary[600]} />
              </View>
              <Typography variant="h3" style={styles.sectionTitle}>
                Konum
              </Typography>
            </View>
            {congress.location && (
              <Typography variant="body" style={styles.locationText}>
                {congress.location}
              </Typography>
            )}
            {locationText && (
              <Typography variant="body" style={styles.locationSubtext}>
                {locationText}
              </Typography>
            )}
          </Card>
        )}

        {/* Açıklama */}
        {congress.description && (
          <Card variant="elevated" padding="2xl" style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="document-text" size={20} color={colors.primary[600]} />
              </View>
              <Typography variant="h3" style={styles.sectionTitle}>
                Hakkında
              </Typography>
            </View>
            <View style={styles.descriptionBox}>
              <Typography variant="body" style={styles.descriptionText}>
                {congress.description}
              </Typography>
            </View>
          </Card>
        )}

        {/* Web Sitesi */}
        {congress.website_url && (
          <Card variant="elevated" padding="2xl" style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="globe" size={20} color={colors.primary[600]} />
              </View>
              <Typography variant="h3" style={styles.sectionTitle}>
                Web Sitesi
              </Typography>
            </View>
            <Button
              label="Kongre Web Sitesine Git"
              variant="primary"
              onPress={handleOpenWebsite}
              icon={<Ionicons name="open-outline" size={18} color="#ffffff" />}
            />
          </Card>
        )}
      </ScrollView>

      {/* Alt Buton */}
      <View style={styles.bottomButtons}>
        <Button
          label="Geri"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.bottomBackButton}
          size="sm"
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientHeader: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 17,
  },
  statusDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  imageCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  bannerImageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.neutral[50],
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  posterImageContainer: {
    width: '100%',
    maxWidth: 300,
    aspectRatio: 2 / 3,
    alignSelf: 'center',
    backgroundColor: colors.neutral[50],
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 13,
  },
  specialtyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  specialtyText: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  subspecialtyBadge: {
    backgroundColor: colors.secondary[50],
    borderColor: colors.secondary[100],
  },
  subspecialtyText: {
    color: colors.secondary[700],
    fontWeight: '600',
  },
  contentCard: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    flex: 1,
  },
  dateInfoGrid: {
    gap: spacing.md,
  },
  dateInfoItem: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dateInfoLabel: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  dateInfoValue: {
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  organizerText: {
    color: colors.text.primary,
    lineHeight: 22,
  },
  locationText: {
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  locationSubtext: {
    color: colors.text.secondary,
  },
  descriptionBox: {
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  descriptionText: {
    color: colors.text.primary,
    lineHeight: 22,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  bottomBackButton: {
    flex: 1,
    minHeight: 38,
  },
});
