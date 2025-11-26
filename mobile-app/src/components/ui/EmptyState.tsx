import React from 'react';
import { VStack } from '@gluestack-ui/themed';
import { Typography } from '@/components/ui/Typography';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <VStack space="sm" alignItems="center" px="$6" py="$8">
    {title && (
      <Typography variant="title" style={{ textAlign: 'center' }}>
        {title}
      </Typography>
    )}
    {description && (
      <Typography variant="bodySecondary" style={{ textAlign: 'center' }}>
        {description}
      </Typography>
    )}
    {action}
  </VStack>
);

