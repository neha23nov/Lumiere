const express = require('express');
const router  = express.Router();
const {
  createPost,
  getAllPosts,
  getUserPosts,
  toggleLike,
  deletePost
} = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload }  = require('../middleware/upload.middleware');
const Post        = require('../models/Post');

// specific routes BEFORE /:id
router.get('/', getAllPosts);
router.get('/user/:userId', getUserPosts);

// hall of fame
router.get('/hall-of-fame', async (req, res) => {
  try {
    const winners = await Post.find({ isStarOfWeek: true })
      .populate('author', 'username avatar tier')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts: winners });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch winners' });
  }
});

// protected routes
router.post('/',         protect, upload.single('image'), createPost);
router.post('/:id/like', protect, toggleLike);
router.delete('/:id',    protect, deletePost);

module.exports = router;