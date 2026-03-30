// HallOfFame.jsx
import { useState, useEffect } from 'react'
import './HallOfFame.css'

function HallOfFame() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await fetch('https://lumiere-u53g.onrender.com//api/posts/hall-of-fame')
        const data = await res.json()

        if (data.success) {
          // filter only Star of Week posts
          const starPosts = data.posts.filter(p => p.isStarOfWeek)
          setWinners(starPosts)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchWinners()
  }, [])

  return (
    <div className="hof-page">
      <div className="hof-header">
        <span className="hof-label">✦ Best of Framr</span>
        <h1 className="hof-title">Hall of Fame</h1>
        <p className="hof-sub">
          Every week, one photo earns the star.
        </p>
        <div className="hof-line" />
      </div>

      {loading && (
        <div className="hof-loading">✦</div>
      )}

      {!loading && winners.length === 0 && (
        <div className="hof-empty">
          <p>No winners yet.</p>
          <p>The first Star of the Week crowns on Monday.</p>
        </div>
      )}

      <div className="hof-grid">
        {winners.map(post => (
          <div key={post._id} className="hof-card">
            <div className="hof-star-badge">✦ Star of the Week</div>
            <img
              src={post.imageUrl}
              alt={post.caption}
              className="hof-image"
            />
            <div className="hof-info">
              <p className="hof-caption">"{post.caption}"</p>
              <p className="hof-author">@{post.author?.username}</p>
              <div className="hof-stats">
                <span>♡ {post.likes?.length} likes</span>
                <span>Score {post.qualityScore}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HallOfFame