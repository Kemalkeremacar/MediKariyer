import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { colors } from '@/theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'large',
  fullScreen = false,
}) => {
  const content = (
    <View className={fullScreen ? 'flex-1 items-center justify-center bg-white' : 'items-center justify-center py-8'}>
      <ActivityIndicator size={size} color={colors.primary[600]} />
      {message && (
        <Text className="mt-4 text-base text-neutral-600 text-center px-4">
          {message}
        </Text>
      )}
    </View>
  );

  return content;
};
