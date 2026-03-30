import { useState, useEffect } from 'react'
import { useParams, Link }     from 'react-router-dom'
import { useAuth }             from '../context/AuthContext'
import './Profile.css'

function Profile() {
  const { username }  = useParams()
  const { user }      = useAuth()

  const [profile,     setProfile]     = useState(null)
  const [posts,       setPosts]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // send token so backend knows if this is the owner
        // owner gets to see their private posts too
        const token = localStorage.getItem('token')

        const res  = await fetch(
          `https://lumiere-u53g.onrender.com/api/users/${username}`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {}
          }
        )
        const data = await res.json()

        if (data.success) {
          setProfile(data.user)
          setPosts(data.posts)
          // check if logged in user is following this profile
          // we'll handle this properly when follow system is tested
        } else {
          setError('User not found')
        }
      } catch (err) {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  const handleFollow = async () => {
    if (!user) return

    const token = localStorage.getItem('token')

    try {
      const res  = await fetch(
        `https://lumiere-u53g.onrender.com/api/users/${profile.id}/follow`,
        {
          method:  'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      const data = await res.json()

      if (data.success) {
        setIsFollowing(data.following)
        setProfile(prev => ({
          ...prev,
          followers: data.following
            ? prev.followers + 1
            : prev.followers - 1
        }))
      }
    } catch (err) {
      console.error('Follow failed:', err)
    }
  }

  if (loading) return (
    <div className="profile-loading">✦</div>
  )

  if (error || !profile) return (
    <div className="profile-not-found">{error || 'User not found'}</div>
  )

  const isOwnProfile = user?.username === username

  return (
    <div className="profile-page">

      {/* PROFILE HEADER */}
      <div className="profile-header">

        {/* Avatar */}
        <div className="profile-avatar">
          {profile.avatar
            ? <img src={profile.avatar} alt={profile.username} />
            : <span>{profile.username[0].toUpperCase()}</span>
          }
        </div>

        {/* Info */}
        <div className="profile-info">
          <div className="profile-top">
            <h1 className="profile-username">@{profile.username}</h1>
            <span className="profile-tier">{profile.tier}</span>

            {/* Gold stars for Star of Week wins */}
            {profile.starBadges?.length > 0 && (
              <div className="profile-stars">
                {'✦'.repeat(profile.starBadges.length)}
              </div>
            )}
          </div>

          {/* Private posts note — only shown to owner */}
          {profile.isOwner && (
            <p className="profile-private-note">
              ✦ Only you can see your private posts
            </p>
          )}

          {profile.bio && (
            <p className="profile-bio">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{profile.postCount}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat">
              <span className="stat-number">{profile.followers}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{profile.following}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat">
              <span className="stat-number">{profile.points}</span>
              <span className="stat-label">Points</span>
            </div>
          </div>

          {/* Follow button — not shown on own profile */}
          {!isOwnProfile && user && (
            <button
              className={`follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          {/* Edit profile button — own profile only */}
          {isOwnProfile && (
            <Link to="/settings" className="edit-profile-btn">
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      {/* POSTS GRID */}
      {posts.length === 0 ? (
        <div className="profile-empty">
          <p>No posts yet.</p>
          {isOwnProfile && (
            <Link to="/create" className="profile-create-link">
              Create your first post ✦
            </Link>
          )}
        </div>
      ) : (
        <div className="profile-grid">
          {posts.map(post => (
            <div key={post._id} className="profile-post">

              {/* Private badge */}
              {!post.isPublic && (
                <span className="private-badge">Private</span>
              )}

              {/* Star of week badge */}
              {post.isStarOfWeek && (
                <span className="star-post-badge">✦</span>
              )}

              {post.type === 'image' ? (
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                />
              ) : (
                <div className="profile-thought">
                  "{post.caption}"
                </div>
              )}

              {/* Hover overlay */}
              <div className="profile-post-overlay">
                <span>♡ {post.likes?.length || 0}</span>
                <span>{post.isPublic ? 'Public' : 'Private'}</span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default Profile