/**
 * @file CustomSplashScreen.tsx
 * @description Sadece 1 kere gösterilen custom splash screen - Kullanıcı dokunarak geçer
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';

const { width, height } = Dimensions.get('window');

export const CustomSplashScreen = () => {
  const hasSeenSplash = useAuthStore((state) => state.hasSeenSplash);
  const markSplashSeen = useAuthStore((state) => state.markSplashSeen);
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    markSplashSeen();
  };

  // Eğer daha önce görüldüyse hiç render etme
  if (hasSeenSplash) {
    return null;
  }

  return (
    <>
      {/* Status bar ayarları */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#ffffff" 
        translucent={false}
      />
      
      <TouchableOpacity 
        style={styles.container}
        onPress={handlePress}
        activeOpacity={1}
      >
        <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* Resim alanı - flex ile otomatik boyutlandırma */}
          <View style={styles.imageContainer}>
            <Image 
              source={require('../../../assets/start.png')} 
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          
          {/* Yazı alanı - sabit boyut */}
          <View style={styles.textContainer}>
            <Text style={styles.tapText}>
              Devam etmek için dokunun
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 9999,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: 200, // Minimum yükseklik garantisi
    paddingBottom: 20, // Yazı ile arasında boşluk
  },
  image: {
    width: '90%',
    height: '100%',
    maxWidth: width * 0.9,
    maxHeight: height * 0.7, // Ekranın maksimum %70'i
  },
  textContainer: {
    height: 60, // Sabit yükseklik
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20, // Alt boşluk
  },
  tapText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
});