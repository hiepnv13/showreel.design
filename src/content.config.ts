import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { TAXONOMIES } from './config/taxonomies';

// Derive valid values from single source of truth in taxonomies.ts
const industryValues = TAXONOMIES.industries.map(i => i.value) as [string, ...string[]];
const styleValues    = TAXONOMIES.styles.map(s => s.value)    as [string, ...string[]];
const techniqueValues = TAXONOMIES.techniques.map(t => t.value) as [string, ...string[]];
const soundValues    = TAXONOMIES.soundMusic.map(s => s.value) as [string, ...string[]];

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

    industries: z.array(z.enum(industryValues)).optional().default([]),
    styles:     z.array(z.enum(styleValues)).optional().default([]),
    techniques: z.array(z.enum(techniqueValues)).optional().default([]),
    soundMusic: z.array(z.enum(soundValues)).optional().default([]),
  }),
});


const resourcesCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resources' }),
  schema: z.object({
    name: z.string(),
    type: z.enum(['Tools', 'Courses', 'Assets']),
    description: z.string(),
    pricing: z.string(),
    href: z.string().url(),
    banner: z.string().optional(),
    logo: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    featured: z.boolean().default(false),
    order: z.number().optional().default(0),
  }),
});

const launchCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/launch' }),
  schema: z.object({
    title: z.string(),
    brand: z.string(),
    studio: z.string().optional(),
    authorAvatar: z.string().optional(),
    videoFileName: z.string(),
    year: z.number().min(2000).max(2099).optional(),
    description: z.string(),
    sourceUrl: z.string().url().optional(),
    publishDate: z.date(),
    industries: z.array(z.enum(industryValues)).optional().default([]),
    styles:     z.array(z.enum(styleValues)).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    featured: z.boolean().default(false),
    quality: z.enum(['4k', '1080p', '720p', 'preview']).default('1080p'),
  }),
});

// Shorts — WIP, not yet in navigation
const shortsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/shorts' }),
  schema: z.object({
    title: z.string(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    publishDate: z.date().optional(),
  }),
});

export const collections = {
  videos: videosCollection,
  launch: launchCollection,
  resources: resourcesCollection,
  shorts: shortsCollection,
};
