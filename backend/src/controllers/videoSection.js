const cloudinary = require('cloudinary').v2;
const Problem = require("../models/problem");
const User = require("../models/user");
const SolutionVideo = require("../models/solutionVideo");


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const userId = req.result._id;
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;
    
    // Upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
};


const saveVideoMetadata = async (req, res) => {
  try {
    const {
      problemId,
      cloudinaryPublicId,
      secureUrl,
      duration,
    } = req.body;

    const userId = req.result._id;

    // Verify the upload with Cloudinary
    const cloudinaryResource = await cloudinary.api.resource(
      cloudinaryPublicId,
      { resource_type: 'video' }
    );

    if (!cloudinaryResource) {
      return res.status(400).json({ error: 'Video not found on Cloudinary' });
    }

    // Check if video already exists for this problem and user
    const existingVideo = await SolutionVideo.findOne({
      problemId,
      userId,
      cloudinaryPublicId
    });

    if (existingVideo) {
      return res.status(409).json({ error: 'Video already exists' });
    }

    // Generate proper thumbnail URL for video
    const thumbnailUrl = cloudinary.url(cloudinaryResource.public_id, {
      resource_type: 'video',
      transformation: [
        { width: 400, height: 225, crop: 'fill' },
        { quality: 'auto' },
        { start_offset: 'auto' }
      ],
      format: 'jpg'
    });

// https://cloudinary.com/documentation/video_effects_and_enhancements#video_thumbnails
    // Create video solution record
    const videoSolution = await SolutionVideo.create({
      problemId,
      userId,
      cloudinaryPublicId,
      secureUrl,
      duration: cloudinaryResource.duration || duration,
      thumbnailUrl
    });


    res.status(201).json({
      message: 'Video solution saved successfully',
      videoSolution: {
        id: videoSolution._id,
        thumbnailUrl: videoSolution.thumbnailUrl,
        duration: videoSolution.duration,
        uploadedAt: videoSolution.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving video metadata:', error);
    res.status(500).json({ error: 'Failed to save video metadata' });
  }
};


const deleteVideo = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.result._id;

    const video = await SolutionVideo.findOneAndDelete({problemId:problemId});
    
   

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' , invalidate: true });

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

// Get video by problem ID
const getVideoByProblem = async (req, res) => {
  try {
    const { problemId } = req.params;

    const video = await SolutionVideo.findOne({ problemId })
      .populate('userId', 'username email')
      .populate('problemId', 'title difficulty');

    if (!video) {
      return res.status(404).json({ error: 'Video not found for this problem' });
    }

    // Generate optimized video URL for streaming
    const optimizedVideoUrl = cloudinary.url(video.cloudinaryPublicId, {
      resource_type: 'video',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    res.json({
      id: video._id,
      videoUrl: optimizedVideoUrl,
      secureUrl: video.secureUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      createdAt: video.createdAt,
      user: video.userId,
      problem: video.problemId
    });

  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
};

// Get all videos for a user
const getUserVideos = async (req, res) => {
  try {
    const userId = req.result._id;
    const { page = 1, limit = 10 } = req.query;

    const videos = await SolutionVideo.find({ userId })
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await SolutionVideo.countDocuments({ userId });

    const videosWithUrls = videos.map(video => {
      const optimizedVideoUrl = cloudinary.url(video.cloudinaryPublicId, {
        resource_type: 'video',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });

      return {
        id: video._id,
        videoUrl: optimizedVideoUrl,
        secureUrl: video.secureUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        createdAt: video.createdAt,
        problem: video.problemId
      };
    });

    res.json({
      videos: videosWithUrls,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching user videos:', error);
    res.status(500).json({ error: 'Failed to fetch user videos' });
  }
};

// Get all videos (admin only)
const getAllVideos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const videos = await SolutionVideo.find()
      .populate('userId', 'username email')
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await SolutionVideo.countDocuments();

    const videosWithUrls = videos.map(video => {
      const optimizedVideoUrl = cloudinary.url(video.cloudinaryPublicId, {
        resource_type: 'video',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });

      return {
        id: video._id,
        videoUrl: optimizedVideoUrl,
        secureUrl: video.secureUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        createdAt: video.createdAt,
        user: video.userId,
        problem: video.problemId
      };
    });

    res.json({
      videos: videosWithUrls,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching all videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

module.exports = {generateUploadSignature,saveVideoMetadata,deleteVideo,getVideoByProblem,getUserVideos,getAllVideos};