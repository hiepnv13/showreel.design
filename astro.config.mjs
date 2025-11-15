// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

// https://astro.build/config
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  integrations: [tailwind()],
  ...(isProd ? { output: 'server', adapter: netlify() } : {})
});
