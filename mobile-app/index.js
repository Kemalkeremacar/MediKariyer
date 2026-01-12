/**
 * @file index.js
 * @description MediKariyer Mobile uygulamasının giriş noktası
 * 
 * Bu dosya, React Native uygulamasını Expo ile kaydeder.
 * Gesture handler'ı import eder (navigation için gerekli).
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import 'react-native-gesture-handler'; // Navigation için gerekli (en üstte olmalı)
import { registerRootComponent } from 'expo';
import App from './App';

// Uygulamayı Expo ile kaydet
registerRootComponent(App);
