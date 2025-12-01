// Development: Local development için localhost kullanın
// Android emülatörü için: 10.0.2.2 (emülatörün host makineye erişim IP'si, VPN'den bağımsız çalışır)
// Fiziksel cihaz için: Bilgisayarınızın IP adresini kullanın (örnek: 192.168.1.124)
// Environment variable ile override edebilirsiniz: EXPO_PUBLIC_API_BASE_URL
const DEV_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:3100/api/mobile';

const PROD_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://mk.monassist.com/api/mobile';

export const API_BASE_URL = __DEV__ ? DEV_API_BASE_URL : PROD_API_BASE_URL;

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const derivePrimaryApiBase = (mobileBase: string) => {
  const normalized = stripTrailingSlash(mobileBase);
  if (normalized.endsWith('/mobile')) {
    return normalized.slice(0, -'/mobile'.length);
  }
  return normalized;
};

export const PRIMARY_API_BASE_URL = derivePrimaryApiBase(API_BASE_URL);

// Debug: API URL'i console'a yazdır
if (__DEV__) {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🔗 Primary API Base URL:', PRIMARY_API_BASE_URL);
}

export const REQUEST_TIMEOUT_MS = 30_000;

