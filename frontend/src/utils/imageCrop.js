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

export async function getFittedDataUrl(
  imageSrc,
  {
    type = 'image/jpeg',
    quality = 0.85,
    targetWidth,
    targetHeight,
    background = '#ffffff',
    scale = 1,
  } = {}
) {
  if (!targetWidth || !targetHeight) {
    throw new Error('targetWidth and targetHeight are required');
  }

  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  const tw = Math.max(1, Math.round(Number(targetWidth)));
  const th = Math.max(1, Math.round(Number(targetHeight)));
  const safeScale = Math.max(1, Number(scale) || 1);

  canvas.width = tw;
  canvas.height = th;

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, tw, th);

  const ratio = Math.min(tw / image.width, th / image.height);
  const drawW = image.width * ratio * safeScale;
  const drawH = image.height * ratio * safeScale;
  const dx = (tw - drawW) / 2;
  const dy = (th - drawH) / 2;

  ctx.drawImage(image, dx, dy, drawW, drawH);
  return canvas.toDataURL(type, quality);
}

