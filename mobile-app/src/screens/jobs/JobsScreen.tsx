import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Box,
  HStack,
  Text,
  Input as GSInput,
  InputField,
  InputSlot,
  InputIcon,
} from '@gluestack-ui/themed';
import { Search, Filter } from 'lucide-react-native';
import { jobService } from '@/api/services/job.service';
import { lookupService } from '@/api/services/lookup.service';
import { colors, spacing, borderRadius } from '@/constants/theme';
import type { JobListItem, JobsResponse } from '@/types/job';
import { JobsStackParamList } from '@/navigation/JobsStackNavigator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { JobCard } from '@/components/molecules/JobCard';
import { JobFilterSheet } from '@/components/organisms/JobFilterSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

type NavigationProp = NativeStackNavigationProp<JobsStackParamList, 'JobsList'>;

const useJobsQuery = (filters: {
  search: string;
  cityId: string;
  specialtyId: string;
}) =>
  useInfiniteQuery<JobsResponse, Error, JobsResponse, ['jobs', typeof filters], number>({
    queryKey: ['jobs', filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const response = await jobService.listJobs({
        page,
        limit: 10,
        search: filters.search ? filters.search.trim() : undefined,
        city_id: filters.cityId ? Number(filters.cityId) : undefined,
        specialty_id: filters.specialtyId
          ? Number(filters.specialtyId)
          : undefined,
      });
      return response;
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination) {
        return undefined;
      }
      // Backend'den gelen pagination yapısı: { current_page, per_page, total, total_pages, has_next, has_prev }
      if (pagination.has_next) {
        return (pagination.current_page ?? 1) + 1;
      }
      return undefined;
    },
  });

// FilterChip Component (Kariyer.net tarzı)
const FilterChip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Box
      px="$4"
      py="$2"
      mr="$2"
      borderRadius="$full"
      bg={active ? '$primary100' : '$white'}
      borderWidth={1}
      borderColor={active ? '$primary500' : '$coolGray200'}
      style={styles.chip}
    >
      <Text
        fontSize="$xs"
        color={active ? '$primary700' : '$coolGray600'}
        fontWeight={active ? '600' : '400'}
      >
        {label}
      </Text>
    </Box>
  </TouchableOpacity>
);

export const JobsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [cityId, setCityId] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const filterSheetRef = useRef<BottomSheetModal>(null);

  const { data: cities = [] } = useQuery({
    queryKey: ['lookup', 'cities'],
    queryFn: lookupService.getCities,
  });
  const { data: specialties = [] } = useQuery({
    queryKey: ['lookup', 'specialties'],
    queryFn: lookupService.getSpecialties,
  });

  const query = useJobsQuery({ search, cityId, specialtyId });
  const jobs = useMemo(() => {
    const pages =
      (query.data as InfiniteData<JobsResponse, number> | undefined)?.pages ??
      [];
    return pages.flatMap((page) => page.data);
  }, [query.data]);

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  };

  const onRefresh = () => {
    query.refetch();
  };

  const openFilters = useCallback(() => {
    filterSheetRef.current?.present();
  }, []);

  const handleApplyFilters = useCallback(() => {
    filterSheetRef.current?.dismiss();
    query.refetch();
  }, [query]);

  const handleResetFilters = useCallback(() => {
    setCityId('');
    setSpecialtyId('');
    filterSheetRef.current?.dismiss();
    query.refetch();
  }, [query]);

  // Seçili şehir ve uzmanlık isimlerini bul
  const selectedCity = cities.find((c) => c.id.toString() === cityId);
  const selectedSpecialty = specialties.find(
    (s) => s.id.toString() === specialtyId,
  );

  return (
    <Box flex={1} bg="$backgroundLight50">
      {/* Header & Search (Modern, Kariyer.net tarzı) */}
      <Box
        bg="$white"
        px="$4"
        pt={insets.top + spacing.md}
        pb="$3"
        style={styles.header}
      >
        <GSInput
          variant="outline"
          size="md"
          borderRadius="$full"
          bg="$coolGray50"
          borderWidth={0}
          style={styles.searchInput}
        >
          <InputSlot pl="$3">
            <InputIcon as={Search} color="$coolGray400" />
          </InputSlot>
          <InputField
            placeholder="İlan, şehir veya hastane ara..."
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <InputSlot pr="$3">
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text color="$coolGray400">✕</Text>
              </TouchableOpacity>
            </InputSlot>
          )}
        </GSInput>

        {/* Yatay Filtreler (Kariyer.net tarzı) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          <FilterChip
            label="Tüm İlanlar"
            active={!cityId && !specialtyId}
            onPress={handleResetFilters}
          />
          {selectedCity && (
            <FilterChip
              label={selectedCity.name}
              active={true}
              onPress={openFilters}
            />
          )}
          {selectedSpecialty && (
            <FilterChip
              label={selectedSpecialty.name}
              active={true}
              onPress={openFilters}
            />
          )}
          <TouchableOpacity onPress={openFilters} activeOpacity={0.7}>
            <Box
              px="$4"
              py="$2"
              mr="$2"
              borderRadius="$full"
              bg="$white"
              borderWidth={1}
              borderColor="$primary500"
              style={styles.filterButton}
            >
              <HStack space="xs" alignItems="center">
                <Filter size={14} color={colors.primary[600]} />
                <Text fontSize="$xs" color="$primary700" fontWeight="600">
                  Filtrele
                </Text>
              </HStack>
            </Box>
          </TouchableOpacity>
        </ScrollView>
      </Box>

      {/* İlan Listesi */}
      <FlatList
        data={jobs}
        keyExtractor={(item, index) => `job-${item.id}-${index}`}
        renderItem={({ item }) => (
          <JobCard
            item={item}
            onPress={() => navigation.navigate('JobDetail', { id: item.id })}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={query.isRefetching} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator style={styles.listLoader} />
          ) : null
        }
        ListEmptyComponent={
          query.isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
            </View>
          ) : query.isError ? (
            <ErrorMessage
              error={query.error}
              onRetry={() => query.refetch()}
            />
          ) : (
            <EmptyState
              title="İlan bulunamadı"
              description="Filtreleri değiştirerek yeni ilanlara göz at."
            />
          )
        }
        contentContainerStyle={styles.listContent}
      />

      <JobFilterSheet
        ref={filterSheetRef}
        cities={cities}
        specialties={specialties}
        cityId={cityId}
        specialtyId={specialtyId}
        onCityChange={setCityId}
        onSpecialtyChange={setSpecialtyId}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    marginBottom: spacing.sm,
  },
  filterScroll: {
    marginTop: spacing.sm,
  },
  filterContainer: {
    paddingRight: spacing.lg,
  },
  chip: {
    minHeight: 32,
  },
  filterButton: {
    minHeight: 32,
  },
  loader: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  listLoader: {
    marginVertical: spacing.lg,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
});


