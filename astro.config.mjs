// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: 'https://showreel.design',
  integrations: [tailwind(), sitemap()],
  output: 'server',
  adapter: isProd ? netlify() : node({ mode: 'standalone' }),
});
