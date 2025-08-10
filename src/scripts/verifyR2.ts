import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { R2_CONFIG, generateVideoUrl, generatePreviewUrl } from '../config/r2';

// Đọc video files từ content directory
function getVideoFiles() {
  const videosDir = join(process.cwd(), 'src/content/videos');
  const files = readdirSync(videosDir);
  
  return files
    .filter((file: string) => file.endsWith('.md'))
    .map((file: string) => {
      const content = readFileSync(join(videosDir, file), 'utf-8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
        const videoFileNameMatch = frontmatter.match(/videoFileName:\s*"([^"]+)"/);
        const qualityMatch = frontmatter.match(/quality:\s*"([^"]+)"/);
        
        return {
          title: titleMatch ? titleMatch[1] : 'Unknown',
          videoFileName: videoFileNameMatch ? videoFileNameMatch[1] : null,
          quality: qualityMatch ? qualityMatch[1] : '1080p'
        };
      }
      
      return null;
    })
    .filter(Boolean);
}

// Verify URL function
async function verifyUrl(url: string): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return {
      success: response.ok,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Test R2 domain connectivity
async function testR2Domain(): Promise<void> {
  console.log('🔍 Testing R2 domain connectivity...');
  console.log(`Domain: ${R2_CONFIG.BASE_URL}`);
  
  const result = await verifyUrl(R2_CONFIG.BASE_URL);
  
  if (result.success) {
    console.log('✅ R2 domain is accessible');
  } else {
    console.log('❌ R2 domain is not accessible');
    console.log(`   Status: ${result.status || 'N/A'}`);
    console.log(`   Error: ${result.error || 'N/A'}`);
  }
  console.log('');
}

// Verify all video URLs
async function verifyAllVideos(): Promise<void> {
  console.log('🎬 Verifying video URLs...');
  
  const videos = getVideoFiles();
  const results = [];
  
  for (const video of videos) {
    if (!video.videoFileName) {
      console.log(`⚠️  ${video.title}: No videoFileName specified`);
      continue;
    }
    
    const mainUrl = generateVideoUrl(video.videoFileName, video.quality);
    const previewUrl = generatePreviewUrl(video.videoFileName);
    
    console.log(`\n📹 ${video.title}`);
    console.log(`   File: ${video.videoFileName}`);
    console.log(`   Quality: ${video.quality}`);
    
    // Verify main video URL
    console.log(`   Testing main URL: ${mainUrl}`);
    const mainResult = await verifyUrl(mainUrl);
    
    if (mainResult.success) {
      console.log('   ✅ Main video URL is accessible');
    } else {
      console.log('   ❌ Main video URL is not accessible');
      console.log(`      Status: ${mainResult.status || 'N/A'}`);
      console.log(`      Error: ${mainResult.error || 'N/A'}`);
    }
    
    // Verify preview URL
    console.log(`   Testing preview URL: ${previewUrl}`);
    const previewResult = await verifyUrl(previewUrl);
    
    if (previewResult.success) {
      console.log('   ✅ Preview URL is accessible');
    } else {
      console.log('   ❌ Preview URL is not accessible');
      console.log(`      Status: ${previewResult.status || 'N/A'}`);
      console.log(`      Error: ${previewResult.error || 'N/A'}`);
    }
    
    results.push({
      title: video.title,
      videoFileName: video.videoFileName,
      mainUrl,
      previewUrl,
      mainAccessible: mainResult.success,
      previewAccessible: previewResult.success,
      mainStatus: mainResult.status,
      previewStatus: previewResult.status
    });
  }
  
  // Summary
  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('========================');
  
  const totalVideos = results.length;
  const accessibleMain = results.filter(r => r.mainAccessible).length;
  const accessiblePreview = results.filter(r => r.previewAccessible).length;
  
  console.log(`Total videos: ${totalVideos}`);
  console.log(`Main URLs accessible: ${accessibleMain}/${totalVideos} (${Math.round(accessibleMain/totalVideos*100)}%)`);
  console.log(`Preview URLs accessible: ${accessiblePreview}/${totalVideos} (${Math.round(accessiblePreview/totalVideos*100)}%)`);
  
  if (accessibleMain < totalVideos || accessiblePreview < totalVideos) {
    console.log('\n⚠️  Some URLs are not accessible. Please check:');
    console.log('   1. Videos are uploaded to R2');
    console.log('   2. R2 bucket is publicly accessible');
    console.log('   3. Domain configuration is correct');
    console.log('   4. File names match exactly');
  }
}

// Main execution
async function main() {
  console.log('🚀 R2 Video URL Verification');
  console.log('============================\n');
  
  // Test domain connectivity
  await testR2Domain();
  
  // Verify all video URLs
  await verifyAllVideos();
  
  console.log('\n✨ Verification complete!');
}

main().catch(console.error);