import React from 'react';
import { View, Text } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  fullScreen?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'Henüz İçerik Yok',
  message = 'Burada görüntülenecek bir şey bulunamadı.',
  actionText,
  onAction,
  fullScreen = false,
}) => {
  return (
    <View className={fullScreen ? 'flex-1 items-center justify-center bg-white px-6' : 'items-center justify-center py-12 px-6'}>
      {icon || <Inbox size={64} color={colors.neutral[400]} strokeWidth={1.5} />}
      <Text className="mt-6 text-xl font-semibold text-neutral-900 text-center">
        {title}
      </Text>
      <Text className="mt-2 text-base text-neutral-600 text-center">
        {message}
      </Text>
      {actionText && onAction && (
        <View className="mt-6">
          <Button onPress={onAction} variant="primary">
            {actionText}
          </Button>
        </View>
      )}
    </View>
  );
};
