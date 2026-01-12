/**
 * @file TabNavigator.tsx
 * @description Ana uygulama gezinme - Bottom tab navigator
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - 4 ana tab: ProfileTab (Anasayfa), JobsTab (İlanlar), Applications (Başvurular), SettingsTab (Ayarlar)
 * - Animasyonlu ikonlar
 * - Haptic feedback
 * - Platform-specific styling
 */

import React from 'react';
import { Animated, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { JobsStackNavigator } from './JobsStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';
import { ApplicationsScreen } from '@/features/applications/screens/ApplicationsScreen';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { devLog } from '@/utils/devLogger';
import type { AppTabParamList } from './types';

// ============================================================================
// ANIMATED ICON COMPONENT
// ============================================================================

/**
 * Animasyonlu ikon bileşeni
 * Tab seçildiğinde scale ve opacity animasyonu yapar
 */
const AnimatedIcon = ({ iconName, focused }: { iconName: keyof typeof Ionicons.glyphMap; focused: boolean }) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  const opacity = React.useRef(new Animated.Value(0.7)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.15 : 1,
        useNativeDriver: true,
        friction: 5,
        tension: 100,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scale, opacity]);

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        opacity,
      }}
    >
      <Ionicons
        name={iconName}
        size={26}
        color={focused ? colors.primary[600] : colors.neutral[500]}
      />
    </Animated.View>
  );
};

const Tab = createBottomTabNavigator<AppTabParamList>();

// ============================================================================
// TAB NAVIGATOR
// ============================================================================

/**
 * TabNavigator - Ana uygulama gezinmesi
 * Kimlik doğrulanmış kullanıcılar için bottom tab navigator
 * 
 * **Tab'lar:**
 * - ProfileTab: Anasayfa (Profil ana sayfa olarak)
 * - JobsTab: İlanlar (İş ilanları listesi)
 * - Applications: Başvurular (Başvurularım)
 * - SettingsTab: Ayarlar (Hesap ayarları)
 */
export const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  // Dinamik tab bar yüksekliği - cihazın güvenli alanına göre hesaplanır
  const TAB_BAR_HEIGHT = 56;
  const tabBarHeight = TAB_BAR_HEIGHT + (Platform.OS === 'ios' ? insets.bottom : 12);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 0 : 12,
          left: Platform.OS === 'ios' ? 0 : 16,
          right: Platform.OS === 'ios' ? 0 : 16,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          borderWidth: 0,
          borderColor: 'transparent',
          height: tabBarHeight,
          borderRadius: Platform.OS === 'ios' ? 0 : 24,
          ...Platform.select({
            ios: {
              shadowColor: 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0,
              shadowRadius: 0,
            },
            android: {
              elevation: 0,
              shadowColor: 'transparent',
            },
          }),
        },
        tabBarBackground: () => null,
        sceneStyle: {
          backgroundColor: colors.background.primary,
          paddingBottom: tabBarHeight + (Platform.OS === 'ios' ? 0 : 12),
        },
        tabBarItemStyle: {
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 0 : 8,
          marginHorizontal: 4,
          borderRadius: 12,
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
          paddingBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
      }}
    >
      {/* ProfileTab - Anasayfa */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Anasayfa',
          tabBarIcon: ({ focused }) => (
            <AnimatedIcon iconName={focused ? "person-circle" : "person-circle-outline"} focused={focused} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Haptic feedback
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            try {
              // Eğer zaten ProfileTab'taysak ve ProfileMain ekranındaysak, sadece default davranışa izin ver
              const state = navigation.getState();
              if (state?.routes) {
                const profileTabState = state.routes.find(r => r.name === 'ProfileTab');
                if (profileTabState?.state) {
                  const profileStackState = profileTabState.state;
                  if (profileStackState?.routes && profileStackState?.index !== undefined) {
                    const currentScreen = profileStackState.routes[profileStackState.index];
                    if (currentScreen?.name === 'ProfileMain') {
                      // Zaten ProfileMain'deyiz, sadece default davranışa izin ver
                      return;
                    }
                  }
                }
              }
              // Farklı bir ekrandaysak veya ProfileTab'ta değilsek, ProfileMain'e navigate et
              e.preventDefault();
              navigation.navigate('ProfileTab', { screen: 'ProfileMain' });
            } catch (error) {
              // Hata durumunda default davranışa izin ver
              devLog.warn('Tab navigation error:', error);
            }
          },
        })}
      />
      
      {/* JobsTab - İlanlar */}
      <Tab.Screen
        name="JobsTab"
        component={JobsStackNavigator}
        options={{
          tabBarLabel: 'İlanlar',
          tabBarIcon: ({ focused }) => (
            <AnimatedIcon iconName={focused ? "briefcase" : "briefcase-outline"} focused={focused} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Haptic feedback
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            try {
              // Eğer zaten JobsTab'taysak ve JobsList ekranındaysak, sadece default davranışa izin ver
              const state = navigation.getState();
              if (state?.routes) {
                const jobsTabState = state.routes.find(r => r.name === 'JobsTab');
                if (jobsTabState?.state) {
                  const jobsStackState = jobsTabState.state;
                  if (jobsStackState?.routes && jobsStackState?.index !== undefined) {
                    const currentScreen = jobsStackState.routes[jobsStackState.index];
                    if (currentScreen?.name === 'JobsList') {
                      // Zaten JobsList'deyiz, sadece default davranışa izin ver
                      return;
                    }
                  }
                }
              }
              // Farklı bir ekrandaysak veya JobsTab'ta değilsek, JobsList'e navigate et
              e.preventDefault();
              navigation.navigate('JobsTab', { screen: 'JobsList' });
            } catch (error) {
              // Hata durumunda default davranışa izin ver
              devLog.warn('Tab navigation error:', error);
            }
          },
        })}
      />
      
      {/* Applications - Başvurular */}
      <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{
          tabBarLabel: 'Başvurular',
          tabBarIcon: ({ focused }) => (
            <AnimatedIcon iconName={focused ? "checkmark-done" : "checkmark-done-outline"} focused={focused} />
          ),
        }}
        listeners={() => ({
          tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        })}
      />
      
      {/* SettingsTab - Ayarlar */}
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Ayarlar',
          tabBarIcon: ({ focused }) => (
            <AnimatedIcon iconName={focused ? "settings" : "settings-outline"} focused={focused} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Haptic feedback
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            try {
              // Eğer zaten SettingsTab'taysak ve SettingsMain ekranındaysak, sadece default davranışa izin ver
              const state = navigation.getState();
              if (state?.routes) {
                const settingsTabState = state.routes.find(r => r.name === 'SettingsTab');
                if (settingsTabState?.state) {
                  const settingsStackState = settingsTabState.state;
                  if (settingsStackState?.routes && settingsStackState?.index !== undefined) {
                    const currentScreen = settingsStackState.routes[settingsStackState.index];
                    if (currentScreen?.name === 'SettingsMain') {
                      // Zaten SettingsMain'deyiz, sadece default davranışa izin ver
                      return;
                    }
                  }
                }
              }
              // Farklı bir ekrandaysak veya SettingsTab'ta değilsek, SettingsMain'e navigate et
              e.preventDefault();
              navigation.navigate('SettingsTab', { screen: 'SettingsMain' });
            } catch (error) {
              // Hata durumunda default davranışa izin ver
              devLog.warn('Tab navigation error:', error);
            }
          },
        })}
      />
    </Tab.Navigator>
  );
};
