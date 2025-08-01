const User = require('../models/user');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');

// Configure Cloudinary (should be in a separate config file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadProfilePicture = async (req, res) => {
  try {
    // Get user ID from middleware
    const userId = req.result._id;
    
    // Find user in database
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete previous image if exists
    if (user.profilePicture?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.profilePicture.public_id);
      } catch (cloudinaryErr) {
        console.error('Cloudinary delete error:', cloudinaryErr);
        // Don't fail the request if deletion fails
      }
    }

    // Create a promise to handle the upload stream
    const uploadPromise = new Promise((resolve, reject) => {
      // Create upload stream to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'codeforge-profiles',
          transformation: { 
            width: 300, 
            height: 300, 
            crop: 'thumb',
            gravity: 'face',
            quality: 'auto:best'
          }
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error('Image upload failed'));
          } else {
            resolve(result);
          }
        }
      );

      // Create buffer stream from file
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      bufferStream.pipe(uploadStream);
    });

    // Wait for upload to complete
    const result = await uploadPromise;

    // Update user with new profile picture
    user.profilePicture = {
      public_id: result.public_id,
      url: result.secure_url
    };

    // Save to database
    await user.save();

    // Return success response
    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: result.secure_url
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    
    // Handle different error types
    let status = 500;
    let message = 'Server error';
    
    if (error.message === 'Image upload failed') {
      status = 400;
      message = 'Failed to upload image to cloud service';
    }
    
    res.status(status).json({ error: message });
  }
};

module.exports = {
  uploadProfilePicture
};