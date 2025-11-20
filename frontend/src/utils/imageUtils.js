/**
 * @file imageUtils.js
 * @description Image compression and optimization utilities
 * 
 * Özellikler:
 * - Image compression (boyut azaltma)
 * - Image resize (boyutlandırma)
 * - Base64 conversion
 * - Format validation
 */

/**
 * Resize ve compress image
 * @param {File} file - Image file
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: 800) - OPTİMİZE: 1000'den 800'e düşürüldü
 * @param {number} options.maxHeight - Maximum height (default: 800) - OPTİMİZE: 1000'den 800'e düşürüldü
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.7) - OPTİMİZE: 0.8'den 0.7'ye düşürüldü (daha küçük dosya)
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 1) - OPTİMİZE: 2MB'den 1MB'ye düşürüldü
 * @returns {Promise<string>} Base64 string
 * 
 * @note Base64 fotoğraflar liste sayfalarında kullanılmamalı (çok büyük olur)
 *       Bu compression profil fotoğrafları için yeterli (~200-300KB base64)
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 800,  // OPTİMİZE: 1000'den 800'e - profil için yeterli
      maxHeight = 800, // OPTİMİZE: 1000'den 800'e - profil için yeterli
      quality = 0.7,   // OPTİMİZE: 0.8'den 0.7'ye - daha küçük dosya
      maxSizeMB = 1    // OPTİMİZE: 2MB'den 1MB'ye - base64 için yeterli
    } = options;

    // File size kontrolü
    if (file.size > maxSizeMB * 1024 * 1024) {
      reject(new Error(`Dosya boyutu ${maxSizeMB}MB'dan büyük olamaz`));
      return;
    }

    // File type kontrolü
    if (!file.type.startsWith('image/')) {
      reject(new Error('Sadece resim dosyaları yüklenebilir'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Canvas oluştur
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Aspect ratio korunarak resize
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Image'i canvas'a çiz
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Base64'e çevir (JPEG formatında, quality ile)
        const base64 = canvas.toDataURL('image/jpeg', quality);
        
        // Base64 string boyutunu kontrol et
        const base64SizeMB = (base64.length * 3) / 4 / 1024 / 1024;
        if (base64SizeMB > maxSizeMB) {
          // Daha agresif compression dene
          const lowerQuality = Math.max(0.5, quality - 0.2);
          const compressedBase64 = canvas.toDataURL('image/jpeg', lowerQuality);
          resolve(compressedBase64);
        } else {
          resolve(base64);
        }
      };
      img.onerror = () => {
        reject(new Error('Resim yüklenirken bir hata oluştu'));
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      reject(new Error('Dosya okunurken bir hata oluştu'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Image file validation
 * @param {File} file - Image file
 * @param {Object} options - Validation options
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 5)
 * @param {string[]} options.allowedTypes - Allowed MIME types (default: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validateImage = (file, options = {}) => {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  if (!file) {
    return { valid: false, error: 'Dosya seçilmedi' };
  }

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Sadece resim dosyaları yüklenebilir' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Desteklenmeyen dosya formatı. JPG, PNG, GIF veya WEBP kullanın' };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `Dosya boyutu ${maxSizeMB}MB'dan büyük olamaz` };
  }

  return { valid: true };
};

/**
 * Get image dimensions
 * @param {File|string} fileOrUrl - Image file or URL
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (fileOrUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Resim boyutları alınamadı'));
    };
    
    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(fileOrUrl);
    }
  });
};

