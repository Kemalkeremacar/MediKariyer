import React from 'react';
import { VStack, Box } from '@gluestack-ui/themed';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { Search, Briefcase, Bell, User } from 'lucide-react-native';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  type?: 'default' | 'search' | 'jobs' | 'notifications' | 'profile';
}

const getDefaultIcon = (type?: string) => {
  switch (type) {
    case 'search':
      return <Search size={64} color={colors.primary[400]} />;
    case 'jobs':
      return <Briefcase size={64} color={colors.primary[400]} />;
    case 'notifications':
      return <Bell size={64} color={colors.primary[400]} />;
    case 'profile':
      return <User size={64} color={colors.primary[400]} />;
    default:
      return null;
  }
};

export const EmptyState = ({
  title,
  description,
  action,
  icon,
  type,
}: EmptyStateProps) => {
  const displayIcon = icon || getDefaultIcon(type);

  return (
    <VStack
      space="lg"
      alignItems="center"
      justifyContent="center"
      px="$6"
      py="$12"
      style={{ minHeight: 300 }}
    >
      {displayIcon && (
        <Box
          w={120}
          h={120}
          borderRadius="$full"
          bg="$primary50"
          justifyContent="center"
          alignItems="center"
        >
          {displayIcon}
        </Box>
      )}
      {title && (
        <Typography
          variant="heading"
          style={{
            textAlign: 'center',
            color: colors.text.primary,
            fontWeight: '600',
          }}
        >
          {title}
        </Typography>
      )}
      {description && (
        <Typography
          variant="bodySecondary"
          style={{
            textAlign: 'center',
            color: colors.text.secondary,
            lineHeight: 22,
            maxWidth: 280,
          }}
        >
          {description}
        </Typography>
      )}
      {action && <Box mt="$2">{action}</Box>}
    </VStack>
  );
};

