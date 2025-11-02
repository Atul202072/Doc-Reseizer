
export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif';

export interface ImageSettings {
  width: number;
  height: number;
  keepAspectRatio: boolean;
  format: ImageFormat;
  maxSizeKB: number;
  quality: number;
}

export interface PdfSettings {
  maxSizeKB: number;
  quality: number; // For JPEG conversion of pages
  width: number;
  height: number;
  keepAspectRatio: boolean;
}