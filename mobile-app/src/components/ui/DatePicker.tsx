import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { colors, spacing } from '@/theme';
import { formatDate as formatDateUtil } from '@/utils/date';

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Tarih seçin',
  minimumDate,
  maximumDate,
  disabled = false,
  error,
}) => {
  const [show, setShow] = useState(false);

  const formatDateDisplay = (date: Date) => {
    return formatDateUtil(date);
  };

  const handlePress = () => {
    if (!disabled) {
      setShow(true);
    }
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (selectedDate) {
      onChange(selectedDate);
      if (Platform.OS === 'ios') {
        setShow(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Typography variant="body" style={styles.label}>
          {label}
        </Typography>
      )}
      <TouchableOpacity
        style={[
          styles.input,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <Ionicons name="calendar" size={20} color={value ? colors.primary[600] : colors.neutral[400]} />
        <Typography
          variant="body"
          style={value ? styles.text : styles.placeholder}
        >
          {value ? formatDateDisplay(value) : placeholder}
        </Typography>
      </TouchableOpacity>
      {error && (
        <Typography variant="caption" style={styles.error}>
          {error}
        </Typography>
      )}
      
      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error[500],
  },
  inputDisabled: {
    backgroundColor: colors.neutral[50],
    opacity: 0.6,
  },
  text: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
  },
  placeholder: {
    color: colors.neutral[400],
  },
  error: {
    color: colors.error[600],
    fontSize: 12,
  },
});
