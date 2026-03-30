const cron = require('node-cron');
const Post = require('../models/Post');
const User = require('../models/User');

// runs every Monday at midnight automatically
cron.schedule('0 0 * * 1', () => runStarOfWeek());

// separate function so we can call it manually too
async function runStarOfWeek() {
  console.log('Running Star of the Week...');
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const posts = await Post.find({
      isPublic:     true,
      type:         'image',
      createdAt:    { $gte: oneWeekAgo }
    });

    if (posts.length === 0) {
      console.log('No eligible posts this week');
      return;
    }

    const scored = posts.map(post => ({
      post,
      score: (post.likes.length * 1) + ((post.qualityScore || 50) * 3)
    }));

    scored.sort((a, b) => b.score - a.score);
    const winner = scored[0];

    await Post.findByIdAndUpdate(winner.post._id, { isStarOfWeek: true });
    await User.findByIdAndUpdate(winner.post.author, {
      $inc:  { points: 500 },
      $push: { starBadges: new Date() }
    });

    console.log('Star of the Week awarded to post:', winner.post._id);
  } catch (err) {
    console.error('Star of the Week failed:', err.message);
  }
}


runStarOfWeek();