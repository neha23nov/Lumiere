const Post            = require('../models/Post');
const User            = require('../models/User');
const { uploadImage } = require('../services/imagekit.service');
const { analyseImage} = require('../services/claude.service');

// ─────────────────────────────────────
// CREATE POST
// ─────────────────────────────────────
const createPost = async (req, res) => {
  try {
    const { caption, type, scheduledAt } = req.body;
    const userWantsPublic = req.body.isPublic !== 'false';

    if (type === 'thought') {
      if (!caption) {
        return res.status(400).json({
          success: false,
          message: 'Caption is required'
        });
      }
      const post = await Post.create({
        author:      req.user._id,
        type:        'thought',
        caption,
        isPublic:    userWantsPublic,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null
      });
      await post.populate('author', 'username avatar tier');
      return res.status(201).json({ success: true, post });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const imageUrl = await uploadImage(req.file.buffer, req.file.originalname);

    let captions, mood, qualityScore;
    try {
      const result = await analyseImage(imageUrl);
      captions     = result.captions;
      mood         = result.mood;
      qualityScore = result.qualityScore;
    } catch (aiError) {
      console.log('AI unavailable — using defaults');
      captions     = ['A moment worth keeping', 'Light and time', 'Still life'];
      mood         = ['serene'];
      qualityScore = 75;
    }

    const aiApproved = qualityScore >= 50;
    const isPublic   = aiApproved && userWantsPublic;

    const finalCaption = caption && caption.trim()
      ? caption.trim()
      : (captions[0] || 'Untitled');

    const post = await Post.create({
      author:               req.user._id,
      type:                 'image',
      imageUrl,
      caption:              finalCaption,
      mood,
      qualityScore,
      aiCaptionSuggestions: captions,
      isPublic,
      scheduledAt:          scheduledAt ? new Date(scheduledAt) : null
    });

    let pointsEarned = 0;
    if (qualityScore >= 75)      pointsEarned = 10;
    else if (qualityScore >= 50) pointsEarned = 3;

    if (pointsEarned > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: pointsEarned }
      });
    }

    await post.populate('author', 'username avatar tier');

    res.status(201).json({
      success: true,
      post,
      aiSuggestions: {
        captions,
        mood,
        qualityScore,
        qualityMessage: !isPublic && !userWantsPublic
          ? 'Post saved privately as requested.'
          : !isPublic
          ? 'Photo saved privately — quality score too low.'
          : qualityScore >= 75
          ? 'Excellent quality — eligible for Star of the Week!'
          : 'Good quality — published to the gallery.'
      },
      pointsEarned
    });

  } catch (err) {
    console.error('createPost error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create post: ' + err.message
    });
  }
};

// ─────────────────────────────────────
// GET ALL POSTS — public feed
// ─────────────────────────────────────
const getAllPosts = async (req, res) => {
  try {
    const { mood, page = 1, limit = 12 } = req.query;

    const query = {
      isPublic: true,
      $or: [
        { scheduledAt: null },
        { scheduledAt: { $lte: new Date() } }
      ]
    };

    if (mood) query.mood = { $in: [mood] };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Post.countDocuments(query);

    const posts = await Post.find(query)
      .populate('author', 'username avatar tier starBadges')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      posts,
      pagination: {
        total,
        page:       Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        hasMore:    skip + posts.length < total
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
};

// ─────────────────────────────────────
// GET USER POSTS
// ─────────────────────────────────────
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      author:   req.params.userId,
      isPublic: true
    })
      .populate('author', 'username avatar tier')
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
};

// ─────────────────────────────────────
// TOGGLE LIKE
// ─────────────────────────────────────
const toggleLike = async (req, res) => {
  try {
    const post   = await Post.findById(req.params.id);
    const userId = req.user._id;

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const alreadyLiked = post.likes.some(
      id => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      await Post.findByIdAndUpdate(req.params.id, {
        $pull: { likes: userId }
      });
      await User.findByIdAndUpdate(post.author, { $inc: { points: -2 } });
      return res.json({
        success:    true,
        liked:      false,
        likesCount: post.likes.length - 1
      });
    } else {
      await Post.findByIdAndUpdate(req.params.id, {
        $addToSet: { likes: userId }
      });
      await User.findByIdAndUpdate(post.author, { $inc: { points: 2 } });
      return res.json({
        success:    true,
        liked:      true,
        likesCount: post.likes.length + 1
      });
    }

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle like' });
  }
};

// ─────────────────────────────────────
// DELETE POST
// ─────────────────────────────────────
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorised to delete this post'
      });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
};

// ─────────────────────────────────────
// EXPORTS — all 5 functions
// ─────────────────────────────────────
module.exports = {
  createPost,
  getAllPosts,
  getUserPosts,
  toggleLike,
  deletePost
};