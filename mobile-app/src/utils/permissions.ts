/**
 * Permission Utilities
 * Provides permission checking and management functions
 */

import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

// Optional imports - these packages may not be installed
let MediaLibrary: any;
let Camera: any;
let Location: any;

try {
  MediaLibrary = require('expo-media-library');
} catch (e) {
  console.warn('expo-media-library not installed');
}

try {
  Camera = require('expo-camera');
} catch (e) {
  console.warn('expo-camera not installed');
}

try {
  Location = require('expo-location');
} catch (e) {
  console.warn('expo-location not installed');
}

/**
 * Request camera permission
 * @returns Permission status
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  if (!Camera) {
    console.warn('expo-camera not available');
    return false;
  }

  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Kamera İzni Gerekli',
        'Fotoğraf çekmek için kamera iznine ihtiyacımız var.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Camera permission error:', error);
    return false;
  }
};

/**
 * Request media library permission
 * @returns Permission status
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  if (!MediaLibrary) {
    console.warn('expo-media-library not available');
    return false;
  }

  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Medya Kütüphanesi İzni Gerekli',
        'Fotoğraf seçmek için medya kütüphanesi iznine ihtiyacımız var.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Media library permission error:', error);
    return false;
  }
};

/**
 * Request image picker permission
 * @returns Permission status
 */
export const requestImagePickerPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      return true;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Galeri İzni Gerekli',
        'Fotoğraf seçmek için galeri iznine ihtiyacımız var.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Image picker permission error:', error);
    return false;
  }
};

/**
 * Request location permission
 * @returns Permission status
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (!Location) {
    console.warn('expo-location not available');
    return false;
  }

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Konum İzni Gerekli',
        'Konumunuzu kullanmak için konum iznine ihtiyacımız var.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Location permission error:', error);
    return false;
  }
};

/**
 * Check if camera permission is granted
 * @returns Permission status
 */
export const hasCameraPermission = async (): Promise<boolean> => {
  if (!Camera) {
    return false;
  }

  try {
    const { status } = await Camera.getCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Check camera permission error:', error);
    return false;
  }
};

/**
 * Check if media library permission is granted
 * @returns Permission status
 */
export const hasMediaLibraryPermission = async (): Promise<boolean> => {
  if (!MediaLibrary) {
    return false;
  }

  try {
    const { status } = await MediaLibrary.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Check media library permission error:', error);
    return false;
  }
};

/**
 * Check if location permission is granted
 * @returns Permission status
 */
export const hasLocationPermission = async (): Promise<boolean> => {
  if (!Location) {
    return false;
  }

  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Check location permission error:', error);
    return false;
  }
};

/**
 * Open app settings
 */
export const openAppSettings = (): void => {
  Linking.openSettings();
};

/**
 * Request multiple permissions at once
 * @param permissions - Array of permission types to request
 * @returns Object with permission statuses
 */
export const requestMultiplePermissions = async (
  permissions: Array<'camera' | 'mediaLibrary' | 'location' | 'imagePicker'>
): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = {};

  for (const permission of permissions) {
    switch (permission) {
      case 'camera':
        results.camera = await requestCameraPermission();
        break;
      case 'mediaLibrary':
        results.mediaLibrary = await requestMediaLibraryPermission();
        break;
      case 'location':
        results.location = await requestLocationPermission();
        break;
      case 'imagePicker':
        results.imagePicker = await requestImagePickerPermission();
        break;
    }
  }

  return results;
};

/**
 * Check multiple permissions at once
 * @param permissions - Array of permission types to check
 * @returns Object with permission statuses
 */
export const checkMultiplePermissions = async (
  permissions: Array<'camera' | 'mediaLibrary' | 'location'>
): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = {};

  for (const permission of permissions) {
    switch (permission) {
      case 'camera':
        results.camera = await hasCameraPermission();
        break;
      case 'mediaLibrary':
        results.mediaLibrary = await hasMediaLibraryPermission();
        break;
      case 'location':
        results.location = await hasLocationPermission();
        break;
    }
  }

  return results;
};
