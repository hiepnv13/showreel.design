export const prerender = true;

import type { APIRoute } from 'astro';
import { getAllVideos, sortVideosByDate } from '../../utils/videoUtils';

export const GET: APIRoute = async () => {
  const allVideos = sortVideosByDate(await getAllVideos());

  const searchData = allVideos.map(video => ({
    slug:        video.id,
    title:       video.data.title,
    author:      video.data.author,
    authorAvatar: video.data.authorAvatar ?? null,
    category:    video.data.category,
    description: video.data.description,
    tags:        video.data.tags,
    year:        video.data.year ?? null,
    industries:  video.data.industries ?? [],
    styles:      video.data.styles ?? [],
    soundMusic:  video.data.soundMusic ?? [],
    thumbnailUrl: (video.data as any).thumbnailUrl ?? null,
    publishDate: video.data.publishDate?.toISOString() ?? null,
  }));

  return new Response(JSON.stringify(searchData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
