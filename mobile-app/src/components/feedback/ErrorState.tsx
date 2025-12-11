import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Bir Hata Oluştu',
  message = 'Bir şeyler yanlış gitti. Lütfen tekrar deneyin.',
  onRetry,
  retryText = 'Tekrar Dene',
  fullScreen = false,
}) => {
  return (
    <View className={fullScreen ? 'flex-1 items-center justify-center bg-white px-6' : 'items-center justify-center py-12 px-6'}>
      <Ionicons name="alert-circle" size={64} color={colors.error[500]} />
      <Text className="mt-6 text-xl font-semibold text-neutral-900 text-center">
        {title}
      </Text>
      <Text className="mt-2 text-base text-neutral-600 text-center">
        {message}
      </Text>
      {onRetry && (
        <View className="mt-6">
          <Button onPress={onRetry} variant="primary">
            {retryText}
          </Button>
        </View>
      )}
    </View>
  );
};
