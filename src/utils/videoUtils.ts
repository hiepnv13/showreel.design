import { getCollection, type CollectionEntry } from 'astro:content';
import { generateVideoUrl, generatePreviewUrl, generateVideoSources } from '../config/r2';

// Get all videos from content collection
export async function getAllVideos(): Promise<CollectionEntry<'videos'>[]> {
  const videos = await getCollection('videos');
  return videos.map((video: any) => ({
    ...video,
    // Generate video URLs from fileName
    data: {
      ...video.data,
      videoUrl: generateVideoUrl(video.data.videoFileName, video.data.quality),
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

// Get videos by author
export async function getVideosByAuthor(author: string): Promise<CollectionEntry<'videos'>[]> {
  const allVideos = await getAllVideos();
  return allVideos.filter(video => video.data.author === author);
}

// Get videos by author slug
export async function getVideosByAuthorSlug(authorSlug: string): Promise<CollectionEntry<'videos'>[]> {
  const allVideos = await getAllVideos();
  return allVideos.filter(video => generateSlug(video.data.author) === authorSlug);
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
  return allVideos.find(video => video.slug === slug);
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
  const relatedVideos = categoryVideos.filter(video => video.slug !== currentSlug);
  return sortVideosByDate(relatedVideos).slice(0, limit);
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
