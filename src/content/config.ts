import { defineCollection, z } from 'astro:content';

const videosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    thumbnail: z.string(),
    // Changed from videoUrl to videoFileName for R2 auto-generation
    videoFileName: z.string().refine(
      (fileName) => {
        // Validate file extension
        const validExtensions = ['mp4', 'webm', 'mov', 'avi'];
        const extension = fileName.split('.').pop()?.toLowerCase();
        return extension && validExtensions.includes(extension);
      },
      {
        message: "Video file must have a valid extension (.mp4, .webm, .mov, .avi)"
      }
    ),
    category: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    publishDate: z.date(),
    description: z.string(),
    // Optional quality preference
    quality: z.enum(['4k', '1080p', '720p', 'preview']).default('1080p'),
  }),
});

export const collections = {
  videos: videosCollection,
};