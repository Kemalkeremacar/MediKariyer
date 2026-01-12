/**
 * @file FormField.tsx
 * @description Form alanı wrapper bileşeni
 * 
 * Özellikler:
 * - Etiket gösterimi
 * - Zorunlu alan işareti (*)
 * - Hata mesajı gösterimi
 * - Özelleştirilebilir stil
 * - Herhangi bir form input'u için wrapper
 * 
 * Kullanım:
 * ```tsx
 * <FormField label="E-posta" required error={errors.email}>
 *   <Input value={email} onChange={setEmail} />
 * </FormField>
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';

/**
 * FormField bileşeni props interface'i
 */
interface FormFieldProps {
  /** Etiket metni */
  label?: string;
  /** Hata mesajı */
  error?: string;
  /** Zorunlu alan mı? */
  required?: boolean;
  /** Container stili */
  containerStyle?: ViewStyle;
  /** Etiket stili */
  labelStyle?: TextStyle;
  /** Form input bileşeni */
  children: React.ReactNode;
}

/**
 * Form Alanı Wrapper Bileşeni
 * Etiket, hata mesajı ve zorunlu alan işareti ile form input'larını sarar
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  containerStyle,
  labelStyle,
  children,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      {children}
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
