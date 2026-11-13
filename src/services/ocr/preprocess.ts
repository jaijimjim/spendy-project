/**
 * Image pre-processing before OCR (OMX-029 AC4): decode, downscale long edge to ≤ 2,000 px and
 * convert to grayscale with a mild contrast stretch, which helps Tesseract on coloured slips.
 */
import { targetSize } from '../../domain/file';
import { OcrError } from './types';

export async function preprocessImage(image: Blob): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(image);
  } catch {
    throw new OcrError('corrupt');
  }
  const { width, height } = targetSize(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    bitmap.close();
    return image;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const img = ctx.getImageData(0, 0, width, height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!;
    // contrast stretch around mid-grey
    const v = Math.max(0, Math.min(255, (y - 128) * 1.25 + 128));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? image), 'image/png'));
}
