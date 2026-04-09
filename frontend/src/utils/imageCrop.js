export async function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

export async function getCroppedDataUrl(
  imageSrc,
  pixelCrop,
  { type = 'image/jpeg', quality = 0.85, maxWidth = null, maxHeight = null } = {}
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  let targetW = pixelCrop.width;
  let targetH = pixelCrop.height;

  const widthScale = maxWidth ? Math.min(1, maxWidth / targetW) : 1;
  const heightScale = maxHeight ? Math.min(1, maxHeight / targetH) : 1;
  const scale = Math.min(widthScale, heightScale);
  if (scale < 1) {
    targetW = Math.max(1, Math.round(targetW * scale));
    targetH = Math.max(1, Math.round(targetH * scale));
  }

  canvas.width = targetW;
  canvas.height = targetH;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetW,
    targetH
  );

  return canvas.toDataURL(type, quality);
}

