export const prerender = true;

import type { APIRoute } from 'astro';
import shorts from '../../data/shorts.json';

function parseFilename(file: string) {
  const base = file.replace(/\.(mp4|webm|mov)$/i, '');
  const parts = base.split('--');
  return {
    brand:  parts[0]?.trim() ?? '',
    agency: parts[1]?.trim() ?? '',
  };
}

export const GET: APIRoute = async () => {
  const data = (shorts as string[]).map(file => ({
    file,
    ...parseFilename(file),
  }));
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
