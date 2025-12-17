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
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('ProfileTab', { screen: 'ProfileMain' });
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
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('JobsTab', { screen: 'JobsList' });
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
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('SettingsTab', { screen: 'SettingsMain' });
        },
      })}
    />
    </Tab.Navigator>
  );
};




