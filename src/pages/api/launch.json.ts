export const prerender = true;

import type { APIRoute } from 'astro';
import { getAllLaunchVideos, sortLaunchVideosByDate } from '../../utils/videoUtils';

export const GET: APIRoute = async () => {
  const all = sortLaunchVideosByDate(await getAllLaunchVideos());
  const data = all.map(v => ({
    slug:        v.id,
    title:       v.data.title,
    brand:       v.data.brand,
    studio:      v.data.studio ?? null,
    description: v.data.description,
    tags:        v.data.tags ?? [],
    thumbnailUrl: (v.data as any).thumbnailUrl ?? null,
  }));
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
