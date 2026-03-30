const User = require('../models/User');
const jwt  = require('jsonwebtoken');

const signToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Register hit:', { username, email, password });

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email and password'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(409).json({
        success: false,
        message: `${field} is already taken`
      });
    }

    const user = await User.create({ username, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created!',
      token,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email,
        points:   user.points,
        tier:     user.tier,
        avatar:   user.avatar
      }
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id:         user._id,
        username:   user.username,
        email:      user.email,
        points:     user.points,
        tier:       user.tier,
        avatar:     user.avatar,
        starBadges: user.starBadges
      }
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id:        req.user._id,
      username:  req.user.username,
      email:     req.user.email,
      points:    req.user.points,
      tier:      req.user.tier,
      avatar:    req.user.avatar,
      starBadges: req.user.starBadges,
      followers: req.user.followers.length,
      following: req.user.following.length
    }
  });
};

module.exports = { register, login, getMe };