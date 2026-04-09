import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn } from 'lucide-react';
import { ModalContainer } from './ModalContainer';
import { getCroppedDataUrl } from '@/utils/imageCrop';

export default function ImageCropModal({
  isOpen,
  title = 'Görseli Kırp',
  imageSrc,
  aspect = 16 / 9,
  objectFit = 'contain',
  output,
  onCancel,
  onConfirm,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [isOpen, imageSrc, aspect]);

  const cropSizeHint = useMemo(() => {
    if (Math.abs(aspect - 2 / 3) < 0.001) return 'Poster (2:3)';
    if (Math.abs(aspect - 3 / 2) < 0.001) return 'Poster (3:2)';
    if (Math.abs(aspect - 3 / 4) < 0.001) return 'Poster (3:4)';
    if (Math.abs(aspect - 16 / 9) < 0.001) return 'Banner (16:9)';
    return `Oran: ${aspect.toFixed(2)}`;
  }, [aspect]);

  const onCropComplete = useCallback((_croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const dataUrl = await getCroppedDataUrl(imageSrc, croppedAreaPixels, {
        type: 'image/jpeg',
        quality: output?.quality ?? 0.85,
        maxWidth: output?.maxWidth ?? null,
        maxHeight: output?.maxHeight ?? null,
      });
      onConfirm?.(dataUrl);
    } finally {
      setIsSaving(false);
    }
  }, [croppedAreaPixels, imageSrc, onConfirm, output?.maxHeight, output?.maxWidth, output?.quality]);

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="large"
      closeOnBackdrop={!isSaving}
      align="center"
      maxHeight="85vh"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">{cropSizeHint}</div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full h-[380px] md:h-[460px] rounded-2xl overflow-hidden bg-white">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit={objectFit}
              showGrid={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-300">
              Görsel yükleniyor…
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 w-24">
            <ZoomIn className="w-4 h-4" />
            Zoom
          </div>
          <input
            type="range"
            min={objectFit === 'contain' ? 0.7 : 1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
          <div className="w-14 text-right text-sm text-gray-500 tabular-nums">
            {zoom.toFixed(2)}x
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving || !croppedAreaPixels}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Kaydediliyor…' : 'Kırp ve Kullan'}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}

