import { useState }         from 'react'
import { useNavigate }      from 'react-router-dom'
import { useAuth }          from '../context/AuthContext'
import './EditProfile.css'

function EditProfile() {
  const { user, login }  = useAuth()
  const navigate         = useNavigate()

  // pre-fill with current user data
  const [username, setUsername] = useState(user?.username || '')
  const [bio,      setBio]      = useState(user?.bio      || '')
  const [avatar,   setAvatar]   = useState(null)
  const [preview,  setPreview]  = useState(user?.avatar   || '')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const token    = localStorage.getItem('token')
      const formData = new FormData()

      formData.append('username', username)
      formData.append('bio',      bio)
      if (avatar) formData.append('avatar', avatar)

      const res  = await fetch('https://lumiere-u53g.onrender.com/api/users/edit', {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message)
        return
      }

      // update user in context so navbar reflects changes
      login(data.user, token)
      setSuccess('Profile updated successfully!')

      // go to updated profile after short delay
      setTimeout(() => {
        navigate(`/profile/${data.user.username}`)
      }, 1200)

    } catch (err) {
      setError('Update failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="edit-page">
      <div className="edit-header">
        <span className="edit-label">✦ Your Profile</span>
        <h1 className="edit-title">Edit Profile</h1>
        <div className="edit-line" />
      </div>

      <div className="edit-card">

        {/* AVATAR */}
        <div className="avatar-section">
          <div className="avatar-preview">
            {preview
              ? <img src={preview} alt="avatar" />
              : <span>{user?.username?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div className="avatar-actions">
            <p className="avatar-label">Profile photo</p>
            <input
              type="file"
              accept="image/*"
              id="avatar-input"
              className="file-input-hidden"
              onChange={handleAvatarChange}
            />
            <label htmlFor="avatar-input" className="avatar-upload-btn">
              Choose photo
            </label>
          </div>
        </div>

        {/* USERNAME */}
        <div className="edit-field">
          <label className="edit-field-label">Username</label>
          <input
            type="text"
            className="edit-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            maxLength={20}
          />
          <p className="edit-hint">{username.length}/20 characters</p>
        </div>

        {/* BIO */}
        <div className="edit-field">
          <label className="edit-field-label">Bio</label>
          <textarea
            className="edit-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the world about yourself..."
            maxLength={160}
            rows={3}
          />
          <p className="edit-hint">{bio.length}/160 characters</p>
        </div>

        {/* CURRENT STATS — read only */}
        <div className="edit-stats">
          <div className="edit-stat">
            <span className="edit-stat-value">{user?.points || 0}</span>
            <span className="edit-stat-label">Points</span>
          </div>
          <div className="edit-stat">
            <span className="edit-stat-value">{user?.tier}</span>
            <span className="edit-stat-label">Tier</span>
          </div>
          <div className="edit-stat">
            <span className="edit-stat-value">
              {user?.starBadges?.length || 0}
            </span>
            <span className="edit-stat-label">Stars won</span>
          </div>
        </div>

        {/* MESSAGES */}
        {error   && <p className="edit-error">{error}</p>}
        {success && <p className="edit-success">{success}</p>}

        {/* BUTTONS */}
        <div className="edit-actions">
          <button
            className="edit-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            className="edit-cancel"
            onClick={() => navigate(`/profile/${user?.username}`)}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}

export default EditProfile