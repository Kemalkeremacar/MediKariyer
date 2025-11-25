import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { profileService } from '@/api/services/profile.service';
import { colors, shadows, spacing, borderRadius, typography } from '@/constants/theme';
// Icons will be replaced with @expo/vector-icons or simple text

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Image compression helper
const compressImage = async (uri: string): Promise<string> => {
  // For now, return the URI as-is
  // In production, you might want to use a library like react-native-image-resizer
  return uri;
};

export const PhotoManagementScreen = () => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: photoRequestStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['photoRequestStatus'],
    queryFn: () => profileService.getPhotoRequestStatus(),
  });

  const { data: photoHistory, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['photoHistory'],
    queryFn: () => profileService.getPhotoRequestHistory(),
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', 'complete'],
    queryFn: () => profileService.getCompleteProfile(),
  });

  const requestPhotoChangeMutation = useMutation({
    mutationFn: (fileUrl: string) => profileService.uploadPhoto({ file_url: fileUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photoRequestStatus'] });
      queryClient.invalidateQueries({ queryKey: ['photoHistory'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Başarılı', 'Fotoğraf değişiklik talebi gönderildi. Admin onayı bekleniyor.');
      setPhotoPreview(null);
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Fotoğraf yüklenirken bir hata oluştu');
    },
  });

  const cancelPhotoRequestMutation = useMutation({
    mutationFn: () => profileService.cancelPhotoRequest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photoRequestStatus'] });
      queryClient.invalidateQueries({ queryKey: ['photoHistory'] });
      Alert.alert('Başarılı', 'Fotoğraf değişiklik talebi iptal edildi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Talep iptal edilirken bir hata oluştu');
    },
  });

  // Load pending request preview
  useEffect(() => {
    if (photoRequestStatus?.file_url) {
      setPhotoPreview(photoRequestStatus.file_url);
    } else if (profile?.profile_photo) {
      setPhotoPreview(profile.profile_photo);
    }
  }, [photoRequestStatus, profile]);

  const handlePickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gereklidir');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      // maxWidth and maxHeight are handled by quality and allowsEditing
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Validate file size
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
        Alert.alert('Hata', 'Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      // Validate file type
      if (asset.mimeType && !ALLOWED_TYPES.includes(asset.mimeType)) {
        Alert.alert('Hata', 'Sadece JPEG, PNG veya WebP formatları desteklenir');
        return;
      }

      // Compress and convert to base64
      try {
        setIsUploading(true);
        const compressedUri = await compressImage(asset.uri);
        
        // Read file as base64
        const response = await fetch(compressedUri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Remove data:image/...;base64, prefix if present
          const base64 = base64data.includes(',') 
            ? base64data.split(',')[1] 
            : base64data;
          
          setPhotoPreview(compressedUri);
          requestPhotoChangeMutation.mutate(base64);
          setIsUploading(false);
        };
        
        reader.onerror = () => {
          Alert.alert('Hata', 'Fotoğraf okunurken bir hata oluştu');
          setIsUploading(false);
        };
        
        reader.readAsDataURL(blob);
      } catch (error) {
        Alert.alert('Hata', 'Fotoğraf işlenirken bir hata oluştu');
        setIsUploading(false);
      }
    }
  };

  const handleCancelRequest = () => {
    Alert.alert(
      'Talebi İptal Et',
      'Fotoğraf değişiklik talebini iptal etmek istediğinizden emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet',
          style: 'destructive',
          onPress: () => cancelPhotoRequestMutation.mutate(),
        },
      ],
    );
  };

  const onRefresh = async () => {
    await Promise.all([refetchStatus(), refetchHistory()]);
  };

  const isLoading = statusLoading || historyLoading;
  const hasPendingRequest = photoRequestStatus?.status === 'pending';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      {/* Current Photo */}
      <View style={styles.section}>
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
              style={styles.cancelButton}
              onPress={handleCancelRequest}
              disabled={cancelPhotoRequestMutation.isPending}
            >
              {cancelPhotoRequestMutation.isPending ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <>
                  <Text style={styles.cancelButtonText}>✕ Talebi İptal Et</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Upload New Photo */}
      {!hasPendingRequest && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yeni Fotoğraf Yükle</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickImage}
            disabled={isUploading || requestPhotoChangeMutation.isPending}
          >
            {isUploading || requestPhotoChangeMutation.isPending ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <>
                <Text style={styles.uploadButtonText}>📤 Fotoğraf Seç</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.uploadHint}>
            Max 5MB • JPEG, PNG, WebP
          </Text>
        </View>
      )}

      {/* Photo History */}
      {photoHistory && photoHistory.length > 0 && (
        <View style={styles.section}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyIcon}>📜</Text>
            <Text style={styles.sectionTitle}>Fotoğraf Geçmişi</Text>
          </View>
          {photoHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyItemHeader}>
                <View style={styles.historyItemContent}>
                  <View style={styles.historyItemStatus}>
                    {item.status === 'approved' && (
                      <Text style={styles.statusIconSmall}>✓</Text>
                    )}
                    {item.status === 'rejected' && (
                      <Text style={styles.statusIconSmall}>✗</Text>
                    )}
                    {item.status === 'pending' && (
                      <Text style={styles.statusIconSmall}>⏳</Text>
                    )}
                    <Text
                      style={[
                        styles.historyItemStatusText,
                        item.status === 'approved' && styles.statusApproved,
                        item.status === 'rejected' && styles.statusRejected,
                        item.status === 'pending' && styles.statusPending,
                      ]}
                    >
                      {item.status === 'approved' && 'Onaylandı'}
                      {item.status === 'rejected' && 'Reddedildi'}
                      {item.status === 'pending' && 'Beklemede'}
                      {item.status === 'cancelled' && 'İptal Edildi'}
                    </Text>
                  </View>
                  {item.created_at && (
                    <Text style={styles.historyItemDate}>
                      {new Date(item.created_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}
                  {item.reason && (
                    <Text style={styles.historyItemReason}>{item.reason}</Text>
                  )}
                </View>
                {item.file_url && (
                  <Image source={{ uri: item.file_url }} style={styles.historyItemPhoto} />
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  section: {
    backgroundColor: colors.background.primary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
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
    backgroundColor: colors.border.light,
  },
  photoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
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
    backgroundColor: colors.warning[50],
    borderWidth: 1,
    borderColor: colors.warning[200],
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
    color: colors.warning[800],
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: colors.warning[800],
    marginBottom: spacing.md,
  },
  reasonContainer: {
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    borderRadius: borderRadius.xs,
    marginBottom: spacing.md,
  },
  reasonLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning[800],
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontSize: typography.fontSize.sm,
    color: colors.warning[800],
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  cancelButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  uploadButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  uploadHint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
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
    borderColor: colors.border.light,
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
    color: colors.success[600],
  },
  statusRejected: {
    color: colors.error[500],
  },
  statusPending: {
    color: colors.warning[500],
  },
  historyItemDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  historyItemReason: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  historyItemPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border.light,
  },
});

