import { getCollection, type CollectionEntry } from 'astro:content';
import { generateVideoUrl, generatePreviewUrl, generateVideoSources, generateThumbnailUrl, generateLaunchVideoUrl, generateLaunchThumbnailUrl } from '../config/r2';

// Get all videos from content collection
export async function getAllVideos(): Promise<CollectionEntry<'videos'>[]> {
  const videos = await getCollection('videos');
  return videos.map((video: any) => ({
    ...video,
    // Generate video URLs from fileName
    data: {
      ...video.data,
      videoUrl: generateVideoUrl(video.data.videoFileName, video.data.quality),
      thumbnailUrl: generateThumbnailUrl(video.data.videoFileName),
      previewUrl: generatePreviewUrl(video.data.videoFileName),
      videoSources: generateVideoSources(video.data.videoFileName, video.data.quality)
    }
  }));
}

// Get videos by category
export async function getVideosByCategory(category: string): Promise<CollectionEntry<'videos'>[]> {
  const allVideos = await getAllVideos();
  return allVideos.filter(video => video.data.category === category);
}

// Get videos by category slug
export async function getVideosByCategorySlug(categorySlug: string): Promise<CollectionEntry<'videos'>[]> {
  const allVideos = await getAllVideos();
  return allVideos.filter(video => generateSlug(video.data.category) === categorySlug);
}

// Get featured videos
export async function getFeaturedVideos(): Promise<CollectionEntry<'videos'>[]> {
  const allVideos = await getAllVideos();
  return allVideos.filter(video => video.data.featured);
}

// Get videos by tag
export async function getVideosByTag(tag: string): Promise<CollectionEntry<'videos'>[]> {
  const allVideos = await getAllVideos();
  return allVideos.filter(video => video.data.tags.includes(tag));
}

// Get videos by tag slug
export async function getVideosByTagSlug(tagSlug: string): Promise<CollectionEntry<'videos'>[]> {
  const allVideos = await getAllVideos();
  return allVideos.filter(video => 
    video.data.tags.some(tag => generateSlug(tag) === tagSlug)
  );
}

// Thin wrapper — delegates to the single source of truth in taxonomies.ts
import { getTaxonomyLabel } from '../config/taxonomies';
export function getIndustryLabel(slug: string): string {
  return getTaxonomyLabel('industries', slug);
}

// Get all industries that have at least one video (sorted by count desc)
export async function getAllIndustries(): Promise<string[]> {
  const videos = await getCollection('videos');
  const counts: Record<string, number> = {};
  videos.forEach((video: CollectionEntry<'videos'>) => {
    (video.data.industries ?? []).forEach((ind: string) => {
      counts[ind] = (counts[ind] ?? 0) + 1;
    });
  });
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
}

// Get videos by industry slug
export async function getVideosByIndustry(slug: string): Promise<CollectionEntry<'videos'>[]> {
  const allVideos = await getAllVideos();
  return allVideos.filter(video => (video.data.industries ?? []).includes(slug as any));
}

// Get all styles that have at least one video (sorted by count desc)
export async function getAllStyles(): Promise<string[]> {
  const videos = await getCollection('videos');
  const counts: Record<string, number> = {};
  videos.forEach((video: CollectionEntry<'videos'>) => {
    (video.data.styles ?? []).forEach((s: string) => {
      counts[s] = (counts[s] ?? 0) + 1;
    });
  });
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
}

export async function getVideosByStyle(slug: string): Promise<CollectionEntry<'videos'>[]> {
  const allVideos = await getAllVideos();
  return allVideos.filter(video => (video.data.styles ?? []).includes(slug as any));
}

// Get all sound values that have at least one video (sorted by count desc)
export async function getAllSounds(): Promise<string[]> {
  const videos = await getCollection('videos');
  const counts: Record<string, number> = {};
  videos.forEach((video: CollectionEntry<'videos'>) => {
    (video.data.soundMusic ?? []).forEach((s: string) => {
      if (s !== 'no-sound') counts[s] = (counts[s] ?? 0) + 1;
    });
  });
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
}

export async function getVideosBySound(slug: string): Promise<CollectionEntry<'videos'>[]> {
  const allVideos = await getAllVideos();
  return allVideos.filter(video => (video.data.soundMusic ?? []).includes(slug as any));
}

// Get all unique years (sorted descending)
export async function getAllYears(): Promise<number[]> {
  const videos = await getCollection('videos');
  const years = videos
    .map((video: CollectionEntry<'videos'>) => video.data.year)
    .filter((year): year is number => year !== undefined);
  return [...new Set(years)].sort((a, b) => b - a);
}

