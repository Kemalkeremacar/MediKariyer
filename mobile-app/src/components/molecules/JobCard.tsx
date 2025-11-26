import { Pressable } from 'react-native';
import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  BadgeText,
  Icon,
} from '@gluestack-ui/themed';
import { Briefcase, MapPin } from 'lucide-react-native';
import type { JobListItem } from '@/types/job';

type JobCardProps = {
  item: JobListItem;
  onPress: () => void;
};

export const JobCard = ({ item, onPress }: JobCardProps) => (
  <Pressable onPress={onPress} className="mb-3">
    <Box
      borderWidth={1}
      borderColor="$borderLight"
      borderRadius="$xl"
      p="$4"
      bg="$backgroundLight0"
      sx={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <HStack justifyContent="space-between" alignItems="center" mb="$2">
        <VStack space="xs" flex={1}>
          <Text fontSize="$md" fontWeight="$semibold" color="$textDark900">
            {item.title ?? 'İş İlanı'}
          </Text>
          <Text fontSize="$sm" color="$textLight700">
            {item.hospital_name ?? 'Kurum bilgisi yok'}
          </Text>
        </VStack>
        {item.is_applied && (
          <Badge action="success" variant="solid" rounded="$full" px="$2" py="$1">
            <BadgeText fontSize="$xs">Başvuruldu</BadgeText>
          </Badge>
        )}
      </HStack>

      <VStack space="sm">
        <HStack space="sm" alignItems="center">
          <Icon as={MapPin} size="xs" color="$textLight700" />
          <Text fontSize="$sm" color="$textLight700">
            {item.city_name ?? '-'}
          </Text>
        </HStack>
        <HStack space="sm" alignItems="center">
          <Icon as={Briefcase} size="xs" color="$textLight700" />
          <Text fontSize="$sm" color="$textLight700">
            {item.work_type ?? '-'}
          </Text>
        </HStack>
        {item.salary_range && (
          <Text fontSize="$sm" color="$textDark900" fontWeight="$semibold">
            {item.salary_range}
          </Text>
        )}
      </VStack>
    </Box>
  </Pressable>
);


