import type { APIRoute } from 'astro';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export const prerender = false;

// Helper function to generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Helper function to format date for frontmatter
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Helper function to generate markdown content
function generateMarkdownContent(data: any): string {
    const {
        title,
        author,
        videoFileName,
        category,
        tags,
        featured,
        publishDate,
        description,
        quality,
        content,
        highlights,
        applications,
        // NEW fields
        year,
        duration,
        sourceUrl,
        industries,
        styles,
        techniques,
        soundMusic
    } = data;

    // Format tags array
    const tagsArray = Array.isArray(tags) ? tags : [];
    const tagsString = tagsArray.length > 0
        ? `[${tagsArray.map(tag => `"${tag}"`).join(', ')}]`
        : '[]';

    // Format taxonomy arrays
    const formatTaxonomy = (arr: any) => {
        const array = Array.isArray(arr) ? arr : [];
        return array.length > 0
            ? `[${array.map(item => `"${item}"`).join(', ')}]`
            : '[]';
    };

    // Generate frontmatter with new fields
    const frontmatter = `---
title: "${title}"
author: "${author}"
thumbnail: "/placeholder.svg"
videoFileName: "${videoFileName}"
category: "${category}"
tags: ${tagsString}
featured: ${featured === true || featured === 'true' ? 'true' : 'false'}
publishDate: ${formatDate(publishDate)}
description: "${description}"
quality: "${quality || '1080p'}"${year ? `\nyear: ${year}` : ''}${duration ? `\nduration: ${duration}` : ''}${sourceUrl ? `\nsourceUrl: "${sourceUrl}"` : ''}
industries: ${formatTaxonomy(industries)}
styles: ${formatTaxonomy(styles)}
techniques: ${formatTaxonomy(techniques)}
soundMusic: ${formatTaxonomy(soundMusic)}
---`;

    // Generate main content
    let mainContent = content || `# ${title}\n\nThis project showcases ${description.toLowerCase()}`;
    
    // Add project highlights if provided
    if (highlights && highlights.trim()) {
        const highlightLines = highlights.split('\n')
            .filter((line: string) => line.trim())
            .map((line: string) => `- **${line.trim()}**`)
            .join('\n');
        
        mainContent += `\n\n## Project Highlights\n\n${highlightLines}`;
    }
    
    // Add technical details section
    mainContent += `\n\n## Technical Details\n\nThe animations were created using industry-standard tools and techniques, ensuring high-quality output suitable for various media applications.`;
    
    // Add applications if provided
    if (applications && applications.trim()) {
        const applicationLines = applications.split('\n')
            .filter((line: string) => line.trim())
            .map((line: string) => `- ${line.trim()}`)
            .join('\n');
        
        mainContent += `\n\n## Applications\n\nThese animations are perfect for:\n${applicationLines}`;
    }

    return `${frontmatter}\n\n${mainContent}`;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        console.log('Request received:', request.method);
        console.log('Content-Type:', request.headers.get('content-type'));
        
        const body = await request.text();
        console.log('Raw body:', body);
        
        if (!body || body.trim() === '') {
            return new Response(
                JSON.stringify({ error: 'Request body is empty' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        const data = JSON.parse(body);
        
        // Validate required fields
        const requiredFields = ['title', 'author', 'videoFileName', 'category', 'publishDate', 'description'];
        for (const field of requiredFields) {
            if (!data[field] || data[field].toString().trim() === '') {
                return new Response(
                    JSON.stringify({ error: `${field} is required` }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }
        
        // Generate slug and filename
        const slug = generateSlug(data.title);
        const filename = `${slug}.md`;
        
        // Generate markdown content
        const markdownContent = generateMarkdownContent(data);
        
        // Write file to content/videos directory
        const filePath = join(process.cwd(), 'src', 'content', 'videos', filename);
        await writeFile(filePath, markdownContent, 'utf-8');
        
        return new Response(
            JSON.stringify({ 
                success: true, 
                filename,
                slug,
                message: 'Video post created successfully!' 
            }),
            { 
                status: 200, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
        
    } catch (error) {
        console.error('Error creating video post:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Failed to create video post',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }
};