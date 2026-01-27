/**
 * @file HelpCenterScreen.tsx
 * @description Yardım merkezi ve SSS ekranı
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/layout/Screen';
import { lightColors, spacing } from '@/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'HelpCenter'>;

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'account' | 'jobs' | 'applications';
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'Nasıl iş başvurusu yapabilirim?',
    answer: 'İş İlanları sekmesinden ilgilendiğiniz ilanı seçin ve "Başvur" butonuna tıklayın. Profilinizin eksiksiz olduğundan emin olun.',
    category: 'jobs',
  },
  {
    id: '2',
    question: 'Başvurularımı nasıl takip edebilirim?',
    answer: 'Başvurular sekmesinden tüm başvurularınızı ve durumlarını görebilirsiniz. Durum değişikliklerinde bildirim alırsınız.',
    category: 'applications',
  },
  {
    id: '3',
    question: 'Profilimi nasıl güncellerim?',
    answer: 'Profil sekmesinden "Profili Düzenle" butonuna tıklayarak kişisel bilgilerinizi, eğitim ve deneyimlerinizi güncelleyebilirsiniz.',
    category: 'account',
  },
  {
    id: '4',
    question: 'Şifremi unuttum, ne yapmalıyım?',
    answer: 'Giriş ekranında "Şifremi Unuttum" linkine tıklayın. E-posta adresinize şifre sıfırlama linki gönderilecektir.',
    category: 'account',
  },
  {
    id: '5',
    question: 'Bildirimler nasıl çalışır?',
    answer: 'Yeni iş ilanları, başvuru güncellemeleri ve mesajlar için bildirim alırsınız. Ayarlar > Bildirimler\'den tercihlerinizi değiştirebilirsiniz.',
    category: 'general',
  },
  {
    id: '6',
    question: 'Hesabımı nasıl kapatırım?',
    answer: 'Ayarlar > Hesap İşlemleri\'nden hesabınızı pasifleştirebilir veya kalıcı olarak silebilirsiniz. Silme işlemi geri alınamaz.',
    category: 'account',
  },
  {
    id: '7',
    question: 'Hangi branşlar için iş ilanı var?',
    answer: 'Tüm tıp branşları için iş ilanları bulunmaktadır. Filtreleme yaparak branşınıza uygun ilanları görebilirsiniz.',
    category: 'jobs',
  },
  {
    id: '8',
    question: 'Başvurumu geri çekebilir miyim?',
    answer: 'Evet, başvuru detay sayfasından "Başvuruyu Geri Çek" butonuna tıklayarak başvurunuzu iptal edebilirsiniz.',
    category: 'applications',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: 'apps' },
  { id: 'general', label: 'Genel', icon: 'information-circle' },
  { id: 'account', label: 'Hesap', icon: 'person' },
  { id: 'jobs', label: 'İş İlanları', icon: 'briefcase' },
  { id: 'applications', label: 'Başvurular', icon: 'document-text' },
];

export const HelpCenterScreen = (_props: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQ = selectedCategory === 'all'
    ? FAQ_DATA
    : FAQ_DATA.filter(item => item.category === selectedCategory);

  const handleContactSupport = () => {
    Linking.openURL('mailto:info@medikariyer.com?subject=Geri Bildirim ve Şikayet');
  };

  return (
    <Screen scrollable={false}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="help-circle" size={32} color={lightColors.primary[600]} />
          </View>
          <Typography variant="h2" style={styles.headerTitle}>
            Yardım Merkezi
          </Typography>
          <Typography variant="body" style={styles.headerSubtitle}>
            Sık sorulan sorular ve destek
          </Typography>
        </View>

        {/* Kategori Filtreleri */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={
                  selectedCategory === category.id
                    ? lightColors.primary[600]
                    : lightColors.text.secondary
                }
              />
              <Typography
                variant="caption"
                style={
                  selectedCategory === category.id
                    ? styles.categoryLabelActive
                    : styles.categoryLabel
                }
              >
                {category.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SSS Listesi */}
        <View style={styles.faqContainer}>
          {filteredFAQ.map(item => (
            <Card
              key={item.id}
              variant="outlined"
              padding="md"
              style={styles.faqCard}
            >
              <TouchableOpacity
                onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                style={styles.faqHeader}
              >
                <View style={styles.faqQuestion}>
                  <Typography variant="body" style={styles.questionText}>
                    {item.question}
                  </Typography>
                </View>
                <Ionicons
                  name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={lightColors.text.secondary}
                />
              </TouchableOpacity>
              {expandedId === item.id && (
                <View style={styles.faqAnswer}>
                  <Typography variant="caption" style={styles.answerText}>
                    {item.answer}
                  </Typography>
                </View>
              )}
            </Card>
          ))}
        </View>

        {/* İletişim Kartı */}
        <Card variant="outlined" padding="lg" style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <Ionicons name="mail" size={24} color={lightColors.primary[600]} />
            <Typography variant="h3" style={styles.contactTitle}>
              Hala Yardıma mı İhtiyacınız Var?
            </Typography>
          </View>
          <Typography variant="caption" style={styles.contactText}>
            Sorunuz burada yanıtlanmadıysa, destek ekibimizle iletişime geçebilirsiniz.
          </Typography>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSupport}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
            <Typography variant="body" style={styles.contactButtonText}>
              Destek Ekibiyle İletişime Geç
            </Typography>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  backButtonContainer: {
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: lightColors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: lightColors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: lightColors.text.secondary,
    textAlign: 'center',
    fontSize: 15,
  },
  categoriesContainer: {
    marginBottom: spacing.xl,
  },
  categoriesContent: {
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: lightColors.neutral[100],
    borderWidth: 1,
    borderColor: lightColors.neutral[200],
  },
  categoryChipActive: {
    backgroundColor: lightColors.primary[50],
    borderColor: lightColors.primary[200],
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: lightColors.text.secondary,
  },
  categoryLabelActive: {
    color: lightColors.primary[600],
  },
  faqContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  faqCard: {
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    marginRight: spacing.md,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text.primary,
  },
  faqAnswer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: lightColors.neutral[200],
  },
  answerText: {
    fontSize: 15,
    color: lightColors.text.secondary,
    lineHeight: 24,
  },
  contactCard: {
    backgroundColor: lightColors.primary[50],
    borderColor: lightColors.primary[200],
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  contactTitle: {
    color: lightColors.primary[700],
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  contactText: {
    color: lightColors.primary[700],
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: lightColors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
