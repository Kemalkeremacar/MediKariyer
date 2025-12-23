import React from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { JobsStackNavigator } from './JobsStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';
import { ApplicationsScreen } from '@/features/applications/screens/ApplicationsScreen';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import type { AppTabParamList } from './types';

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

/**
 * TabNavigator - Main app navigation
 * Bottom tab navigator for primary authenticated features
 * 
 * Tabs:
 * - ProfileTab: Anasayfa (Profile as home page)
 * - JobsTab: İlanlar (Job listings)
 * - Applications: Başvurular (My applications)
 * - SettingsTab: Ayarlar (Settings)
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
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background.primary,
          borderTopWidth: 0,
          height: tabBarHeight,
          borderRadius: Platform.OS === 'ios' ? 0 : 24,
          ...Platform.select({
            ios: {
              shadowColor: colors.neutral[900],
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
            },
            android: {
              elevation: 12,
              shadowColor: colors.primary[900],
            },
          }),
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint="light"
              intensity={85}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
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
            console.warn('Tab navigation error:', error);
          }
        },
      })}
    />
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
            console.warn('Tab navigation error:', error);
          }
        },
      })}
    />
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
            console.warn('Tab navigation error:', error);
          }
        },
      })}
    />
    </Tab.Navigator>
  );
};




