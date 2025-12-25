import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal as RNModal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';
import type { DoctorCertificate, CreateCertificatePayload, UpdateCertificatePayload } from '@/types/profile';

interface CertificateFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCertificatePayload | UpdateCertificatePayload) => void;
  certificate?: DoctorCertificate | null;
  isLoading?: boolean;
}

export const CertificateFormModal: React.FC<CertificateFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  certificate,
  isLoading = false,
}) => {
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
  }, [certificate, visible]);

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

    const payload: any = {
      certificate_name: formData.certificate_name,
      institution: formData.institution,
      certificate_year: formData.certificate_year ? parseInt(formData.certificate_year) : new Date().getFullYear(),
    };

    onSubmit(payload);
  };

  // Modal kapatıldığında state'i temizle
  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <RNModal 
      visible={visible} 
      animationType="slide" 
      onRequestClose={handleClose}
      onDismiss={() => {
        // Modal tamamen kapandığında state'i temizle
        // Bu, modal kapatıldıktan sonra tıklama sorunlarını önler
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        pointerEvents={visible ? 'auto' : 'none'}
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
            onChangeText={(text) => setFormData({ ...formData, certificate_name: text })}
            error={errors.certificate_name}
          />

          <Input
            label="Veren Kurum *"
            placeholder="Sertifikayı veren kurum"
            value={formData.institution}
            onChangeText={(text) => setFormData({ ...formData, institution: text })}
            error={errors.institution}
          />

          <Input
            label="Alınma Yılı"
            placeholder="Örn: 2020"
            value={formData.certificate_year}
            onChangeText={(text) => setFormData({ ...formData, certificate_year: text })}
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
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
