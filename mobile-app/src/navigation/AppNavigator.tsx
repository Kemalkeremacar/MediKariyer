/**
 * @file AppNavigator.tsx
 * @description Ana Uygulama Navigator'ı - Authenticated akış
 * 
 * Authenticated kullanıcılar için ana navigasyon yapısı.
 * Bottom tab navigator içerir.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { TabNavigator } from './TabNavigator';

/**
 * AppNavigator - Authenticated akış
 * @description Ana uygulama navigasyonu (bottom tabs ile)
 */
export const AppNavigator = () => {
  return <TabNavigator />;
};
