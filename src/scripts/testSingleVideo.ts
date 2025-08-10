// Script test với URL thực tế từ R2
async function testRealVideo() {
  // URL thực tế đã hoạt động
  const testUrl = 'https://video.showreel.design/videos/BB%20Agency%20Showcase%202024.mp4';
  
  console.log(`🔍 Testing real R2 URL: ${testUrl}`);
  
  try {
    const response = await fetch(testUrl, { method: 'HEAD' });
    
    if (response.ok) {
      console.log('✅ R2 Video accessible!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
      
      // Test với GET request để đảm bảo video có thể stream
      console.log('\n🎬 Testing video streaming...');
      const streamResponse = await fetch(testUrl, { 
        method: 'GET',
        headers: { 'Range': 'bytes=0-1023' } // Test first 1KB
      });
      
      if (streamResponse.ok || streamResponse.status === 206) {
        console.log('✅ Video streaming works!');
        console.log(`   Stream Status: ${streamResponse.status}`);
        console.log(`   Content-Range: ${streamResponse.headers.get('content-range')}`);
      } else {
        console.log('⚠️  Video accessible but streaming might have issues');
      }
      
    } else {
      console.log('❌ Video not accessible');
      console.log(`   Status: ${response.status}`);
      console.log(`   Status Text: ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ Network error:', error);
  }
}

// Test domain connectivity
async function testDomain() {
  console.log('🌐 Testing R2 domain connectivity...');
  const domainUrl = 'https://video.showreel.design';
  
  try {
    const response = await fetch(domainUrl, { method: 'HEAD' });
    console.log(`   Domain Status: ${response.status}`);
    console.log(`   Domain accessible: ${response.status < 500 ? '✅' : '❌'}`);
  } catch (error) {
    console.log('❌ Domain error:', error);
  }
  console.log('');
}

async function main() {
  console.log('🚀 R2 Connection Test');
  console.log('====================\n');
  
  await testDomain();
  await testRealVideo();
  
  console.log('\n✨ Test complete!');
}

main();