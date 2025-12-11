/**
 * @file gestureConfig.ts
 * @description Gesture handler configuration to prevent touch conflicts
 */

import { Platform } from 'react-native';

/**
 * Optimized touchable props to prevent gesture conflicts
 * Use these props in TouchableOpacity components
 */
export const optimizedTouchableProps = {
  activeOpacity: 0.7,
  delayPressIn: 0,
  delayPressOut: Platform.OS === 'android' ? 100 : 0,
};

/**
 * Optimized FlatList props to prevent gesture conflicts
 * Use these props in FlatList components
 */
export const optimizedFlatListProps = {
  removeClippedSubviews: Platform.OS === 'android',
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  initialNumToRender: 10,
  windowSize: 10,
  keyboardShouldPersistTaps: 'handled' as const,
  keyboardDismissMode: 'on-drag' as const,
};

/**
 * Optimized ScrollView props to prevent gesture conflicts
 * Use these props in ScrollView components
 */
export const optimizedScrollViewProps = {
  keyboardShouldPersistTaps: 'handled' as const,
  keyboardDismissMode: 'on-drag' as const,
  showsVerticalScrollIndicator: false,
  bounces: true,
  overScrollMode: 'auto' as const,
};
