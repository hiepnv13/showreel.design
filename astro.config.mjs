// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: 'https://showreel.design',
  integrations: [tailwind(), sitemap()],
  ...(isProd ? { output: 'server', adapter: netlify() } : {})
});
