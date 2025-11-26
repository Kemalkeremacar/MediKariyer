import React, { ComponentProps } from 'react';
import {
  Button as GSButton,
  ButtonText,
  Spinner,
  HStack,
} from '@gluestack-ui/themed';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'md' | 'lg';

type GSButtonProps = ComponentProps<typeof GSButton>;

interface ButtonProps
  extends Omit<GSButtonProps, 'children' | 'action' | 'variant' | 'size'> {
  label: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const VARIANT_MAP: Record<
  ButtonVariant,
  { action: 'primary' | 'secondary'; variant: 'solid' | 'outline'; textColor: string }
> = {
  primary: { action: 'primary', variant: 'solid', textColor: '#ffffff' },
  secondary: { action: 'secondary', variant: 'solid', textColor: '#ffffff' },
  ghost: { action: 'primary', variant: 'outline', textColor: '#111827' },
};

const SIZE_MAP: Record<ButtonSize, GSButtonProps['size']> = {
  md: 'md',
  lg: 'lg',
};

export const Button = ({
  label,
  loading,
  leftIcon,
  rightIcon,
  variant = 'primary',
  size = 'md',
  fullWidth,
  isDisabled,
  ...rest
}: ButtonProps) => {
  const mapped = VARIANT_MAP[variant];
  const disabled = isDisabled || loading;

  return (
    <GSButton
      {...rest}
      action={mapped.action}
      variant={mapped.variant}
      size={SIZE_MAP[size]}
      isDisabled={disabled}
      width={fullWidth ? '$full' : undefined}
    >
      {loading ? (
        <Spinner color={mapped.textColor} />
      ) : (
        <HStack space="xs" alignItems="center">
          {leftIcon}
          <ButtonText color={mapped.textColor}>{label}</ButtonText>
          {rightIcon}
        </HStack>
      )}
    </GSButton>
  );
};

