const Blog = require('../models/blog');
const User = require('../models/user');

// Create a new blog
const createBlog = async (req, res) => {
  try {
    const { title, content, isAnonymous = false, category = 'other' } = req.body;
    const author = req.result._id; // From middleware

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }

    // Validate category
    const validCategories = ['interview', 'contest', 'career', 'other'];
    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category. Must be one of: interview, contest, career, other'
      });
    }

    const blog = new Blog({
      title,
      content,
      author,
      isAnonymous: Boolean(isAnonymous),
      category: category.toLowerCase()
    });

    await blog.save();

    // Add blog to user's blogs array
    await User.findByIdAndUpdate(author, {
      $push: { blogs: blog._id }
    });

    // Populate the response based on anonymous setting - FIXED
    let populatedBlog;
    if (isAnonymous) {
      // For anonymous blogs, don't populate author
      populatedBlog = await Blog.findById(blog._id)
        .populate({
          path: 'comments.user',
          select: 'firstName lastName profilePicture'
        });
      
      // Convert to object and set author to null
      populatedBlog = populatedBlog.toObject();
      populatedBlog.author = null;
    } else {
      // For non-anonymous blogs, populate author normally
      populatedBlog = await Blog.findById(blog._id)
        .populate('author', 'firstName lastName profilePicture')
        .populate({
          path: 'comments.user',
          select: 'firstName lastName profilePicture'
        });
    }

    res.status(201).json({
      success: true,
      data: populatedBlog
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all blogs with pagination, author details, and filtering
const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const isAnonymous = req.query.anonymous;

    // Build filter object
    let filter = {};
    
    if (category && category !== 'all') {
      filter.category = category.toLowerCase();
    }
    
    if (isAnonymous !== undefined) {
      filter.isAnonymous = isAnonymous === 'true';
    }

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'firstName lastName profilePicture') // Always populate, we'll handle anonymity below
      .populate({
        path: 'comments.user',
        select: 'firstName lastName profilePicture'
      });

    // Handle anonymous blogs - set author to null for anonymous posts
    const processedBlogs = blogs.map(blog => {
      const blogObj = blog.toObject();
      if (blogObj.isAnonymous) {
        blogObj.author = null;
      }
      return blogObj;
    });

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      data: processedBlogs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      filters: {
        category: category || 'all',
        anonymous: isAnonymous
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get a single blog with detailed information
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'firstName lastName profilePicture') // Always populate
      .populate('likes', 'firstName lastName profilePicture')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName profilePicture'
      });

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    // Handle anonymous blog
    let populatedBlog = blog.toObject();
    if (blog.isAnonymous) {
      populatedBlog.author = null;
    }

    res.json({
      success: true,
      data: populatedBlog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add a comment to a blog
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const blogId = req.params.id;
    const userId = req.result._id; // From middleware

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Comment text is required'
      });
    }

    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: {
          comments: {
            user: userId,
            text
          }
        }
      },
      { new: true }
    )
      .populate('author', 'firstName lastName profilePicture') // Always populate
      .populate({
        path: 'comments.user',
        select: 'firstName lastName profilePicture'
      });

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    // Handle anonymous blog
    let processedBlog = blog.toObject();
    if (blog.isAnonymous) {
      processedBlog.author = null;
    }

    res.json({
      success: true,
      data: processedBlog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Like/unlike a blog
const toggleLike = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.result._id; // From middleware

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    const likeIndex = blog.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Like the blog
      blog.likes.push(userId);
    } else {
      // Unlike the blog
      blog.likes.splice(likeIndex, 1);
    }

    await blog.save();
    
    // Handle anonymous blog population - FIXED
    const populatedBlog = await Blog.findById(blogId)
      .populate('author', 'firstName lastName profilePicture') // Always populate
      .populate('likes', 'firstName lastName profilePicture')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName profilePicture'
      });

    // Convert to object and handle anonymity
    let responseData = populatedBlog.toObject();
    if (populatedBlog.isAnonymous) {
      responseData.author = null;
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get blog categories with counts
const getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Add total count
    const total = await Blog.countDocuments();
    
    const categoriesWithTotal = [
      { _id: 'all', count: total },
      ...categories
    ];

    res.json({
      success: true,
      data: categoriesWithTotal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  toggleLike,
  createBlog,
  addComment,
  getBlogById,
  getAllBlogs,
  getBlogCategories
};