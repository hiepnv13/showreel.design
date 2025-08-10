// R2 Configuration for video.showreel.design
export const R2_CONFIG = {
  // Base domain for R2 videos
  BASE_URL: 'https://video.showreel.design',
  
  // Video directory path
  VIDEO_PATH: '/videos',
  
  // Supported video formats (ordered by preference for fallback)
  SUPPORTED_FORMATS: [
    'mp4',
    'webm',
    'mov',
    'avi'
  ] as const,
  
  // Quality variants (if you have multiple qualities)
  QUALITY_VARIANTS: {
    '4k': '4k',
    '1080p': '1080p',
    '720p': '720p',
    'preview': 'preview' // For hover previews
  } as const,
  
  // CDN optimization settings
  CDN_PARAMS: {
    // Cache control headers
    CACHE_CONTROL: 'public, max-age=31536000', // 1 year
    
    // Video optimization parameters
    AUTO_FORMAT: true, // Let CDN choose best format
    AUTO_QUALITY: true, // Let CDN choose best quality
    
    // Preload settings
    PRELOAD_METADATA: 'metadata', // Only load metadata initially
    PRELOAD_PREVIEW: 'none' // Don't preload full video
  }
} as const;

// Type definitions
export type VideoFormat = typeof R2_CONFIG.SUPPORTED_FORMATS[number];
export type VideoQuality = keyof typeof R2_CONFIG.QUALITY_VARIANTS;

/**
 * Generate full video URL from filename
 * @param fileName - Video filename (with or without extension)
 * @param quality - Optional quality variant
 * @param format - Optional format override
 * @returns Full video URL
 */
export function generateVideoUrl(
  fileName: string,
  quality?: VideoQuality,
  format?: VideoFormat
): string {
  // Remove extension if present to normalize
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  
  // Build filename with quality and format
  let finalFileName = baseName;
  
  // Add quality suffix if specified
  if (quality && quality !== '1080p') { // Default is 1080p, no suffix needed
    finalFileName += `-${R2_CONFIG.QUALITY_VARIANTS[quality]}`;
  }
  
  // Add format extension
  const fileFormat = format || 'mp4'; // Default to mp4
  finalFileName += `.${fileFormat}`;
  
  // Build full URL
  return `${R2_CONFIG.BASE_URL}${R2_CONFIG.VIDEO_PATH}/${finalFileName}`;
}

/**
 * Generate multiple format URLs for video element sources
 * @param fileName - Video filename
 * @param quality - Quality variant
 * @returns Array of source objects for video element
 */
export function generateVideoSources(
  fileName: string,
  quality: VideoQuality = '1080p'
): Array<{ src: string; type: string }> {
  return R2_CONFIG.SUPPORTED_FORMATS.map(format => ({
    src: generateVideoUrl(fileName, quality, format),
    type: `video/${format === 'mov' ? 'quicktime' : format}`
  }));
}

/**
 * Generate preview video URL (lower quality for hover)
 * @param fileName - Video filename
 * @returns Preview video URL
 */
export function generatePreviewUrl(fileName: string): string {
  return generateVideoUrl(fileName, 'preview', 'mp4');
}

/**
 * Verify if video URL is accessible
 * @param url - Video URL to check
 * @returns Promise<boolean>
 */
export async function verifyVideoUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn(`Failed to verify video URL: ${url}`, error);
    return false;
  }
}

/**
 * Get best available video URL with fallback
 * @param fileName - Video filename
 * @param quality - Preferred quality
 * @returns Promise<string> - Best available video URL
 */
export async function getBestVideoUrl(
  fileName: string,
  quality: VideoQuality = '1080p'
): Promise<string> {
  // Try preferred quality first
  const preferredUrl = generateVideoUrl(fileName, quality);
  
  if (await verifyVideoUrl(preferredUrl)) {
    return preferredUrl;
  }
  
  // Fallback to 1080p if different quality was requested
  if (quality !== '1080p') {
    const fallbackUrl = generateVideoUrl(fileName, '1080p');
    if (await verifyVideoUrl(fallbackUrl)) {
      return fallbackUrl;
    }
  }
  
  // Final fallback to basic filename
  const basicUrl = generateVideoUrl(fileName);
  return basicUrl;
}

// Environment-based configuration
export const getR2Config = () => {
  const isDev = import.meta.env.DEV;
  
  return {
    ...R2_CONFIG,
    // Use different settings for development if needed
    CDN_PARAMS: {
      ...R2_CONFIG.CDN_PARAMS,
      CACHE_CONTROL: isDev ? 'no-cache' : R2_CONFIG.CDN_PARAMS.CACHE_CONTROL
    }
  };
};