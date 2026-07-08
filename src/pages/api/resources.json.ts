export const prerender = true;

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const all = await getCollection('resources');
  const data = all.map(r => ({
    name:        r.data.name,
    type:        r.data.type,
    description: r.data.description,
    href:        r.data.href,
    logo:        r.data.logo ?? null,
    tags:        r.data.tags ?? [],
  }));
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
