import React, { useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useDoctorDashboard } from '@/hooks/useDoctorDashboard';
import { notificationService } from '@/api/services/notification.service';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/theme';
import type { DashboardApplication, DashboardJob } from '@/types/dashboard';
import type { NotificationItem } from '@/types/notification';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { JobCardHorizontal } from '@/components/molecules/JobCardHorizontal';
import { StatBox } from '@/components/molecules/StatBox';
import {
  Box,
  VStack,
  HStack,
  Badge,
  BadgeText,
  Spinner,
  Input as GSInput,
  InputField,
  InputSlot,
  InputIcon,
  Icon,
} from '@gluestack-ui/themed';
import {
  Search,
  ArrowRight,
  MapPin,
  Briefcase,
  Bell,
  User,
  TrendingUp,
} from 'lucide-react-native';
import { MainTabParamList } from '@/navigation/MainNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const STATUS_COLORS: Record<
  string,
  { text: string; border: string; bg: string }
> = {
  Başvuruldu: {
    text: colors.warning[800],
    border: colors.warning[300],
    bg: colors.warning[100],
  },
  İnceleniyor: {
    text: colors.primary[700],
    border: colors.primary[200],
    bg: colors.primary[100],
  },
  'Kabul Edildi': {
    text: colors.success[800],
    border: colors.success[300],
    bg: colors.success[100],
  },
  'Red Edildi': {
    text: colors.error[800],
    border: colors.error[300],
    bg: colors.error[100],
  },
  'Geri Çekildi': {
    text: colors.neutral[700],
    border: colors.neutral[200],
    bg: colors.neutral[100],
  },
};

const NEUTRAL_BADGE = {
  borderColor: colors.border.light,
  backgroundColor: colors.neutral[100],
  color: colors.neutral[700],
};

const formatBadgeStyle = (status?: string | null) => {
  if (!status) {
    return NEUTRAL_BADGE;
  }
  const palette = STATUS_COLORS[status] ?? null;
  if (!palette) {
    return NEUTRAL_BADGE;
  }
  return {
    borderColor: palette.border,
    backgroundColor: palette.bg,
    color: palette.text,
  };
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }
  try {
    return new Date(value).toLocaleDateString('tr-TR');
  } catch {
    return value;
  }
};

const StatusBadge = ({ status }: { status?: string | null }) => {
  const palette = formatBadgeStyle(status);
  return (
    <Badge
      borderWidth={1}
      borderColor={palette.borderColor}
      backgroundColor={palette.backgroundColor}
      rounded="$full"
      px="$2"
      py="$1"
    >
      <BadgeText color={palette.color} fontSize="$xs">
        {status ?? 'Durum bilinmiyor'}
      </BadgeText>
    </Badge>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <Typography variant="title" style={styles.sectionTitle}>
    {title}
  </Typography>
);

// Popüler Arama Chip Component
const PopularSearchChip = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Box
      px="$4"
      py="$2"
      mr="$2"
      borderRadius="$full"
      bg="$white"
      borderWidth={1}
      borderColor="$coolGray200"
      style={styles.popularChip}
    >
      <Typography variant="caption" style={styles.chipText}>
        {label}
      </Typography>
    </Box>
  </TouchableOpacity>
);

