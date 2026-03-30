// Feed.jsx
import { useState, useEffect } from 'react'
import { useAuth }             from '../context/AuthContext'
import './Feed.css'

// mood options for filtering
const MOODS = ['all','serene','melancholy','electric',
               'nostalgic','ethereal','raw','tender',
               'haunting','joyful','desolate','expansive']

function Feed() {
  const [posts,      setPosts]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [activeMood, setActiveMood] = useState('all')

  const { user } = useAuth()

  // ─────────────────────────────────────
  // FETCH POSTS
  // ─────────────────────────────────────
  // runs on first load AND whenever mood filter changes
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        // build URL with optional mood filter
        const url = activeMood === 'all'
          ? 'https://lumiere-u53g.onrender.com/api/posts'
          : `https://lumiere-u53g.onrender.com/api/posts?mood=${activeMood}`

        const res  = await fetch(url)
        const data = await res.json()

        if (data.success) {
          setPosts(data.posts)
        }
      } catch (err) {
        setError('Failed to load posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [activeMood]) // re-runs when activeMood changes

  // ─────────────────────────────────────
  // LIKE A POST
  // ─────────────────────────────────────
  const handleLike = async (postId) => {
    if (!user) return  // must be logged in to like

    const token = localStorage.getItem('token')

    try {
      const res  = await fetch(
        `https://lumiere-u53g.onrender.com/api/posts/${postId}/like`,
        {
          method:  'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      const data = await res.json()

      if (data.success) {
        // update the post in state without refetching
        // map through posts, find the liked one, update its likes count
        setPosts(prev => prev.map(p =>
          p._id === postId
            ? {
                ...p,
                likes: data.liked
                  // liked → add a fake ID to increase count
                  ? [...p.likes, 'temp']
                  // unliked → remove one item
                  : p.likes.slice(0, -1)
              }
            : p
        ))
      }
    } catch (err) {
      console.error('Like failed:', err)
    }
  }

  return (
    <div className="feed-page">
      {/* Header */}
      <div className="feed-header">
        <h1 className="feed-title">Gallery</h1>
        <p className="feed-sub">— Your moments, framed</p>
      </div>

      {/* Mood filter */}
      <div className="mood-filters">
        {MOODS.map(mood => (
          <button
            key={mood}
            className={`mood-filter-btn ${activeMood === mood ? 'active' : ''}`}
            onClick={() => setActiveMood(mood)}
          >
            {mood}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="feed-loading">
          <span className="loading-star">✦</span>
        </div>
      )}

      {/* Error state */}
      {error && <p className="feed-error">{error}</p>}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <div className="feed-empty">
          <p>No posts yet.</p>
          <p>Be the first to frame a moment.</p>
        </div>
      )}

      {/* Posts grid */}
      <div className="feed-grid">
        {posts.map((post, index) => (
          <div key={post._id} className="post-card">

            {/* Post number badge */}
            <span className="post-number">
              {String(index + 1).padStart(2, '0')}
            </span>

            {/* Star of week badge */}
            {post.isStarOfWeek && (
              <span className="star-badge">✦ Star of the Week</span>
            )}

            {/* Image */}
            {post.type === 'image' && (
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="post-image"
              />
            )}

            {/* Thought post */}
            {post.type === 'thought' && (
              <div className="thought-card">
                <span className="thought-quote">"</span>
                <p className="thought-text">{post.caption}</p>
              </div>
            )}

            {/* Post info overlay */}
            <div className="post-overlay">
              <div className="post-meta">
                {/* Mood tags */}
                <div className="post-moods">
                  {post.mood && post.mood.map((m, i) => (
                    <span key={i} className="post-mood-tag">{m}</span>
                  ))}
                </div>

                {/* Caption */}
                <p className="post-caption">
                  <span className="caption-quote">"</span>
                  {post.caption}
                </p>

                {/* Author + like */}
                <div className="post-footer">
                  <span className="post-author">
                    @{post.author?.username}
                    <span className="author-tier">
                      {post.author?.tier}
                    </span>
                  </span>

                  <button
                    className={`like-btn ${user ? 'active' : ''}`}
                    onClick={() => handleLike(post._id)}
                  >
                    ♡ {post.likes?.length || 0}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Feed