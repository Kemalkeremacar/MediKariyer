/**
 * @file WelcomeScreen.tsx
 * @description İlk açılış karşılama ekranı - Login/Register öncesi gösterilir
 * 
 * Bu ekran, uygulamanın kapalı sistem olduğunu ve sadece lisanslı doktorlar
 * için olduğunu açıklar. Apple App Store 5.1.1 kuralına uyum için tasarlanmıştır.
 * 
 * **FARK:**
 * - WelcomeScreen: Uygulama ilk açılışta, login ÖNCE (AsyncStorage ile kontrol)
 * - OnboardingScreen: Login sonrası, özellik tanıtımı (Backend ile kontrol)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WELCOME_SEEN_KEY = '@medikariyer_welcome_seen';

interface WelcomeScreenProps {
  onComplete: () => void;
}

/**
 * WelcomeScreen Bileşeni
 * 
 * Kullanıcıya platformun kapalı sistem olduğunu açıklar.
 * "Başlayalım" butonuna basıldığında AsyncStorage'a kaydedilir
 * ve bir daha gösterilmez.
 * 
 * @param {WelcomeScreenProps} props - onComplete callback
 * @returns {JSX.Element} Karşılama ekranı
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [isCompleting, setIsCompleting] = useState(false);

  /**
   * Welcome ekranını tamamla
   * Parent'a haber ver (AsyncStorage'a parent yazacak)
   */
  const handleComplete = () => {
    if (isCompleting) return;
    setIsCompleting(true);
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.imageContainer}
        onPress={handleComplete}
        activeOpacity={0.95}
        disabled={isCompleting}
      >
        <Image
          source={require('../../../../assets/start.png')}
          style={styles.fullImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

/**
 * Welcome ekranının daha önce görülüp görülmediğini kontrol et
 * @returns {Promise<boolean>} Görüldüyse true, görülmediyse false
 */
export const hasSeenWelcomeScreen = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Welcome screen kontrol hatası:', error);
    return false;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});
