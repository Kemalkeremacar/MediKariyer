import React from 'react';
import {
  Input as GSInput,
  InputField,
  InputSlot,
  VStack,
} from '@gluestack-ui/themed';
import type { ComponentProps } from 'react';
import type { TextInputProps } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  containerStyle?: ComponentProps<typeof GSInput>['style'];
}

export const Input = ({
  prefix,
  suffix,
  containerStyle,
  multiline,
  ...rest
}: InputProps) => (
  <VStack>
    <GSInput
      variant="outline"
      size={multiline ? 'lg' : 'md'}
      style={containerStyle}
    >
      {prefix && <InputSlot pl="$3">{prefix}</InputSlot>}
      <InputField multiline={multiline} {...rest} />
      {suffix && <InputSlot pr="$3">{suffix}</InputSlot>}
    </GSInput>
  </VStack>
);

