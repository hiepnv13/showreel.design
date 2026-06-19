import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const videosCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    authorAvatar: z.string().optional(),
    thumbnail: z.string(),
    videoFileName: z.string().refine(
      (fileName) => {
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
    quality: z.enum(['4k', '1080p', '720p', 'preview']).default('1080p'),

    year: z.number().min(2000).max(2099).optional(),
    sourceUrl: z.string().url().optional(),

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

const toolsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: z.object({
    name: z.string(),
    category: z.enum(['Animation Software', 'Web & UI Animation', 'AI Motion Tools', 'Assets & Resources']),
    description: z.string(),
    pricing: z.string(),
    href: z.string().url(),
    thumbnail: z.string().optional(),
    tags: z.array(z.object({
      label: z.string(),
      color: z.enum(['blue', 'green', 'orange', 'purple', 'gray']).default('gray'),
    })).optional().default([]),
    featured: z.boolean().default(false),
    order: z.number().optional().default(0),
  }),
});

export const collections = {
  videos: videosCollection,
  tools: toolsCollection,
};
