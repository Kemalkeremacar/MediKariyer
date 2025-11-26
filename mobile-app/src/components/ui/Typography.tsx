import React from 'react';
import { Text } from '@gluestack-ui/themed';
import type { ComponentProps } from 'react';

type Variant =
  | 'heading'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodySecondary'
  | 'caption';

type GSUITextProps = ComponentProps<typeof Text>;

type VariantProps = {
  fontSize: GSUITextProps['fontSize'];
  fontWeight?: GSUITextProps['fontWeight'];
  color: GSUITextProps['color'];
  lineHeight?: GSUITextProps['lineHeight'];
};

interface TypographyProps extends Omit<GSUITextProps, 'children'> {
  variant?: Variant;
  children: React.ReactNode;
}

const VARIANT_MAP: Record<Variant, VariantProps> = {
  heading: {
    fontSize: '$2xl',
    fontWeight: '$bold',
    color: '$textDark900',
    lineHeight: '$2xl',
  },
  title: {
    fontSize: '$lg',
    fontWeight: '$semibold',
    color: '$textDark900',
    lineHeight: '$lg',
  },
  subtitle: {
    fontSize: '$md',
    fontWeight: '$medium',
    color: '$textLight700',
  },
  body: {
    fontSize: '$md',
    color: '$textDark800',
  },
  bodySecondary: {
    fontSize: '$md',
    color: '$textLight700',
  },
  caption: {
    fontSize: '$sm',
    color: '$textLight500',
  },
};

export const Typography = ({
  variant = 'body',
  style,
  children,
  ...rest
}: TypographyProps) => {
  const variantProps = VARIANT_MAP[variant];
  return (
    <Text
      {...rest}
      fontSize={variantProps.fontSize}
      fontWeight={variantProps.fontWeight}
      color={variantProps.color}
      lineHeight={variantProps.lineHeight}
      style={style}
    >
      {children}
    </Text>
  );
};