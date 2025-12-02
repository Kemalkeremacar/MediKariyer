import React from 'react';
import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Input, InputProps } from './Input';

interface FormFieldProps extends InputProps {
  label?: string;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  containerStyle,
  labelStyle,
  ...inputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <Input {...inputProps} />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  error: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
});
