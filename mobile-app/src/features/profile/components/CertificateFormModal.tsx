/**
 * @file CertificateFormModal.tsx
 * @description Sertifika ekleme/düzenleme modal formu
 * @author MediKariyer Development Team
 * @version 1.0.0
 * 
 * **ÖZELLİKLER:**
 * - Sertifika adı, kurum, yıl girişi
 * - Form validasyonu
 * - Ekleme ve güncelleme işlemleri
 * - Navigation screen olarak çalışır (modal değil)
 * 
 * **FORM ALANLARI:**
 * - Sertifika Adı (zorunlu)
 * - Veren Kurum (zorunlu)
 * - Alınma Yılı (opsiyonel, 4 haneli)
 * 
 * **NOT:** Root-level BottomSheetModalProvider kullanır (App.tsx)
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';
import { useCertificate } from '@/features/profile/hooks/useCertificates';
import type { CreateCertificatePayload, UpdateCertificatePayload } from '@/types/profile';
import type { ProfileStackParamList } from '@/navigation/types';

type CertificateFormModalRouteProp = RouteProp<ProfileStackParamList, 'CertificateFormModal'>;
type CertificateFormModalNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'CertificateFormModal'>;

interface CertificateFormModalProps {
  onSubmit?: (data: CreateCertificatePayload | UpdateCertificatePayload) => void;
  isLoading?: boolean;
}

export const CertificateFormModal: React.FC<CertificateFormModalProps> = ({
  onSubmit: onSubmitProp,
  isLoading: isLoadingProp = false,
}) => {
  const navigation = useNavigation<CertificateFormModalNavigationProp>();
  const route = useRoute<CertificateFormModalRouteProp>();
  const certificate = route.params?.certificate;
  
  const certificateMutations = useCertificate();
  
  // Combined loading state
  const isLoading = isLoadingProp || certificateMutations.create.isPending || certificateMutations.update.isPending;

  const [formData, setFormData] = useState({
    certificate_name: '',
    institution: '',
    certificate_year: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (certificate) {
      setFormData({
        certificate_name: certificate.certificate_name || '',
        institution: certificate.institution || '',
        certificate_year: certificate.certificate_year?.toString() || '',
      });
    } else {
      setFormData({
        certificate_name: '',
        institution: '',
        certificate_year: '',
      });
    }
    setErrors({});
  }, [certificate]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.certificate_name.trim()) {
      newErrors.certificate_name = 'Sertifika adı zorunludur';
    }

    if (!formData.institution.trim()) {
      newErrors.institution = 'Kurum adı zorunludur';
    }

    if (formData.certificate_year && !/^\d{4}$/.test(formData.certificate_year)) {
      newErrors.certificate_year = 'Geçerli bir yıl giriniz (örn: 2020)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload: CreateCertificatePayload = {
      certificate_name: formData.certificate_name,
      institution: formData.institution,
      certificate_year: formData.certificate_year ? parseInt(formData.certificate_year) : new Date().getFullYear(),
    };

    // If external onSubmit provided, use it (for testing/custom handling)
    if (onSubmitProp) {
      onSubmitProp(payload);
      return;
    }

    // Use internal mutation hooks
    if (certificate?.id) {
      // Update existing certificate
      certificateMutations.update.mutate(
        { id: certificate.id, data: payload },
        { onSuccess: () => navigation.goBack() }
      );
    } else {
      // Create new certificate
      certificateMutations.create.mutate(payload, {
        onSuccess: () => navigation.goBack(),
      });
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  /**
   * CertificateFormScreen - Certificate form as navigation screen
   * 
   * NOTE: No local BottomSheetModalProvider needed.
   * The root-level provider in App.tsx handles all BottomSheetModal components.
   */
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Typography variant="h2" style={styles.title}>
            {certificate ? 'Sertifika Düzenle' : 'Yeni Sertifika Ekle'}
          </Typography>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Sertifika Adı *"
            placeholder="Örn: ACLS, BLS"
            value={formData.certificate_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, certificate_name: text }))}
            error={errors.certificate_name}
          />

          <Input
            label="Veren Kurum *"
            placeholder="Sertifikayı veren kurum"
            value={formData.institution}
            onChangeText={(text) => setFormData(prev => ({ ...prev, institution: text }))}
            error={errors.institution}
          />

          <Input
            label="Alınma Yılı"
            placeholder="Örn: 2020"
            value={formData.certificate_year}
            onChangeText={(text) => setFormData(prev => ({ ...prev, certificate_year: text }))}
            error={errors.certificate_year}
            keyboardType="number-pad"
            maxLength={4}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="İptal"
            variant="outline"
            onPress={handleClose}
            style={styles.cancelButton}
            size="lg"
          />
          <Button
            label={certificate ? 'Güncelle' : 'Ekle'}
            variant="primary"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  errorText: {
    color: colors.error[600],
    fontSize: 12,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButton: {
    flex: 1,
    minHeight: 56,
  },
  submitButton: {
    flex: 1.5,
    minHeight: 56,
  },
});
