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

const coursesCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/courses' }),
  schema: z.object({
    name: z.string(),
    platform: z.string(),
    category: z.enum(['After Effects', 'Cinema 4D', '3D & Blender', 'Character Animation', 'Motion Principles', 'Web Animation']),
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
  tools: toolsCollection,
  courses: coursesCollection,
  shorts: shortsCollection,
};