export const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<MainTabParamList>>();
  const user = useAuthStore((state) => state.user);
  const firstName = user?.first_name ?? 'Doktor';
  const lastName = user?.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Doktor';
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, isError, refetch, isRefetching } =
    useDoctorDashboard();

  const popularSearches = [
    'Kardiyolog',
    'Nörolog',
    'Dahiliye Uzmanı',
    'İstanbul',
  ];

  const handleSearchPress = () => {
    navigation.navigate('JobsTab');
  };

  // Bildirimler için query (ilk 5 bildirim)
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', 'dashboard'],
    queryFn: async () => {
      const response = await notificationService.listNotifications({
        page: 1,
        limit: 5,
      });
      return response;
    },
  });

  const recentNotifications = notificationsData?.data || [];

  const renderFeaturedJobs = (items: DashboardJob[]) => {
    if (!items.length) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {items.slice(0, 5).map((item, index) => (
          <JobCardHorizontal
            key={`featured-${item.id}-${index}`}
            item={item}
            onPress={() => {
              navigation.navigate('JobsTab', {
                screen: 'JobDetail',
                params: { id: item.id },
              });
            }}
          />
        ))}
      </ScrollView>
    );
  };

  const renderApplications = (items: DashboardApplication[]) => {
    if (!items.length) {
      return (
        <EmptyState
          title="Henüz başvuru yapılmadı"
          description="Yeni fırsatlara göz atarak başvurularını başlatabilirsin."
        />
      );
    }

    return (
      <VStack space="md">
        {items.slice(0, 3).map((item, index) => (
          <Card
            key={`app-${item.id}-${index}`}
            variant="elevated"
            padding="md"
            style={styles.listCard}
          >
            <Typography variant="subtitle">
              {item.job_title ?? 'İlan'}
            </Typography>
            <Typography variant="bodySecondary" style={styles.listSubtitle}>
              {item.hospital_name ?? 'Kurum bilgisi yok'}
            </Typography>
            <HStack mt="$2" justifyContent="space-between" alignItems="center">
              <StatusBadge status={item.status} />
              <Typography variant="caption" style={styles.listDate}>
                {formatDate(item.created_at)}
              </Typography>
            </HStack>
          </Card>
        ))}
        {items.length > 3 && (
          <Button
            label="Tümünü Gör"
            variant="ghost"
            onPress={() => navigation.navigate('Applications')}
            rightIcon={<ArrowRight size={16} color={colors.primary[600]} />}
          />
        )}
      </VStack>
    );
  };

  if (isLoading && !data) {
    return (
      <ScreenContainer scrollable={false} contentContainerStyle={styles.loader}>
        <Spinner size="large" color="$primary600" />
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer scrollable={false} contentContainerStyle={styles.loader}>
        <ErrorMessage
          error={isError ? new Error('Dashboard yüklenemedi') : undefined}
          onRetry={() => refetch()}
        />
      </ScreenContainer>
    );
  }

  return (
    <Box flex={1} bg="$backgroundLight50">
      {/* Header & Search (Kariyer.net tarzı) */}
      <Box
        bg="$white"
        px="$4"
        pt={insets.top + spacing.md}
        pb="$3"
        style={styles.header}
      >
        {/* Kullanıcı Bilgisi ve Bildirim */}
        <HStack justifyContent="space-between" alignItems="center" mb="$3">
          <HStack space="md" alignItems="center" flex={1}>
            {/* Profil Fotoğrafı */}
            <Box
              w={48}
              h={48}
              borderRadius="$full"
              bg="$primary100"
              justifyContent="center"
              alignItems="center"
              borderWidth={2}
              borderColor="$primary200"
            >
              <Icon as={User} size="lg" color={colors.primary[600]} />
            </Box>
            <VStack flex={1}>
              <Typography variant="body" style={styles.userGreeting}>
                Merhaba
              </Typography>
              <Typography variant="subtitle" style={styles.userName} numberOfLines={1}>
                {fullName}
              </Typography>
            </VStack>
          </HStack>
          {/* Bildirim İkonu */}
          <TouchableOpacity
            onPress={() => {
              // Bildirimler zaten Dashboard'da gösteriliyor
              // ScrollView'e scroll yapılabilir veya hiçbir şey yapılmayabilir
            }}
            activeOpacity={0.7}
            style={styles.notificationButton}
          >
            <Box position="relative">
              <Icon as={Bell} size="lg" color={colors.neutral[600]} />
              {data && data.unread_notifications_count > 0 && (
                <Box
                  position="absolute"
                  top={-4}
                  right={-4}
                  w={18}
                  h={18}
                  borderRadius="$full"
                  bg="$error500"
                  justifyContent="center"
                  alignItems="center"
                  borderWidth={2}
                  borderColor="$white"
                >
                  <Typography
                    variant="caption"
                    style={styles.notificationBadge}
                  >
                    {data.unread_notifications_count > 9
                      ? '9+'
                      : data.unread_notifications_count}
                  </Typography>
                </Box>
              )}
            </Box>
          </TouchableOpacity>
        </HStack>

        {/* Arama Çubuğu */}
        <TouchableOpacity onPress={handleSearchPress} activeOpacity={0.7}>
          <GSInput
            variant="outline"
            size="lg"
            borderRadius="$full"
            bg="$coolGray50"
            borderWidth={0}
            style={styles.searchInput}
            isReadOnly
          >
            <InputSlot pl="$4">
              <InputIcon as={Search} color="$coolGray400" size="lg" />
            </InputSlot>
            <InputField
              placeholder="Pozisyon veya şirket ara..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchField}
            />
          </GSInput>
        </TouchableOpacity>
      </Box>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Hızlı İstatistikler */}
        <Box px="$4" py="$3">
          <HStack space="md">
            <StatBox
              label="Bildirim"
              value={data.unread_notifications_count}
              subtext="Okunmamış"
              icon={<Icon as={Bell} size="md" color={colors.primary[600]} />}
            />
            <StatBox
              label="Profil"
              value={`${data.profile_completion_percent}%`}
              subtext="Tamamlanma"
              icon={<Icon as={User} size="md" color={colors.primary[600]} />}
            />
          </HStack>
        </Box>

        {/* Sana Özel İlanlar */}
        {data.recommended_jobs && data.recommended_jobs.length > 0 && (
          <Box px="$4" py="$2">
            <HStack justifyContent="space-between" alignItems="center" mb="$3">
              <HStack space="sm" alignItems="center">
                <Icon as={TrendingUp} size="md" color={colors.primary[600]} />
                <Typography variant="title" style={styles.sectionTitle}>
                  Sana Özel İlanlar
                </Typography>
              </HStack>
              <TouchableOpacity onPress={handleSearchPress}>
                <Typography
                  variant="bodySecondary"
                  style={styles.seeAllLink}
                >
                  Tümünü Gör
                </Typography>
              </TouchableOpacity>
            </HStack>
            {renderFeaturedJobs(data.recommended_jobs)}
          </Box>
        )}

        {/* Profil Tamamlanma Banner */}
        {data.profile_completion_percent < 100 && (
          <Box px="$4" py="$2">
            <Card variant="outlined" style={styles.profileBanner}>
              <HStack space="md" alignItems="center">
                <Box
                  w={48}
                  h={48}
                  borderRadius="$full"
                  bg="$primary100"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Icon as={User} size="lg" color={colors.primary[600]} />
                </Box>
                <VStack flex={1} space="xs">
                  <Typography variant="subtitle" style={styles.bannerTitle}>
                    Profilini Tamamla
                  </Typography>
                  <Typography variant="caption" style={styles.bannerText}>
                    Profilini %100 tamamlayarak daha fazla iş fırsatına eriş.
                  </Typography>
                  <Box
                    w="100%"
                    h={6}
                    borderRadius="$full"
                    bg="$coolGray100"
                    mt="$2"
                  >
                    <Box
                      w={`${data.profile_completion_percent}%`}
                      h="100%"
                      borderRadius="$full"
                      bg="$primary600"
                    />
                  </Box>
                </VStack>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile')}
                  activeOpacity={0.7}
                >
                  <Icon
                    as={ArrowRight}
                    size="md"
                    color={colors.primary[600]}
                  />
                </TouchableOpacity>
              </HStack>
            </Card>
          </Box>
        )}

        {/* Bildirimler */}
        {recentNotifications.length > 0 && (
          <Box px="$4" py="$2">
            <HStack space="sm" alignItems="center" mb="$3">
              <Icon as={Bell} size="md" color={colors.primary[600]} />
              <Typography variant="title" style={styles.sectionTitle}>
                Bildirimler
              </Typography>
            </HStack>
            <VStack space="sm">
              {recentNotifications.slice(0, 3).map((notification, index) => (
                <Card
                  key={`notif-${notification.id}-${index}`}
                  variant="elevated"
                  padding="md"
                  style={[
                    styles.listCard,
                    !notification.is_read && styles.unreadNotification,
                  ]}
                >
                  <Typography variant="subtitle" numberOfLines={1}>
                    {notification.title || 'Bildirim'}
                  </Typography>
                  <Typography
                    variant="bodySecondary"
                    style={styles.listSubtitle}
                    numberOfLines={2}
                  >
                    {notification.body || '-'}
                  </Typography>
                  <Typography variant="caption" style={styles.listDate}>
                    {formatDate(notification.created_at)}
                  </Typography>
                </Card>
              ))}
            </VStack>
          </Box>
        )}

        {/* Son Başvurular */}
        <Box px="$4" py="$2">
          <SectionTitle title="Son Başvurular" />
          {renderApplications(data.recent_applications)}
        </Box>
      </ScrollView>
    </Box>
  );
};

const styles = StyleSheet.create({
  loader: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userGreeting: {
    color: colors.neutral[500],
    fontSize: 12,
  },
  userName: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
    fontSize: 16,
  },
  notificationButton: {
    padding: spacing.xs,
  },
  notificationBadge: {
    color: colors.background.primary,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
  },
  searchInput: {
    marginBottom: 0,
  },
  searchField: {
    fontSize: 15,
  },
  popularLabel: {
    color: colors.neutral[500],
    fontWeight: typography.fontWeight.medium,
  },
  popularContainer: {
    paddingRight: spacing.lg,
  },
  popularChip: {
    minHeight: 32,
  },
  chipText: {
    color: colors.neutral[700],
    fontWeight: typography.fontWeight.medium,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  horizontalScroll: {
    paddingRight: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: typography.fontWeight.bold,
    fontSize: 18,
  },
  listCard: {
    marginBottom: spacing.md,
  },
  listSubtitle: {
    marginTop: spacing.xs,
  },
  listDate: {
    color: colors.neutral[500],
  },
  seeAllLink: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    fontSize: 14,
  },
  profileBanner: {
    padding: spacing.md,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  bannerTitle: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  bannerText: {
    color: colors.neutral[600],
    fontSize: 12,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
});

