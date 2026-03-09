/**
 * @file PhotoManagementScreen.tsx
 * @description Fotoğraf yönetim ekranı - Profil fotoğrafı yükleme ve onay süreci
 * @author MediKariyer Development Team
 * @version 1.0.0
 * 
 * **ÖNEMLİ ÖZELLİKLER:**
 * - Profil fotoğrafı yükleme (galeri seçimi)
 * - Fotoğraf değişiklik talebi oluşturma
 * - Admin onay süreci takibi
 * - Talep iptal etme
 * - Fotoğraf karşılaştırma (mevcut vs yeni)
 * - Talep geçmişi görüntüleme
 * 
 * **AKIŞ:**
 * 1. Kullanıcı galeriden fotoğraf seçer
 * 2. Fotoğraf sıkıştırılır ve base64'e dönüştürülür
 * 3. Backend'e talep gönderilir (pending durumu)
 * 4. Admin onayı beklenir (polling ile durum kontrol edilir)
 * 5. Onaylanırsa profil fotoğrafı güncellenir
 * 6. Reddedilirse sebep gösterilir
 * 
 * **TALEP DURUMLARI:**
 * - pending: Onay bekleniyor (sarı badge)
 * - approved: Onaylandı (yeşil badge)
 * - rejected: Reddedildi (kırmızı badge)
 * - cancelled: İptal edildi (gri badge)
 * 
 * **KRİTİK NOKTALAR:**
 * - Bekleyen talep varsa yeni fotoğraf yüklenemez
 * - Dosya boyutu max 5MB
 * - Sadece JPEG ve PNG formatları desteklenir
 * - Fotoğraf 1:1 aspect ratio ile kırpılır
 * - Base64 formatında backend'e gönderilir
 * 
 * **POLLİNG MEKANİZMASI (MOBİL OPTİMİZE):**
 * - Sadece pending durumunda polling yapılır
 * - Aşamalı geri çekilme (progressive backoff):
 *   * İlk 30 saniye: 5 saniye aralık
 *   * 30-60 saniye: 10 saniye aralık
 *   * 60+ saniye: 15 saniye aralık
 * - Ekran odak dışı olduğunda durdurulur (pil dostu)
 * 
 * **İYİMSER GÜNCELLEME:**
 * - Talep iptal edildiğinde UI hemen güncellenir
 * - Backend yanıtı gelene kadar önizleme gösterilir
 * - Hata durumunda geri alınır (rollback)
 * 
 * **KULLANIM ÖRNEĞİ:**
 * ```typescript
 * // Fotoğraf seçme
 * const result = await ImagePicker.launchImageLibraryAsync({
 *   allowsEditing: true,
 *   aspect: [1, 1],
 *   quality: 0.85,
 * });
 * 
 * // Base64'e dönüştürme
 * const base64 = await FileSystem.readAsStringAsync(uri, {
 *   encoding: 'base64',
 * });
 * 
 * // Backend'e gönderme
 * const dataUrl = `data:image/jpeg;base64,${base64}`;
 * await profileService.uploadPhoto({ file_url: dataUrl });
 * ```
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAlertHelpers } from '@/utils/alertHelpers';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { profileService } from '@/api/services/profile';
import { queryKeys } from '@/api/queryKeys';
import { lightColors, shadows, spacing, borderRadius, typography } from '@/theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { formatDateTime } from '@/utils/date';
import { BackButton } from '@/components/ui/BackButton';
import { Typography } from '@/components/ui/Typography';
import { useToast } from '@/providers/ToastProvider';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const mimeToExt = (mime: string) => {
  if (mime === 'image/png') return 'png';
  return 'jpg';
};

// Görüntü sıkıştırma yardımcı fonksiyonu
const compressImage = async (uri: string): Promise<string> => {
  // Şimdilik URI'yi olduğu gibi döndür
  // Üretimde react-native-image-resizer gibi bir kütüphane kullanılabilir
  return uri;
};

export const PhotoManagementScreen = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const alert = useAlertHelpers();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [lastShownStatus, setLastShownStatus] = useState<string | null>(null); // Son gösterilen durumu takip et
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView | null>(null);

  const { data: photoRequestStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: queryKeys.photo.status(),
    queryFn: () => profileService.getPhotoRequestStatus(),
    retry: 2,
    retryDelay: 1000,
    // Otomatik yeniden getirmeyi önle - gerektiğinde polling ile manuel olarak yöneteceğiz
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Sadece mount sırasında yeniden getir (ilk yükleme)
    staleTime: 1000 * 30, // 30 saniye - veri 30 saniye boyunca taze kabul edilir
  });

  // History kaldırıldı - sadece status'tan gelen latest request gösteriliyor (daha hızlı)

  const { data: profile } = useQuery({
    queryKey: ['profile', 'complete'],
    queryFn: () => profileService.getCompleteProfile(),
    // Otomatik yeniden getirmeyi önle
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Sadece mount sırasında yeniden getir
    staleTime: 1000 * 60, // 1 dakika - profil sık değişmez
  });

  const requestPhotoChangeMutation = useMutation({
    mutationFn: (fileUrl: string) => profileService.uploadPhoto({ file_url: fileUrl }),
    onSuccess: async (request) => {
      // Verileri yenilemek için sorguları geçersiz kıl
      queryClient.invalidateQueries({ queryKey: queryKeys.photo.status() });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Yeni talebi göstermek için durumu hemen yeniden getir
      try {
        await refetchStatus();
      } catch (error) {
        // Hataları sessizce işle - development'ta logla
        if (__DEV__) {
          console.warn('Status refetch after upload:', error);
        }
      }
      
      // Yükleme durumunu sıfırla
      setIsUploading(false);
      
      // Bekleyen talep fotoğrafını göstermek için önizlemeyi güncelle
      if (request?.file_url) {
        setPhotoPreview(request.file_url);
      }
      
      // Toast kullan (modal değil - touch events engellenmez)
      showToast('Fotoğraf değişiklik talebi gönderildi. Admin onayı bekleniyor.', 'success');
    },
    onError: (error: any) => {
      // Yükleme durumunu sıfırla
      setIsUploading(false);
      
      // Kullanıcı dostu hata mesajı göster
      let errorMessage = 'Fotoğraf yüklenirken bir hata oluştu';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      // Toast kullan (modal değil - touch events engellenmez)
      showToast(errorMessage, 'error');
    },
  });

  const cancelPhotoRequestMutation = useMutation({
    mutationFn: () => {
      return profileService.cancelPhotoRequest();
    },
    onMutate: async () => {
      // İYİMSER GÜNCELLEME: UI'ı hemen güncelle
      await queryClient.cancelQueries({ queryKey: queryKeys.photo.status() });
      const previousStatus = queryClient.getQueryData(queryKeys.photo.status());
      
      // Bekleyen talebi iyimser olarak kaldır
      queryClient.setQueryData(queryKeys.photo.status(), null);
      
      // Önizlemeyi hemen mevcut profil fotoğrafına güncelle
      if (profile?.profile_photo) {
        setPhotoPreview(profile.profile_photo);
      }
      
      return { previousStatus };
    },
    onSuccess: async (response) => {
      // Backend yanıtını kontrol et - servis { success: boolean } döndürür
      const success = response?.success !== false; // Belirtilmemişse varsayılan olarak true
      
      if (!success) {
        // Backend iptalin başarısız olduğunu söylüyor (bekleyen talep bulunamadı)
        showToast('İptal edilecek talep bulunamadı', 'error');
        // İyimser güncellemeyi geri almak için yeniden getir
        try {
          await refetchStatus();
        } catch (error) {
          // Yeniden getirme başarısız olursa, en azından önceki durumu context'ten geri yükle
        }
        return;
      }
      
      // Başarılı! Verileri hemen yenilemek için sorguları geçersiz kıl
      queryClient.invalidateQueries({ queryKey: queryKeys.photo.status() });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // İptali onaylamak için durumu yeniden getir (null veya cancelled durumu dönmeli)
      try {
        const newStatus = await refetchStatus();
        
        // İptalin başarılı olup olmadığını kontrol et
        // Durum null (bekleyen talep yok) veya cancelled olmalı
        if (!newStatus.data) {
          // Talep bulunamadı - iptal başarılı
          showToast('Fotoğraf değişiklik talebi iptal edildi', 'success');
        } else if (newStatus.data.status === 'cancelled') {
          // Durum iptal edildi - mükemmel!
          showToast('Fotoğraf değişiklik talebi iptal edildi', 'success');
        } else if (newStatus.data.status === 'pending') {
          // Durum hala bekliyor - bir şeyler yanlış gitti
          showToast('Talep iptal edilemedi. Lütfen tekrar deneyin.', 'error');
          // İyimser güncellemeyi geri al
          queryClient.setQueryData(queryKeys.photo.status(), newStatus.data);
          // Önizlemeyi geri yükle
          if (newStatus.data.file_url) {
            setPhotoPreview(newStatus.data.file_url);
          }
        } else {
          // Durum başka bir şeye değişti (onaylandı/reddedildi) - yine de başarı göster
          showToast('Fotoğraf değişiklik talebi iptal edildi', 'success');
        }
      } catch (error) {
        // Yeniden getirme başarısız olursa, başarılı kabul et (iyimser güncelleme çalıştı)
        if (__DEV__) {
          console.warn('Status refetch after cancel failed:', error);
        }
        showToast('Fotoğraf değişiklik talebi iptal edildi', 'success');
      }
    },
    onError: async (error: any, _variables, context) => {
      // İyimser güncellemeyi geri al
      if (context?.previousStatus) {
        queryClient.setQueryData(queryKeys.photo.status(), context.previousStatus);
      }
      
      // Önizlemeyi bekleyen talep fotoğrafına geri yükle
      if (photoRequestStatus?.file_url) {
        setPhotoPreview(photoRequestStatus.file_url);
      }
      
      // Kullanıcı dostu hata mesajı göster
      let errorMessage = 'Talep iptal edilirken bir hata oluştu';
      
      // Belirli hata yanıtlarını kontrol et
      if (error?.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 404) {
          errorMessage = 'İptal edilecek talep bulunamadı';
        } else if (status === 400) {
          errorMessage = data?.message || 'Bu talep iptal edilemez';
        } else if (status === 403) {
          errorMessage = 'Bu işlem için yetkiniz yok';
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    },
  });

  // Fotoğraf önizlemesini yükle - onaylanmış profil fotoğrafına öncelik ver
  useEffect(() => {
    // Talep onaylandı/reddedildi/iptal edildiyse, mevcut profil fotoğrafını göster
    if (photoRequestStatus?.status === 'approved' || 
        photoRequestStatus?.status === 'rejected' || 
        photoRequestStatus?.status === 'cancelled') {
      // Mevcut onaylanmış profil fotoğrafını göster
      if (profile?.profile_photo) {
        setPhotoPreview(profile.profile_photo);
      }
    } else if (photoRequestStatus?.status === 'pending' && photoRequestStatus?.file_url) {
      // Bekleyen talep fotoğrafını göster
      setPhotoPreview(photoRequestStatus.file_url);
    } else if (profile?.profile_photo) {
      // Varsayılan: mevcut onaylanmış profil fotoğrafını göster
      setPhotoPreview(profile.profile_photo);
    }
  }, [photoRequestStatus, profile]);

  // Durum değişikliklerini yönet: Onaylandı/reddedildiğinde başarı/hata mesajları göster (sadece bir kez)
  useEffect(() => {
    if (!photoRequestStatus) {
      setLastShownStatus(null);
      return;
    }
    
    const currentStatus = photoRequestStatus.status;
    
    // Sadece durum değiştiyse ve onaylandı/reddedildiyse mesaj göster
    // İlk mount'ta gösterme (lastShownStatus başlangıçta null)
      if (currentStatus !== lastShownStatus && lastShownStatus !== null) {
      if (currentStatus === 'approved') {
        // Fotoğraf onaylandı - yeni fotoğrafı almak için profili yenile (sadece durum değiştiğinde bir kez)
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        // Toast kullan (modal değil - touch events engellenmez)
        showToast('Fotoğraf değişikliğiniz onaylandı!', 'success');
        setLastShownStatus(currentStatus);
      } else if (currentStatus === 'rejected') {
        // Fotoğraf reddedildi - varsa sebebi göster
        const reason = photoRequestStatus.reason || 'Belirtilmemiş';
        // Toast kullan (modal değil - touch events engellenmez)
        showToast(`Fotoğraf değişikliğiniz reddedildi. Sebep: ${reason}`, 'error');
        setLastShownStatus(currentStatus);
      }
      // Not: 'cancelled' için mesaj göstermiyoruz çünkü kullanıcı zaten iptali onayladı
    } else if (lastShownStatus === null) {
      // İlk mount'ta lastShownStatus'u başlat
      setLastShownStatus(currentStatus);
    }
  }, [photoRequestStatus?.status, lastShownStatus, queryClient]);


  // Polling mekanizması: Sadece beklerken otomatik yenile (MOBİL OPTİMİZE)
  // MOBİL EN İYİ UYGULAMA: 
  // - Sadece kritik durumlarda polling (onay bekliyor)
  // - Aşamalı geri çekilme: Zaman geçtikçe daha az sık poll (pil dostu)
  // - Ekran odak dışı olduğunda durdur (pil dostu)
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let pollCount = 0; // Aşamalı geri çekilme için poll sayısını takip et
    const startTime = Date.now(); // Polling'in ne zaman başladığını takip et
    
    // Sadece durum bekliyorsa poll yap - durum null, onaylandı, reddedildi veya iptal edildiyse poll yapma
    if (photoRequestStatus?.status === 'pending') {
      // Polling başlamadan önce ilk gecikme
      timeoutId = setTimeout(() => {
        const poll = () => {
          // Sadece durumu yeniden getir (kritik - onaylandı/reddedildi mi görmek için)
          refetchStatus().catch(() => {
            // Hataları sessizce işle - kullanıcıyı hata mesajlarıyla spam yapma
          });
          
          pollCount++;
          const elapsedTime = Date.now() - startTime;
          
          // Aşamalı geri çekilme: 
          // - İlk 30 saniye: 5 saniye aralık (hızlı güncellemeler)
          // - 30-60 saniye: 10 saniye aralık (orta)
          // - 60 saniye sonra: 15 saniye aralık (muhafazakar, pil dostu)
          let nextInterval: number;
          if (elapsedTime < 30000) {
            nextInterval = 5000; // İlk 30 saniye: 5 saniye
          } else if (elapsedTime < 60000) {
            nextInterval = 10000; // 30-60 saniye: 10 saniye
          } else {
            nextInterval = 15000; // 60 saniye sonra: 15 saniye (maksimum)
          }
          
          // Sonraki poll'u planla
          intervalId = setTimeout(poll, nextInterval);
        };
        
        // İlk poll'u hemen başlat
        poll();
      }, 2000); // İlk gecikme: 2 saniye
    }
    
    // Temizlik: Durum değiştiğinde veya bileşen unmount olduğunda polling'i durdur
    return () => {
      if (intervalId) {
        clearTimeout(intervalId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [photoRequestStatus?.status, refetchStatus]);

  const handlePickImage = async () => {
    // Bekleyen talep varsa engelle
    if (hasPendingRequest) {
      showToast('Onay bekleyen bir talebiniz var. Lütfen önce mevcut talebi iptal edin veya onaylanmasını bekleyin.', 'info');
      return;
    }
    
    // İzinleri iste
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Fotoğraf seçmek için galeri erişim izni gereklidir', 'error');
      return;
    }

    // Görüntü seç
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        ((ImagePicker as any).MediaType?.Images ??
          (ImagePicker as any).MediaTypeOptions?.Images),
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      // maxWidth ve maxHeight quality ve allowsEditing tarafından yönetilir
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Dosya boyutunu doğrula
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
        showToast('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
        return;
      }

      // Dosya tipini doğrula
      if (asset.mimeType && !ALLOWED_TYPES.includes(asset.mimeType)) {
        showToast('Sadece JPEG veya PNG formatları desteklenir', 'error');
        return;
      }

      // Sıkıştır ve base64'e dönüştür
      try {
        setIsUploading(true);
        const compressedUri = await compressImage(asset.uri);

        const mime = asset.mimeType || 'image/jpeg';
        const uriToRead = compressedUri.startsWith('content://')
          ? (() => {
              const ext = mimeToExt(mime);
              const tempPath = `${FileSystem.cacheDirectory}photo_${Date.now()}.${ext}`;
              return FileSystem.copyAsync({ from: compressedUri, to: tempPath }).then(
                () => tempPath,
              );
            })()
          : Promise.resolve(compressedUri);

        const base64 = await FileSystem.readAsStringAsync(await uriToRead, {
          // Bazı expo-file-system sürümleri/türleri EncodingType'ı TS'de açığa çıkarmaz,
          // ancak runtime string literal'i kabul eder.
          encoding: 'base64' as any,
        });

        // Backend /api/doctor/profile/photo file_url'de data-url formatı bekler,
        // ve file_url.startsWith('data:image/') ile doğrular
        const dataUrl = `data:${mime};base64,${base64}`;

        // Daha iyi UX için önizlemeyi hemen ayarla
        setPhotoPreview(compressedUri);
        
        // Mutasyonu başlat (onSuccess/onError içinde setIsUploading'i yönetecek)
        requestPhotoChangeMutation.mutate(dataUrl);
      } catch (error) {
        setIsUploading(false);
        
        // Kullanıcı dostu hata mesajı göster
        let errorMessage = 'Fotoğraf işlenirken bir hata oluştu';
        if (error instanceof Error) {
          errorMessage = error.message || errorMessage;
        }
        showToast(errorMessage, 'error');
      }
    }
  };

  const openDetails = (item: any) => {
    setSelectedHistoryItem(item);
    setDetailsVisible(true);
  };

  const closeDetails = useCallback(() => {
    // Modal'ı kapat ve state'i hemen temizle
    // React Native Modal visible={false} olduğunda zaten overlay kalkar
    // useCallback ile memoize et ki re-render'larda sorun olmasın
    setDetailsVisible(false);
    // State temizliğini hemen yap (overlay zaten Modal tarafından kalkar)
    setSelectedHistoryItem(null);
  }, []);

  // Modal açıkken geri tuşu davranışını yönet
  useFocusEffect(
    useCallback(() => {
      // Android geri tuşu için listener ekle
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (!detailsVisible) {
          // Modal kapalıysa normal davranışa izin ver
          return;
        }

        // Modal açıksa geri tuşunu yakala ve modalı kapat
        e.preventDefault();
        closeDetails();
      });

      return unsubscribe;
    }, [detailsVisible, navigation, closeDetails])
  );

  // Screen blur olduğunda modal'ı kapat (başka ekrana geçildiğinde)
  useFocusEffect(
    useCallback(() => {
      // Focus olduğunda bir şey yapma - modal açık kalabilir
      
      return () => {
        // Screen blur olduğunda (başka ekrana geçildiğinde) modal'ı kapat
        if (detailsVisible) {
          closeDetails();
        }
      };
    }, [detailsVisible, closeDetails])
  );

  const getStatusLabel = (status?: string) => {
    if (!status) return 'Bilinmiyor';
    if (status === 'pending') return 'Onay Bekleniyor';
    if (status === 'approved') return 'Onaylandı';
    if (status === 'rejected') return 'Reddedildi';
    if (status === 'cancelled') return 'İptal Edildi';
    return status;
  };

  const getStatusBadgeStyle = (status?: string) => {
    if (status === 'approved') return styles.badgeApproved;
    if (status === 'rejected') return styles.badgeRejected;
    if (status === 'pending') return styles.badgePending;
    if (status === 'cancelled') return styles.badgeCancelled;
    return styles.badgeDefault;
  };

  const handleCancelRequest = () => {
    // Zaten bekliyorsa veya bekleyen talep yoksa engelle
    if (cancelPhotoRequestMutation.isPending) {
      return;
    }
    
    if (!hasPendingRequest) {
      showToast('İptal edilecek talep bulunmuyor', 'info');
      return;
    }
    
    // Native Alert kullanarak onay dialogu göster (UI donma sorunlarını düzeltir)
    alert.confirmDestructive(
      'Talebi İptal Et',
      'Fotoğraf değişiklik talebini iptal etmek istediğinizden emin misiniz? İptal edilen talep geri alınamaz.',
      () => {
        // İptali gerçekleştir
        cancelPhotoRequestMutation.mutate();
      },
      undefined, // İptal callback'i gerekmiyor
      'İptal Et'
    );
  };

  const onRefresh = async () => {
    // Kritik verileri yeniden getir
    await Promise.all([
      refetchStatus().catch(() => {}), // Hataları sessizce işle
      queryClient.invalidateQueries({ queryKey: ['profile'] }),
    ]);
  };

  const isLoading = statusLoading;
  const hasPendingRequest = photoRequestStatus?.status === 'pending';
  
  // Gereksiz yeniden hesaplamaları önlemek için memoize et
  const canUploadPhoto = !hasPendingRequest && !isUploading && !requestPhotoChangeMutation.isPending;
  const canCancelRequest = hasPendingRequest && !cancelPhotoRequestMutation.isPending;


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollContainer}
        refreshControl={
          !detailsVisible ? (
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
          <Typography variant="h3" style={styles.headerTitle}>
            Fotoğraf Yönetimi
          </Typography>
          <View style={styles.placeholder} />
        </View>

      {/* Current Photo - Show side by side if pending request */}
      <View style={styles.section}>
        {hasPendingRequest && photoRequestStatus ? (
          <>
            <Text style={styles.sectionTitle}>Fotoğraf Karşılaştırması</Text>
            <View style={styles.photoCompareContainer}>
              <View style={styles.photoCompareItem}>
                <Text style={styles.photoCompareLabel}>Mevcut Fotoğraf</Text>
                <View style={styles.photoContainerSmall}>
                  {profile?.profile_photo ? (
                    <Image source={{ uri: profile.profile_photo }} style={styles.photoSmall} />
                  ) : (
                    <View style={styles.photoPlaceholderSmall}>
                      <Text style={styles.cameraIconSmall}>📷</Text>
                      <Text style={styles.placeholderTextSmall}>Yok</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.photoCompareItem}>
                <Text style={styles.photoCompareLabel}>Yeni Fotoğraf</Text>
                <View style={styles.photoContainerSmall}>
                  {photoRequestStatus.file_url ? (
                    <Image source={{ uri: photoRequestStatus.file_url }} style={styles.photoSmall} />
                  ) : (
                    <View style={styles.photoPlaceholderSmall}>
                      <Text style={styles.cameraIconSmall}>📷</Text>
                      <Text style={styles.placeholderTextSmall}>Yok</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Mevcut Fotoğraf</Text>
            <View style={styles.photoContainer}>
              {photoPreview ? (
                <Image source={{ uri: photoPreview }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.cameraIcon}>📷</Text>
                  <Text style={styles.placeholderText}>Fotoğraf Yok</Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>

      {/* Pending Request Status */}
      {hasPendingRequest && photoRequestStatus && (
        <View style={styles.section}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusIcon}>⏳</Text>
              <Text style={styles.statusTitle}>Onay Bekleniyor</Text>
            </View>
            <Text style={styles.statusText}>
              Fotoğraf değişiklik talebiniz admin onayı bekliyor.
            </Text>
            {photoRequestStatus.reason && (
              <View style={styles.reasonContainer}>
                <Text style={styles.reasonLabel}>Not:</Text>
                <Text style={styles.reasonText}>{photoRequestStatus.reason}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.cancelButton,
                (!canCancelRequest || cancelPhotoRequestMutation.isPending) && styles.cancelButtonDisabled,
              ]}
              onPress={handleCancelRequest}
              disabled={!canCancelRequest || cancelPhotoRequestMutation.isPending}
              activeOpacity={canCancelRequest && !cancelPhotoRequestMutation.isPending ? 0.7 : 1}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {cancelPhotoRequestMutation.isPending ? (
                <>
                  <ActivityIndicator color={lightColors.text.inverse} size="small" />
                  <Text style={styles.cancelButtonText}>İptal ediliyor...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.cancelButtonText}>✕ Talebi İptal Et</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Upload New Photo - Only show when NO pending request */}
      {!hasPendingRequest && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yeni Fotoğraf Yükle</Text>
          <TouchableOpacity
            style={[
              styles.uploadButton,
              !canUploadPhoto && styles.uploadButtonDisabled,
            ]}
            onPress={handlePickImage}
            disabled={!canUploadPhoto}
            activeOpacity={canUploadPhoto ? 0.7 : 1}
          >
            {isUploading || requestPhotoChangeMutation.isPending ? (
              <>
                <ActivityIndicator color={lightColors.text.inverse} size="small" />
                <Text style={styles.uploadButtonText}>Yükleniyor...</Text>
              </>
            ) : (
              <>
                <Text style={styles.uploadButtonText}>📤 Fotoğraf Seç</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.uploadHint}>
            Max 5MB • JPEG, PNG
          </Text>
        </View>
      )}

      {/* Son Değişiklik - Sadece status'tan gelen latest request gösteriliyor */}
      {photoRequestStatus && (
        <View style={styles.section}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyIcon}>📜</Text>
            <Text style={styles.sectionTitle}>Son Değişiklik</Text>
          </View>
          <View style={styles.historyItem}>
            <View style={styles.historyItemHeader}>
              <View style={styles.historyItemContent}>
                <View style={styles.historyItemStatus}>
                  {photoRequestStatus.status === 'approved' && (
                    <Text style={styles.statusIconSmall}>✓</Text>
                  )}
                  {photoRequestStatus.status === 'rejected' && (
                    <Text style={styles.statusIconSmall}>✗</Text>
                  )}
                  {photoRequestStatus.status === 'pending' && (
                    <Text style={styles.statusIconSmall}>⏳</Text>
                  )}
                  {photoRequestStatus.status === 'cancelled' && (
                    <Text style={styles.statusIconSmall}>⊘</Text>
                  )}
                  <Text
                    style={[
                      styles.historyItemStatusText,
                      photoRequestStatus.status === 'approved' && styles.statusApproved,
                      photoRequestStatus.status === 'rejected' && styles.statusRejected,
                      photoRequestStatus.status === 'pending' && styles.statusPending,
                      photoRequestStatus.status === 'cancelled' && styles.statusCancelled,
                    ]}
                  >
                    {getStatusLabel(photoRequestStatus.status)}
                  </Text>
                </View>
                {photoRequestStatus.created_at && (
                  <Text style={styles.historyItemDate}>
                    {formatDateTime(photoRequestStatus.created_at)}
                  </Text>
                )}
                {photoRequestStatus.reason && (
                  <Text style={styles.historyItemReason}>{photoRequestStatus.reason}</Text>
                )}
              </View>
              <View style={styles.historyRight}>
                {photoRequestStatus.file_url && (
                  <Image source={{ uri: photoRequestStatus.file_url }} style={styles.historyItemPhoto} />
                )}
                <TouchableOpacity
                  style={styles.historyDetailButton}
                  onPress={() => openDetails(photoRequestStatus)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.historyDetailButtonText}>Detay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
      </ScrollView>
      
      {/* Modal - ScrollView dışında olmalı */}
      <Modal
        visible={detailsVisible}
        transparent
        animationType="slide"
        onRequestClose={closeDetails}
        statusBarTranslucent={true}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeDetails}
        >
          <TouchableOpacity 
            style={styles.modalCard}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Talep Detayı</Text>
            </View>

            <ScrollView 
              style={styles.modalBody}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Durum</Text>
                <View style={[styles.statusBadge, getStatusBadgeStyle(selectedHistoryItem?.status)]}>
                  <Text style={styles.statusBadgeText}>
                    {getStatusLabel(selectedHistoryItem?.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tarih</Text>
                <Text style={styles.detailValue}>
                  {selectedHistoryItem?.created_at
                    ? formatDateTime(selectedHistoryItem.created_at)
                    : '-'}
                </Text>
              </View>

              {!!selectedHistoryItem?.reason && (
                <View style={styles.detailNote}>
                  <Text style={styles.detailNoteLabel}>Not</Text>
                  <Text style={styles.detailNoteText}>{selectedHistoryItem.reason}</Text>
                </View>
              )}

              <View style={styles.compareSection}>
                <Text style={styles.compareTitle}>Fotoğraf Karşılaştırması</Text>
                <View style={styles.compareRow}>
                  <View style={styles.compareCol}>
                    <Text style={styles.compareLabel}>Mevcut</Text>
                    <View style={styles.compareImageWrap}>
                      {selectedHistoryItem?.old_photo ? (
                        <Image
                          source={{ uri: selectedHistoryItem.old_photo }}
                          style={styles.compareImage}
                        />
                      ) : (
                        <Text style={styles.compareEmptyText}>Yok</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.compareCol}>
                    <Text style={styles.compareLabel}>Yeni</Text>
                    <View style={styles.compareImageWrap}>
                      {selectedHistoryItem?.file_url ? (
                        <Image
                          source={{ uri: selectedHistoryItem.file_url }}
                          style={styles.compareImage}
                        />
                      ) : (
                        <Text style={styles.compareEmptyText}>Yok</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalPrimaryButton} onPress={closeDetails}>
                <Text style={styles.modalPrimaryButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background.secondary,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: lightColors.background.primary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  section: {
    backgroundColor: lightColors.background.primary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  photoCompareContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  photoCompareItem: {
    flex: 1,
    alignItems: 'center',
  },
  photoCompareLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: lightColors.text.primary,
    marginBottom: spacing.sm,
  },
  photoContainerSmall: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoSmall: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.full,
    backgroundColor: lightColors.border.light,
  },
  photoPlaceholderSmall: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.full,
    backgroundColor: lightColors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconSmall: {
    fontSize: 32,
  },
  placeholderTextSmall: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: lightColors.text.tertiary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: lightColors.text.primary,
    marginBottom: spacing.lg,
  },
  photoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.full,
    backgroundColor: lightColors.border.light,
  },
  photoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.full,
    backgroundColor: lightColors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: lightColors.text.tertiary,
  },
  cameraIcon: {
    fontSize: 48,
  },
  statusIcon: {
    fontSize: 20,
  },
  statusIconSmall: {
    fontSize: 16,
  },
  historyIcon: {
    fontSize: 20,
  },
  statusCard: {
    backgroundColor: lightColors.warning[50],
    borderWidth: 1,
    borderColor: lightColors.warning[200],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statusTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: lightColors.warning[800],
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: lightColors.warning[800],
    marginBottom: spacing.md,
  },
  reasonContainer: {
    backgroundColor: lightColors.background.primary,
    padding: spacing.md,
    borderRadius: borderRadius.xs,
    marginBottom: spacing.md,
  },
  reasonLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: lightColors.warning[800],
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontSize: typography.fontSize.sm,
    color: lightColors.warning[800],
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: lightColors.error[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  cancelButtonDisabled: {
    backgroundColor: lightColors.neutral[400],
    opacity: 0.6,
  },
  cancelButtonText: {
    color: lightColors.text.inverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: lightColors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  uploadButtonDisabled: {
    backgroundColor: lightColors.neutral[400],
    opacity: 0.6,
  },
  uploadButtonText: {
    color: lightColors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  uploadHint: {
    fontSize: typography.fontSize.xs,
    color: lightColors.text.secondary,
    textAlign: 'center',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  historyItem: {
    borderWidth: 1,
    borderColor: lightColors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  historyItemStatusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  statusApproved: {
    color: lightColors.success[600],
  },
  statusRejected: {
    color: lightColors.error[500],
  },
  statusPending: {
    color: lightColors.warning[500],
  },
  statusCancelled: {
    color: lightColors.neutral[500],
  },
  historyItemDate: {
    fontSize: typography.fontSize.xs,
    color: lightColors.text.secondary,
    marginBottom: spacing.xs,
  },
  historyItemReason: {
    fontSize: typography.fontSize.xs,
    color: lightColors.text.tertiary,
    fontStyle: 'italic',
  },
  historyRight: {
    marginLeft: spacing.md,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  historyDetailButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: lightColors.primary[50],
    borderWidth: 1,
    borderColor: lightColors.primary[100],
  },
  historyDetailButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: lightColors.primary[700],
  },
  historyItemPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: lightColors.border.light,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: lightColors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.md,
    maxHeight: '90%',
    flex: 1,
  },
  modalHeader: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border.light,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: lightColors.text.primary,
  },
  modalBody: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalFooter: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: lightColors.border.light,
    backgroundColor: lightColors.background.primary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: lightColors.text.secondary,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: lightColors.text.primary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'right',
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  badgeApproved: {
    backgroundColor: lightColors.success[50],
    borderColor: lightColors.success[200],
  },
  badgeRejected: {
    backgroundColor: lightColors.error[50],
    borderColor: lightColors.error[200],
  },
  badgePending: {
    backgroundColor: lightColors.warning[50],
    borderColor: lightColors.warning[200],
  },
  badgeCancelled: {
    backgroundColor: lightColors.neutral[50],
    borderColor: lightColors.neutral[200],
  },
  badgeDefault: {
    backgroundColor: lightColors.neutral[50],
    borderColor: lightColors.neutral[200],
  },
  detailNote: {
    backgroundColor: lightColors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: lightColors.border.light,
  },
  detailNoteLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: lightColors.text.secondary,
    marginBottom: spacing.xs,
  },
  detailNoteText: {
    fontSize: typography.fontSize.sm,
    color: lightColors.text.primary,
  },
  compareSection: {
    marginTop: spacing.sm,
  },
  compareTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: lightColors.text.primary,
    marginBottom: spacing.md,
  },
  compareRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  compareCol: {
    flex: 1,
  },
  compareLabel: {
    fontSize: typography.fontSize.xs,
    color: lightColors.text.secondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  compareImageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: lightColors.background.secondary,
    borderWidth: 1,
    borderColor: lightColors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareImage: {
    width: '100%',
    height: '100%',
  },
  compareEmptyText: {
    fontSize: typography.fontSize.sm,
    color: lightColors.text.tertiary,
  },
  modalPrimaryButton: {
    backgroundColor: lightColors.primary[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  modalPrimaryButtonText: {
    color: lightColors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: lightColors.text.secondary,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: lightColors.error[600],
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: lightColors.primary[600],
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: lightColors.text.inverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: lightColors.text.secondary,
    textAlign: 'center',
  },
});

