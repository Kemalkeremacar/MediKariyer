import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'medikariyer_access_token';
const REFRESH_TOKEN_KEY = 'medikariyer_refresh_token';

const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async deleteItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const tokenManager = {
  async saveTokens(accessToken: string, refreshToken: string) {
    await Promise.all([
      storage.setItem(ACCESS_TOKEN_KEY, accessToken),
      storage.setItem(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },
  async getAccessToken() {
    return storage.getItem(ACCESS_TOKEN_KEY);
  },
  async getRefreshToken() {
    return storage.getItem(REFRESH_TOKEN_KEY);
  },
  async getTokens() {
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(),
      this.getRefreshToken(),
    ]);
    return { accessToken, refreshToken };
  },
  async clearTokens() {
    await Promise.all([
      storage.deleteItem(ACCESS_TOKEN_KEY),
      storage.deleteItem(REFRESH_TOKEN_KEY),
    ]);
  },
};

