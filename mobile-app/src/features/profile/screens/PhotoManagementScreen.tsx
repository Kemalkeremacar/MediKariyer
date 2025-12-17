import React, { useEffect, useMemo, useRef, useState } from 'react';
import { showAlert } from '@/utils/alert';
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
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { profileService } from '@/api/services/profile.service';
import { colors, shadows, spacing, borderRadius, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { formatDateTime } from '@/utils/date';
import { BackButton } from '@/components/ui/BackButton';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const mimeToExt = (mime: string) => {
  if (mime === 'image/png') return 'png';
  return 'jpg';
};

// Image compression helper
const compressImage = async (uri: string): Promise<string> => {
  // For now, return the URI as-is
  // In production, you might want to use a library like react-native-image-resizer
  return uri;
};

export const PhotoManagementScreen = () => {
  const navigation = useNavigation();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [historySectionY, setHistorySectionY] = useState<number | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView | null>(null);

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
    onSuccess: async (request) => {
      queryClient.invalidateQueries({ queryKey: ['photoRequestStatus'] });
      queryClient.invalidateQueries({ queryKey: ['photoHistory'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      await Promise.all([refetchStatus(), refetchHistory()]);
      setPhotoPreview(request?.file_url || null);
      showAlert.success('Fotoğraf değişiklik talebi gönderildi. Admin onayı bekleniyor.');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Fotoğraf yüklenirken bir hata oluştu');
    },
  });

  const cancelPhotoRequestMutation = useMutation({
    mutationFn: () => profileService.cancelPhotoRequest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photoRequestStatus'] });
      queryClient.invalidateQueries({ queryKey: ['photoHistory'] });
      showAlert.success('Fotoğraf değişiklik talebi iptal edildi');
    },
    onError: (error: any) => {
      showAlert.error(error.message || 'Talep iptal edilirken bir hata oluştu');
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
      showAlert.error('Fotoğraf seçmek için galeri erişim izni gereklidir');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        ((ImagePicker as any).MediaType?.Images ??
          (ImagePicker as any).MediaTypeOptions?.Images),
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      // maxWidth and maxHeight are handled by quality and allowsEditing
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Validate file size
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
        showAlert.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      // Validate file type
      if (asset.mimeType && !ALLOWED_TYPES.includes(asset.mimeType)) {
        showAlert.error('Sadece JPEG veya PNG formatları desteklenir');
        return;
      }

      // Compress and convert to base64
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
          // Some expo-file-system versions/types don't expose EncodingType in TS,
          // but the runtime accepts the string literal.
          encoding: 'base64' as any,
        });

        // Backend /api/doctor/profile/photo expects data-url format in file_url,
        // and validates it with file_url.startsWith('data:image/')
        const dataUrl = `data:${mime};base64,${base64}`;

        setPhotoPreview(compressedUri);
        requestPhotoChangeMutation.mutate(dataUrl);
        setIsUploading(false);
      } catch (error) {
        console.error('Photo processing failed', error);
        showAlert.error('Fotoğraf işlenirken bir hata oluştu');
        setIsUploading(false);
      }
    }
  };

  const openDetails = (item: any) => {
    setSelectedHistoryItem(item);
    setDetailsVisible(true);
  };

  const closeDetails = () => {
    setDetailsVisible(false);
    setSelectedHistoryItem(null);
  };

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
    showAlert.confirmDestructive(
      'Talebi İptal Et',
      'Fotoğraf değişiklik talebini iptal etmek istediğinizden emin misiniz?',
      () => cancelPhotoRequestMutation.mutate(),
      undefined,
      'Evet'
    );
  };

  const onRefresh = async () => {
    await Promise.all([refetchStatus(), refetchHistory()]);
  };

  const isLoading = statusLoading || historyLoading;
  const hasPendingRequest = photoRequestStatus?.status === 'pending';

  const latestRequest = useMemo(() => {
    if (photoRequestStatus) return photoRequestStatus;
    if (photoHistory && photoHistory.length > 0) return photoHistory[0];
    return null;
  }, [photoHistory, photoRequestStatus]);

  const scrollToHistory = () => {
    if (!photoHistory || photoHistory.length === 0) {
      showAlert.info('Henüz geçmiş kayıt bulunmuyor');
      return;
    }
    if (historySectionY == null) {
      // Layout henüz hesaplanmadıysa fallback
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
      return;
    }
    scrollRef.current?.scrollTo({ y: historySectionY, animated: true });
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView
        ref={scrollRef}
        style={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      >
      <Modal
        visible={detailsVisible}
        transparent
        animationType="slide"
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Talep Detayı</Text>
              <TouchableOpacity onPress={closeDetails} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
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
            </View>

            <TouchableOpacity style={styles.modalPrimaryButton} onPress={closeDetails}>
              <Text style={styles.modalPrimaryButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
            Max 5MB • JPEG, PNG
          </Text>

          <View style={styles.trackingCard}>
            <View style={styles.trackingHeader}>
              <Text style={styles.trackingTitle}>Talep Takibi</Text>
              <TouchableOpacity
                style={styles.trackingLinkButton}
                onPress={scrollToHistory}
                activeOpacity={0.7}
              >
                <Text style={styles.trackingLinkText}>Geçmişe Git</Text>
              </TouchableOpacity>
            </View>

            {latestRequest ? (
              <>
                <View style={styles.trackingRow}>
                  <Text style={styles.trackingLabel}>Durum:</Text>
                  <Text style={styles.trackingValue}>
                    {latestRequest.status === 'pending' && 'Onay Bekleniyor'}
                    {latestRequest.status === 'approved' && 'Onaylandı'}
                    {latestRequest.status === 'rejected' && 'Reddedildi'}
                    {latestRequest.status === 'cancelled' && 'İptal Edildi'}
                  </Text>
                </View>
                {latestRequest.created_at && (
                  <View style={styles.trackingRow}>
                    <Text style={styles.trackingLabel}>Tarih:</Text>
                    <Text style={styles.trackingValue}>
                      {formatDateTime(latestRequest.created_at)}
                    </Text>
                  </View>
                )}
                {!!latestRequest.reason && (
                  <View style={styles.trackingNote}>
                    <Text style={styles.trackingNoteLabel}>Not:</Text>
                    <Text style={styles.trackingNoteText}>{latestRequest.reason}</Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.trackingEmptyText}>
                Henüz fotoğraf değişiklik talebiniz yok.
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Photo History */}
      {photoHistory && photoHistory.length > 0 && (
        <View
          style={styles.section}
          onLayout={(e) => setHistorySectionY(e.nativeEvent.layout.y)}
        >
          <View style={styles.historyHeader}>
            <Text style={styles.historyIcon}>📜</Text>
            <Text style={styles.sectionTitle}>Fotoğraf Geçmişi</Text>
          </View>
          {photoHistory.map((item, index) => (
            <View key={`photo-history-${item.id}-${index}`} style={styles.historyItem}>
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
                <View style={styles.historyRight}>
                  {item.file_url && (
                    <Image source={{ uri: item.file_url }} style={styles.historyItemPhoto} />
                  )}
                  <TouchableOpacity
                    style={styles.historyDetailButton}
                    onPress={() => openDetails(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.historyDetailButtonText}>Detay</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.background.primary,
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
    color: colors.text.primary,
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
    backgroundColor: colors.border.light,
  },
  photoPlaceholderSmall: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconSmall: {
    fontSize: 32,
  },
  placeholderTextSmall: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
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
  trackingCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  trackingTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  trackingLinkButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[50],
  },
  trackingLinkText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[700],
  },
  trackingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  trackingLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  trackingValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  trackingNote: {
    marginTop: spacing.xs,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  trackingNoteLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  trackingNoteText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  trackingEmptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
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
  historyRight: {
    marginLeft: spacing.md,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  historyDetailButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  historyDetailButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[700],
  },
  historyItemPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border.light,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.bold,
  },
  modalBody: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
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
    backgroundColor: colors.success[50],
    borderColor: colors.success[200],
  },
  badgeRejected: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[200],
  },
  badgePending: {
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
  },
  badgeCancelled: {
    backgroundColor: colors.neutral[50],
    borderColor: colors.neutral[200],
  },
  badgeDefault: {
    backgroundColor: colors.neutral[50],
    borderColor: colors.neutral[200],
  },
  detailNote: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  detailNoteLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  detailNoteText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  compareSection: {
    marginTop: spacing.sm,
  },
  compareTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
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
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  compareImageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareImage: {
    width: '100%',
    height: '100%',
  },
  compareEmptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  modalPrimaryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});

