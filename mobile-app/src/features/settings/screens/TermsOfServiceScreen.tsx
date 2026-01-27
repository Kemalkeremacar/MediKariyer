/**
 * @file TermsOfServiceScreen.tsx
 * @description Kullanım koşulları ekranı
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/layout/Screen';
import { lightColors, spacing } from '@/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'TermsOfService'>;

export const TermsOfServiceScreen = (_props: Props) => {
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
            <Ionicons name="document-text" size={32} color={lightColors.primary[600]} />
          </View>
          <Typography variant="h2" style={styles.headerTitle}>
            Kullanım Koşulları
          </Typography>
          <Typography variant="body" style={styles.headerSubtitle}>
            Son güncelleme: 27 Ocak 2025
          </Typography>
        </View>

        {/* Giriş */}
        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            MediKariyer mobil uygulamasını kullanarak aşağıdaki kullanım koşullarını kabul 
            etmiş sayılırsınız. Lütfen uygulamayı kullanmadan önce bu koşulları dikkatlice okuyunuz.
          </Typography>
        </Card>

        {/* Hizmet Tanımı */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            1. HİZMET TANIMI
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            MediKariyer, sağlık sektöründe çalışan doktorlar ile sağlık kuruluşlarını bir araya 
            getiren bir kariyer platformudur. Platform aşağıdaki hizmetleri sunar:
          </Typography>
          <View style={styles.bulletList}>
            <Typography variant="caption" style={styles.bulletText}>
              • İş ilanlarını görüntüleme ve arama
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • İş başvurusu yapma ve takip etme
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Profesyonel profil oluşturma
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Bildirim ve güncellemeler alma
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Sağlık kuruluşları ile iletişim kurma
            </Typography>
          </View>
        </Card>

        {/* Kullanıcı Yükümlülükleri */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            2. KULLANICI YÜKÜMLÜLÜKLERİ
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            Uygulamayı kullanırken aşağıdaki kurallara uymayı kabul edersiniz:
          </Typography>
          <View style={styles.bulletList}>
            <Typography variant="caption" style={styles.bulletText}>
              • Doğru ve güncel bilgiler sağlamak
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Hesap güvenliğinizi korumak ve şifrenizi paylaşmamak
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Başkalarının haklarına saygı göstermek
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Yasalara ve etik kurallara uymak
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Spam veya zararlı içerik paylaşmamak
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Sistemi manipüle etmeye çalışmamak
            </Typography>
          </View>
        </Card>

        {/* Hesap Oluşturma */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            3. HESAP OLUŞTURMA VE GÜVENLİK
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <View style={styles.listItem}>
            <Ionicons name="person-add" size={20} color={lightColors.primary[600]} />
            <View style={styles.listContent}>
              <Typography variant="body" style={styles.listTitle}>
                Hesap Oluşturma
              </Typography>
              <Typography variant="caption" style={styles.listText}>
                Uygulamayı kullanmak için geçerli bir hesap oluşturmanız gerekmektedir. 
                Kayıt sırasında verdiğiniz bilgilerin doğru ve eksiksiz olması zorunludur.
              </Typography>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.listItem}>
            <Ionicons name="shield-checkmark" size={20} color={lightColors.primary[600]} />
            <View style={styles.listContent}>
              <Typography variant="body" style={styles.listTitle}>
                Hesap Güvenliği
              </Typography>
              <Typography variant="caption" style={styles.listText}>
                Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi güvenli tutmalı ve 
                kimseyle paylaşmamalısınız. Yetkisiz erişim fark ederseniz derhal bize bildirin.
              </Typography>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.listItem}>
            <Ionicons name="checkmark-circle" size={20} color={lightColors.primary[600]} />
            <View style={styles.listContent}>
              <Typography variant="body" style={styles.listTitle}>
                Hesap Onayı
              </Typography>
              <Typography variant="caption" style={styles.listText}>
                Hesabınız yönetici onayından sonra aktif hale gelir. Onay süreci 1-2 iş günü 
                sürebilir. Onay durumunuz hakkında e-posta ile bilgilendirileceksiniz.
              </Typography>
            </View>
          </View>
        </Card>

        {/* İçerik ve Sorumluluk */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            4. İÇERİK VE SORUMLULUK
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            Platforma yüklediğiniz içeriklerden (CV, sertifikalar, fotoğraflar vb.) siz 
            sorumlusunuz. İçeriklerinizin:
          </Typography>
          <View style={styles.bulletList}>
            <Typography variant="caption" style={styles.bulletText}>
              • Doğru ve güncel olması
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Telif haklarına uygun olması
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Yasalara aykırı olmaması
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Başkalarının haklarını ihlal etmemesi
            </Typography>
          </View>
          <Typography variant="caption" style={styles.noteText}>
            Not: Uygunsuz içerikler uyarı yapılmaksızın kaldırılabilir ve hesabınız askıya alınabilir.
          </Typography>
        </Card>

        {/* Fikri Mülkiyet */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            5. FİKRİ MÜLKİYET HAKLARI
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            MediKariyer uygulaması, logosu, tasarımı ve içeriği MediKariyer'e aittir ve 
            fikri mülkiyet yasaları ile korunmaktadır. Aşağıdaki eylemler yasaktır:
          </Typography>
          <View style={styles.bulletList}>
            <Typography variant="caption" style={styles.bulletText}>
              • Uygulamayı kopyalamak veya tersine mühendislik yapmak
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • İçerikleri izinsiz kullanmak veya dağıtmak
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Logoyu veya marka unsurlarını izinsiz kullanmak
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Otomatik sistemlerle veri toplamak (scraping)
            </Typography>
          </View>
        </Card>

        {/* Hizmet Değişiklikleri */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            6. HİZMET DEĞİŞİKLİKLERİ VE SONLANDIRMA
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            MediKariyer, hizmeti geliştirmek veya değiştirmek hakkını saklı tutar:
          </Typography>
          <View style={styles.bulletList}>
            <Typography variant="caption" style={styles.bulletText}>
              • Özellikler eklenebilir veya kaldırılabilir
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Kullanım koşulları güncellenebilir
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Hizmet geçici olarak askıya alınabilir (bakım vb.)
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Kural ihlali durumunda hesaplar kapatılabilir
            </Typography>
          </View>
        </Card>

        {/* Sorumluluk Reddi */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            7. SORUMLULUK REDDİ
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            MediKariyer aşağıdaki konularda sorumluluk kabul etmez:
          </Typography>
          <View style={styles.bulletList}>
            <Typography variant="caption" style={styles.bulletText}>
              • İş ilanlarının doğruluğu ve güncelliği
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • İşe alım süreçlerinin sonuçları
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Kullanıcılar arası iletişim ve anlaşmazlıklar
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Üçüncü taraf hizmetlerden kaynaklanan sorunlar
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Teknik aksaklıklar veya veri kayıpları
            </Typography>
          </View>
          <Typography variant="caption" style={styles.noteText}>
            Hizmet "olduğu gibi" sunulmaktadır. Kesintisiz veya hatasız çalışma garantisi verilmez.
          </Typography>
        </Card>

        {/* Uyuşmazlık Çözümü */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            8. UYUŞMAZLIK ÇÖZÜMÜ
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            Bu kullanım koşullarından doğan uyuşmazlıklar Türkiye Cumhuriyeti yasalarına tabidir. 
            Uyuşmazlıkların çözümünde İstanbul mahkemeleri ve icra daireleri yetkilidir.
          </Typography>
        </Card>

        {/* Değişiklikler */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            9. KOŞUL DEĞİŞİKLİKLERİ
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            Bu kullanım koşulları zaman zaman güncellenebilir. Önemli değişiklikler olduğunda 
            sizi bilgilendireceğiz. Güncellemelerden sonra uygulamayı kullanmaya devam ederseniz, 
            yeni koşulları kabul etmiş sayılırsınız.
          </Typography>
        </Card>

        {/* Kabul */}
        <Card variant="outlined" padding="lg" style={styles.acceptCard}>
          <View style={styles.acceptHeader}>
            <Ionicons name="checkmark-circle" size={24} color={lightColors.success[600]} />
            <Typography variant="h3" style={styles.acceptTitle}>
              Koşulların Kabulü
            </Typography>
          </View>
          <Typography variant="caption" style={styles.acceptText}>
            MediKariyer uygulamasını kullanarak bu kullanım koşullarını okuduğunuzu, 
            anladığınızı ve kabul ettiğinizi beyan edersiniz.
          </Typography>
        </Card>

        {/* İletişim */}
        <Card variant="outlined" padding="lg" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="mail" size={20} color={lightColors.primary[600]} />
            <Typography variant="h3" style={styles.infoTitle}>
              İletişim
            </Typography>
          </View>
          <Typography variant="caption" style={styles.infoText}>
            Kullanım koşulları hakkında sorularınız için:
          </Typography>
          <Typography variant="caption" style={styles.infoText}>
            📧 info@medikariyer.com
          </Typography>
          <Typography variant="caption" style={styles.infoText}>
            🌐 www.medikariyer.com
          </Typography>
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
    fontSize: 13,
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: lightColors.primary[700],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    marginBottom: spacing.lg,
  },
  text: {
    fontSize: 15,
    color: lightColors.text.primary,
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: lightColors.text.primary,
    marginBottom: spacing.xs,
  },
  listText: {
    fontSize: 14,
    color: lightColors.text.secondary,
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightColors.neutral[200],
    marginVertical: spacing.md,
  },
  bulletList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  bulletText: {
    fontSize: 14,
    color: lightColors.text.secondary,
    lineHeight: 22,
  },
  noteText: {
    fontSize: 13,
    color: lightColors.warning[700],
    fontStyle: 'italic',
    marginTop: spacing.md,
    lineHeight: 20,
  },
  acceptCard: {
    backgroundColor: lightColors.success[50],
    borderColor: lightColors.success[200],
  },
  acceptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  acceptTitle: {
    color: lightColors.success[700],
    fontSize: 16,
    fontWeight: '600',
  },
  acceptText: {
    color: lightColors.success[700],
    fontSize: 14,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: lightColors.primary[50],
    borderColor: lightColors.primary[200],
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoTitle: {
    color: lightColors.primary[700],
    fontSize: 15,
    fontWeight: '600',
  },
  infoText: {
    color: lightColors.primary[700],
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
});
