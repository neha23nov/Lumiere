const express  = require('express');
const router   = express.Router();
const User = require('../models/User');

const { upload } = require('../middleware/upload.middleware');

const { getProfile, toggleFollow } = require('../controllers/user.controller');
const { protect, optionalAuth }    = require('../middleware/auth.middleware');

// profile is public but optionalAuth checks if owner
// so owner can see their own private posts
router.get('/:username', optionalAuth, getProfile);

// follow requires login
router.post('/:id/follow', protect, toggleFollow);

// add this route
router.put('/edit', protect, upload.single('avatar'), async (req, res) => {
  try {
    const { username, bio } = req.body;
    const userId = req.user._id;

    // check username not taken by someone else
    if (username && username !== req.user.username) {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // build update object
    const updates = {};
    if (username) updates.username = username;
    if (bio !== undefined) updates.bio = bio;

    // upload new avatar if provided
    if (req.file) {
      const { uploadImage } = require('../services/imagekit.service');
      const avatarUrl = await uploadImage(
        req.file.buffer,
        req.file.originalname
      );
      updates.avatar = avatarUrl;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true }  // return updated document
    );

    res.json({
      success: true,
      message: 'Profile updated',
      user: {
        id:         user._id,
        username:   user.username,
        email:      user.email,
        bio:        user.bio,
        avatar:     user.avatar,
        points:     user.points,
        tier:       user.tier,
        starBadges: user.starBadges
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile: ' + err.message
    });
  }
});

module.exports = router;