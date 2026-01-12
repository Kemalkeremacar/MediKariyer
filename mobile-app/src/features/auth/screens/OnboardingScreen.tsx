/**
 * @file OnboardingScreen.tsx
 * @description Onboarding Flow - Doktorlara özel, profesyonel tanıtım ekranları
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Alert, 
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/services/authService';
import { devLog } from '@/utils/devLogger';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

interface SlideData {
  key: string;
  title: string;
  subtitle: string;
  text: string;
  image: any;
  gradientColors: [string, string, string];
  icon: keyof typeof Ionicons.glyphMap;
}

const slides: SlideData[] = [
  {
    key: 'welcome',
    title: 'MediKariyer',
    subtitle: 'Hoş Geldiniz',
    text: 'Türkiye\'nin en büyük hekimlere özel kariyer platformu. Binlerce doktor burada kariyerini şekillendiriyor.',
    image: require('../../../../assets/onboarding/welcome.png'),
    gradientColors: ['#0EA5E9', '#0284C7', '#0369A1'],
    icon: 'medical',
  },
  {
    key: 'profile',
    title: 'Profesyonel Profil',
    subtitle: 'Öne Çıkın',
    text: 'Uzmanlık alanınız, deneyimleriniz ve sertifikalarınızla dikkat çekin. Hastaneler sizi bulsun.',
    image: require('../../../../assets/onboarding/profile.png'),
    gradientColors: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    icon: 'person-circle',
  },
  {
    key: 'jobs',
    title: 'Tek Tıkla Başvuru',
    subtitle: 'Hızlı & Kolay',
    text: 'Size özel iş fırsatlarını keşfedin. Tek tıkla başvurun, kariyer yolculuğunuza hız katın.',
    image: require('../../../../assets/onboarding/jobs.png'),
    gradientColors: ['#10B981', '#059669', '#047857'],
    icon: 'briefcase',
  },
];

export const OnboardingScreen: React.FC<Props> = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  const currentSlide = slides[currentIndex];

  const handleOnboardingComplete = useCallback(async () => {
    if (!user?.id) {
      devLog.error('OnboardingScreen - User ID not found');
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    setLoading(true);
    
    try {
      devLog.log('OnboardingScreen - Marking onboarding as completed for user:', user.id);
      await authService.markOnboardingCompleted();
      
      const updatedUser = { ...user, is_onboarding_seen: true };
      useAuthStore.getState().setUser(updatedUser);
      devLog.log('OnboardingScreen - User store updated:', updatedUser);
      
    } catch (error) {
      devLog.error('OnboardingScreen - Error completing onboarding:', error);
      const updatedUser = { ...user, is_onboarding_seen: true };
      useAuthStore.getState().setUser(updatedUser);
      
      Alert.alert(
        'Bilgi',
        'Onboarding kaydedilirken bir sorun oluştu, ancak devam edebilirsiniz.',
        [{ text: 'Tamam', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleNext = () => {
    devLog.log('OnboardingScreen - handleNext called, currentIndex:', currentIndex);
    
    if (currentIndex === slides.length - 1) {
      handleOnboardingComplete();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={currentSlide.gradientColors}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Image Card */}
          <View style={styles.imageCard}>
            <Image
              source={currentSlide.image}
              style={styles.image}
              contentFit="contain"
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <View style={styles.iconBadge}>
              <Ionicons name={currentSlide.icon} size={24} color="#fff" />
            </View>
            
            <Typography style={styles.subtitle}>{currentSlide.subtitle}</Typography>
            <Typography style={styles.title}>{currentSlide.title}</Typography>
            <Typography style={styles.description}>{currentSlide.text}</Typography>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Pagination */}
          <View style={styles.pagination}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.paginationDot,
                  i === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNext}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.buttonGradient}
            >
              {loading ? (
                <Typography style={StyleSheet.flatten([styles.buttonText, { color: currentSlide.gradientColors[0] }])}>
                  Yükleniyor...
                </Typography>
              ) : (
                <>
                  <Typography style={StyleSheet.flatten([styles.buttonText, { color: currentSlide.gradientColors[0] }])}>
                    {currentIndex === slides.length - 1 ? 'Hadi Başlayalım' : 'Devam Et'}
                  </Typography>
                  <Ionicons 
                    name={currentIndex === slides.length - 1 ? 'checkmark-circle' : 'arrow-forward-circle'} 
                    size={24} 
                    color={currentSlide.gradientColors[0]} 
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  image: {
    width: width * 0.7,
    height: height * 0.28,
  },
  textContent: {
    alignItems: 'center',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
