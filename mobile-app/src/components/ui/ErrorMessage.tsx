import React from 'react';
import { VStack } from '@gluestack-ui/themed';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  error?: Error | unknown;
}

const getErrorMessage = (error: Error | unknown): { title: string; message: string } => {
  if (!error) {
    return {
      title: 'Bir hata oluştu',
      message: 'Lütfen tekrar deneyin.',
    };
  }

  if (error instanceof Error) {
    // Network errors
    if (error.name === 'NetworkError' || error.message.includes('network') || error.message.includes('bağlanılamıyor')) {
      return {
        title: 'İnternet bağlantısı yok',
        message: 'Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
      };
    }

    // Timeout errors
    if (error.message.includes('zaman aşımı') || error.message.includes('timeout')) {
      return {
        title: 'İstek zaman aşımına uğradı',
        message: 'Sunucuya bağlanmak uzun sürdü. Lütfen tekrar deneyin.',
      };
    }

    // Use error message if available
    if (error.message) {
      return {
        title: 'Bir hata oluştu',
        message: error.message,
      };
    }
  }

  return {
    title: 'Bir hata oluştu',
    message: 'Lütfen tekrar deneyin.',
  };
};

export const ErrorMessage = ({
  title,
  message,
  onRetry,
  retryLabel = 'Tekrar dene',
  error,
}: ErrorMessageProps) => {
  const errorInfo = error ? getErrorMessage(error) : null;
  const finalTitle = title || errorInfo?.title || 'Bir hata oluştu';
  const finalMessage = message || errorInfo?.message || 'Lütfen tekrar deneyin.';

  return (
    <VStack
      space="md"
      alignItems="center"
      justifyContent="center"
      px="$6"
      py="$8"
      style={{ minHeight: 200 }}
    >
      <Typography variant="title" style={{ textAlign: 'center', color: colors.error[700] }}>
        {finalTitle}
      </Typography>
      {finalMessage && (
        <Typography variant="bodySecondary" style={{ textAlign: 'center' }}>
          {finalMessage}
        </Typography>
      )}
      {onRetry && (
        <Button label={retryLabel} onPress={onRetry} variant="primary" style={{ marginTop: spacing.md }} />
      )}
    </VStack>
  );
};

