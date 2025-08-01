const express = require('express');
const picRouter = express.Router();
const multer = require('multer');
const profileController = require('../controllers/profileController');
const userMiddleware = require('../middleware/userMiddleware');

// Configure memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload profile picture route
picRouter.put(
  '/upload',
  userMiddleware,
  upload.single('profilePicture'),
  profileController.uploadProfilePicture
);

module.exports = picRouter;