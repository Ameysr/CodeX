const express = require('express');
const blogRoutes = express.Router();
const {
  toggleLike,
  createBlog,
  addComment,
  getBlogById,
  getAllBlogs,
  getBlogCategories
} = require('../controllers/blogController');
const userMiddleware = require('../middleware/userMiddleware'); // Your authentication middleware

// Get blog categories with counts (public)
blogRoutes.get('/categories', getBlogCategories);

// Create a blog (protected)
blogRoutes.post('/', userMiddleware, createBlog);

// Get all blogs with filtering support (public)
// Query parameters: ?page=1&limit=10&category=interview&anonymous=true
blogRoutes.get('/', getAllBlogs);

// Get single blog (public)
blogRoutes.get('/:id', getBlogById);

// Add comment to blog (protected)
blogRoutes.post('/:id/comments', userMiddleware, addComment);

// Like/unlike a blog (protected)
blogRoutes.post('/:id/like', userMiddleware, toggleLike);

module.exports = blogRoutes;