// Get videos by year
export async function getVideosByYear(year: number): Promise<CollectionEntry<'videos'>[]> {
  const allVideos = await getAllVideos();
  return allVideos.filter(video => video.data.year === year);
}

// Get all unique categories
export async function getAllCategories(): Promise<string[]> {
  const videos = await getCollection('videos');
  const categories = videos.map((video: CollectionEntry<'videos'>) => video.data.category);
  return [...new Set(categories)];
}

// Get all unique tags
export async function getAllTags(): Promise<string[]> {
  const videos = await getCollection('videos');
  const tags = videos.flatMap((video: CollectionEntry<'videos'>) => video.data.tags);
  return [...new Set(tags)];
}

// Get all unique authors
export async function getAllAuthors(): Promise<string[]> {
  const videos = await getCollection('videos');
  const authors = videos.map((video: CollectionEntry<'videos'>) => video.data.author);
  return [...new Set(authors)];
}

// Sort videos by publish date (newest first)
export function sortVideosByDate(videos: CollectionEntry<'videos'>[]): CollectionEntry<'videos'>[] {
  return videos.sort((a, b) => {
    const dateA = new Date(a.data.publishDate);
    const dateB = new Date(b.data.publishDate);
    return dateB.getTime() - dateA.getTime();
  });
}

// Get video by slug
export async function getVideoBySlug(slug: string): Promise<CollectionEntry<'videos'> | undefined> {
  const allVideos = await getAllVideos();
  return allVideos.find(video => video.id === slug);
}

// Search videos by title or description
export async function searchVideos(query: string): Promise<CollectionEntry<'videos'>[]> {
  const allVideos = await getAllVideos();
  const searchTerm = query.toLowerCase();
  
  return allVideos.filter(video => 
    video.data.title.toLowerCase().includes(searchTerm) ||
    video.data.description.toLowerCase().includes(searchTerm) ||
    video.data.author.toLowerCase().includes(searchTerm) ||
    video.data.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
  );
}

// Get related videos (same category, excluding current video)
export async function getRelatedVideos(
  currentSlug: string, 
  category: string, 
  limit: number = 3
): Promise<CollectionEntry<'videos'>[]> {
  const categoryVideos = await getVideosByCategory(category);
  const relatedVideos = categoryVideos.filter(video => video.id !== currentSlug);
  return sortVideosByDate(relatedVideos).slice(0, limit);
}

// ── Launch Video Utils ────────────────────────────────────────

export async function getAllLaunchVideos(): Promise<CollectionEntry<'launch'>[]> {
  const videos = await getCollection('launch');
  return videos.map((video: any) => ({
    ...video,
    data: {
      ...video.data,
      videoUrl:      generateLaunchVideoUrl(video.data.videoFileName),
      thumbnailUrl:  generateLaunchThumbnailUrl(video.data.videoFileName),
    },
  }));
}

export async function getLaunchVideoBySlug(slug: string): Promise<CollectionEntry<'launch'> | undefined> {
  const all = await getAllLaunchVideos();
  return all.find(v => v.id === slug);
}

export function sortLaunchVideosByDate(videos: CollectionEntry<'launch'>[]): CollectionEntry<'launch'>[] {
  return videos.sort((a, b) =>
    new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime()
  );
}

// Derive unique studio list (dynamic filter) sorted by frequency
export async function getAllStudios(): Promise<string[]> {
  const videos = await getCollection('launch');
  const counts: Record<string, number> = {};
  videos.forEach((v: CollectionEntry<'launch'>) => {
    const s = v.data.studio?.trim();
    if (s) counts[s] = (counts[s] ?? 0) + 1;
  });
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
}

export async function getLaunchVideosByStudio(studio: string): Promise<CollectionEntry<'launch'>[]> {
  const all = await getAllLaunchVideos();
  return all.filter(v => v.data.studio?.trim() === studio);
}

export async function getLaunchVideosByIndustry(slug: string): Promise<CollectionEntry<'launch'>[]> {
  const all = await getAllLaunchVideos();
  return all.filter(v => (v.data.industries ?? []).includes(slug as any));
}

export async function getLaunchVideosByStyle(slug: string): Promise<CollectionEntry<'launch'>[]> {
  const all = await getAllLaunchVideos();
  return all.filter(v => (v.data.styles ?? []).includes(slug as any));
}

// Generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
