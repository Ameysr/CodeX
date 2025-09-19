import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import Editorial from './Editorial';

const VideoTester = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/video/my-videos');
      setVideos(response.data.videos);
      console.log('User videos:', response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch videos');
      console.error('Video fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Loading videos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg m-4">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Video Tester Component</h1>
      
      {videos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📹</div>
          <h3 className="text-xl font-semibold mb-2">No Videos Found</h3>
          <p className="text-gray-500">Upload some videos from the admin panel first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  {video.problem?.title || 'Unknown Problem'}
                  <div className="badge badge-secondary">
                    {video.problem?.difficulty || 'N/A'}
                  </div>
                </h2>
                
                <div className="my-4">
                  <Editorial 
                    secureUrl={video.videoUrl}
                    thumbnailUrl={video.thumbnailUrl}
                    duration={video.duration}
                  />
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>Duration: {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}</p>
                  <p>Uploaded: {new Date(video.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="card-actions justify-end">
                  <a 
                    href={video.secureUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    Open in New Tab
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoTester;