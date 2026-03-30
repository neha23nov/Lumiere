const User = require('../models/User');
const Post = require('../models/Post');

const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // check if the person requesting is the owner
    // req.user is set by optionalAuth middleware
    const isOwner = req.user &&
      req.user._id.toString() === user._id.toString();

    // owner sees ALL posts including private
    // everyone else sees ONLY public posts
    const query = isOwner
      ? { author: user._id }
      : { author: user._id, isPublic: true };

    const posts = await Post.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      user: {
        id:         user._id,
        username:   user.username,
        avatar:     user.avatar,
        bio:        user.bio,
        points:     user.points,
        tier:       user.tier,
        starBadges: user.starBadges,
        followers:  user.followers.length,
        following:  user.following.length,
        postCount:  posts.length,
        isOwner     // tells frontend if this is own profile
      },
      posts
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

const toggleFollow = async (req, res) => {
  try {
    const targetId  = req.params.id;
    const currentId = req.user._id;

    if (targetId.toString() === currentId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You can't follow yourself"
      });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isFollowing = targetUser.followers.some(
      id => id.toString() === currentId.toString()
    );

    if (isFollowing) {
      await User.findByIdAndUpdate(targetId,  { $pull: { followers: currentId } });
      await User.findByIdAndUpdate(currentId, { $pull: { following: targetId  } });
      await User.findByIdAndUpdate(targetId,  { $inc: { points: -8 } });
      return res.json({ success: true, following: false });
    } else {
      await User.findByIdAndUpdate(targetId,  { $addToSet: { followers: currentId } });
      await User.findByIdAndUpdate(currentId, { $addToSet: { following: targetId  } });
      await User.findByIdAndUpdate(targetId,  { $inc: { points: 8 } });
      return res.json({ success: true, following: true });
    }

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle follow' });
  }
};

module.exports = { getProfile, toggleFollow };