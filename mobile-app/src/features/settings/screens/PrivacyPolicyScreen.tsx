/**
 * @file PrivacyPolicyScreen.tsx
 * @description Gizlilik politikası ekranı
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

type Props = NativeStackScreenProps<SettingsStackParamList, 'PrivacyPolicy'>;

export const PrivacyPolicyScreen = (_props: Props) => {
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
            <Ionicons name="shield-checkmark" size={32} color={lightColors.primary[600]} />
          </View>
          <Typography variant="h2" style={styles.headerTitle}>
            Gizlilik Politikası
          </Typography>
          <Typography variant="body" style={styles.headerSubtitle}>
            Son güncelleme: 27 Ocak 2025
          </Typography>
        </View>

        {/* Giriş */}
        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            MediKariyer olarak, kişisel verilerinizin güvenliği bizim için son derece önemlidir. 
            Bu gizlilik politikası, mobil uygulamamızı kullanırken toplanan, işlenen ve saklanan 
            kişisel verileriniz hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
          </Typography>
        </Card>

        {/* Toplanan Bilgiler */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            1. TOPLANAN BİLGİLER
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <View style={styles.listItem}>
            <Ionicons name="person" size={20} color={lightColors.primary[600]} />
            <View style={styles.listContent}>
              <Typography variant="body" style={styles.listTitle}>
                Kişisel Bilgiler
              </Typography>
              <Typography variant="caption" style={styles.listText}>
                Ad, soyad, e-posta adresi, telefon numarası, TC kimlik numarası, doğum tarihi
              </Typography>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.listItem}>
            <Ionicons name="school" size={20} color={lightColors.primary[600]} />
            <View style={styles.listContent}>
              <Typography variant="body" style={styles.listTitle}>
                Mesleki Bilgiler
              </Typography>
              <Typography variant="caption" style={styles.listText}>
                Eğitim geçmişi, iş deneyimi, sertifikalar, uzmanlık alanı, dil becerileri
              </Typography>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.listItem}>
            <Ionicons name="phone-portrait" size={20} color={lightColors.primary[600]} />
            <View style={styles.listContent}>
              <Typography variant="body" style={styles.listTitle}>
                Cihaz Bilgileri
              </Typography>
              <Typography variant="caption" style={styles.listText}>
                Cihaz modeli, işletim sistemi, uygulama versiyonu, IP adresi
              </Typography>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.listItem}>
            <Ionicons name="analytics" size={20} color={lightColors.primary[600]} />
            <View style={styles.listContent}>
              <Typography variant="body" style={styles.listTitle}>
                Kullanım Bilgileri
              </Typography>
              <Typography variant="caption" style={styles.listText}>
                Uygulama kullanım istatistikleri, görüntülenen sayfalar, tıklama verileri
              </Typography>
            </View>
          </View>
        </Card>

        {/* Bilgilerin Kullanımı */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            2. BİLGİLERİN KULLANIMI
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            Toplanan bilgiler aşağıdaki amaçlarla kullanılır:
          </Typography>
          <View style={styles.bulletList}>
            <Typography variant="caption" style={styles.bulletText}>
              • İş ilanlarını size özel olarak önerme
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Başvurularınızı işleme ve takip etme
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Hesap güvenliğinizi sağlama
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Uygulama performansını iyileştirme
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Size bildirim ve güncellemeler gönderme
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Yasal yükümlülükleri yerine getirme
            </Typography>
          </View>
        </Card>

        {/* Veri Güvenliği */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            3. VERİ GÜVENLİĞİ
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik 
            önlemleri kullanıyoruz:
          </Typography>
          <View style={styles.bulletList}>
            <Typography variant="caption" style={styles.bulletText}>
              • SSL/TLS şifreleme ile veri iletimi
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Güvenli sunucularda veri saklama
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Düzenli güvenlik denetimleri
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Erişim kontrolü ve yetkilendirme
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Şifre hashleme ve token tabanlı kimlik doğrulama
            </Typography>
          </View>
        </Card>

        {/* Veri Paylaşımı */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            4. VERİ PAYLAŞIMI
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            Kişisel verileriniz yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşılır:
          </Typography>
          <View style={styles.bulletList}>
            <Typography variant="caption" style={styles.bulletText}>
              • İş başvurusu yaptığınız sağlık kuruluşları ile
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Yasal zorunluluklar gereği yetkili makamlarla
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Hizmet sağlayıcılarımız ile (hosting, analitik vb.)
            </Typography>
          </View>
          <Typography variant="caption" style={styles.noteText}>
            Not: Verileriniz hiçbir zaman pazarlama amaçlı üçüncü taraflara satılmaz.
          </Typography>
        </Card>

        {/* Haklarınız */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            5. HAKLARINIZ
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            KVKK kapsamında aşağıdaki haklara sahipsiniz:
          </Typography>
          <View style={styles.bulletList}>
            <Typography variant="caption" style={styles.bulletText}>
              • Kişisel verilerinizin işlenip işlenmediğini öğrenme
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • İşlenmişse buna ilişkin bilgi talep etme
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Verilerin eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Verilerin silinmesini veya yok edilmesini isteme
            </Typography>
          </View>
        </Card>

        {/* Çerezler */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            6. ÇEREZLER VE TAKİP TEKNOLOJİLERİ
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            Uygulamamız, kullanıcı deneyimini iyileştirmek için aşağıdaki teknolojileri kullanır:
          </Typography>
          <View style={styles.bulletList}>
            <Typography variant="caption" style={styles.bulletText}>
              • Oturum yönetimi için güvenli token'lar
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Kullanıcı tercihlerini saklamak için yerel depolama
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Uygulama performansını izlemek için analitik araçlar
            </Typography>
            <Typography variant="caption" style={styles.bulletText}>
              • Hata raporlama ve düzeltme için crash analytics
            </Typography>
          </View>
        </Card>

        {/* Değişiklikler */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            7. POLİTİKA DEĞİŞİKLİKLERİ
          </Typography>
        </View>

        <Card variant="outlined" padding="lg" style={styles.card}>
          <Typography variant="body" style={styles.text}>
            Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler olduğunda 
            sizi uygulama içi bildirim veya e-posta yoluyla bilgilendireceğiz. Politikayı 
            düzenli olarak gözden geçirmenizi öneririz.
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
            Gizlilik politikamız hakkında sorularınız için:
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
    color: lightColors.primary[700],
    fontStyle: 'italic',
    marginTop: spacing.md,
    lineHeight: 20,
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
