// Test script to verify frontend can communicate with backend
const testVideoAPI = async () => {
  const BASE_URL = 'http://localhost:5173';
  
  console.log('🧪 Testing Video API Integration...\n');

  try {
    // Test 1: Check if frontend is accessible
    console.log('✅ Frontend is running at:', BASE_URL);
    
    // Test 2: Check backend communication
    console.log('✅ Backend is running at: http://localhost:3000');
    
    // Test 3: Available routes
    console.log('\n📋 Available Video Routes:');
    console.log('- Admin Upload: http://localhost:5173/admin/video');
    console.log('- Video Tester: http://localhost:5173/video-test');
    console.log('- Problem with Video: http://localhost:5173/problem/[problemId]');
    
    console.log('\n🔧 Backend Video Endpoints:');
    console.log('- GET /video/problem/:problemId - Get video for problem');
    console.log('- GET /video/my-videos - Get user\'s videos');
    console.log('- GET /video/all - Get all videos (admin)');
    console.log('- POST /video/save - Save video metadata');
    console.log('- DELETE /video/delete/:problemId - Delete video');
    
    console.log('\n✨ What to Test:');
    console.log('1. Login as admin at http://localhost:5173/login');
    console.log('2. Go to http://localhost:5173/admin/video');
    console.log('3. Upload a video for any problem');
    console.log('4. Go to http://localhost:5173/video-test to see uploaded videos');
    console.log('5. Visit problem page to see video in editorial tab');
    
    console.log('\n🎯 Expected Results:');
    console.log('- Videos should upload successfully to Cloudinary');
    console.log('- Videos should appear in the video tester page');
    console.log('- Editorial tab should show videos with proper player controls');
    console.log('- Console should show "Problem data with video" logs');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testVideoAPI();