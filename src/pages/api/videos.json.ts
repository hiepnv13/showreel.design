import type { APIRoute } from 'astro';
import { getAllVideos } from '../../utils/videoUtils';

export const GET: APIRoute = async () => {
  try {
    const allVideos = await getAllVideos();
    
    // Return simplified video data for search suggestions
    const searchData = allVideos.map(video => ({
      title: video.data.title,
      author: video.data.author,
      category: video.data.category,
      tags: video.data.tags,
      slug: video.slug,
      description: video.data.description
    }));
    
    return new Response(JSON.stringify(searchData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error('Error fetching videos for search:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch videos' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};