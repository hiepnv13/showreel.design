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

    // NEW: Additional showreel fields (all optional for migration)
    year: z.number().min(2000).max(2099).optional(),
    duration: z.number().optional(), // in seconds
    sourceUrl: z.string().url().optional(),

    // NEW: Multi-select taxonomies (optional)
    industries: z.array(z.enum([
      'tech-saas',
      'fashion-luxury',
      'advertising-commercial',
      'entertainment-media',
      'finance-banking',
      'automotive',
      'sports-fitness',
      'food-beverage',
      'healthcare',
      'education',
      'real-estate',
      'other'
    ])).optional().default([]),

    styles: z.array(z.enum([
      'minimal-clean',
      'bold-vibrant',
      '3d-cgi',
      'hand-drawn',
      'retro-vintage',
      'futuristic-tech',
      'organic-natural',
      'geometric-abstract',
      'cinematic-dramatic',
      'playful-quirky',
      'elegant-sophisticated',
      'dark-moody'
    ])).optional().default([]),

    techniques: z.array(z.enum([
      '2d-animation',
      '3d-cgi',
      'mixed-media',
      'kinetic-typography',
      'motion-graphics',
      'stop-motion',
      'live-action-vfx',
      'cel-animation',
      'liquid-simulation',
      'particle-effects',
      'character-animation',
      'logo-animation'
    ])).optional().default([]),

    soundMusic: z.array(z.enum([
      'electronic-synth',
      'epic-cinematic',
      'chill-ambient',
      'jazz-acoustic',
      'rock-energetic',
      'orchestral-classical',
      'hip-hop-urban',
      'no-sound',
      'voiceover-heavy',
      'sound-design-focused'
    ])).optional().default([]),
  }),
});

export const collections = {
  videos: videosCollection,
};