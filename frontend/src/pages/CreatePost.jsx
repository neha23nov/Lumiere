import { useState }    from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext'
import './CreatePost.css'

function CreatePost() {
  const [file,        setFile]        = useState(null)
  const [preview,     setPreview]     = useState(null)
  const [caption,     setCaption]     = useState('')
  const [type,        setType]        = useState('image')
  const [isPublic,    setIsPublic]    = useState(true)
  const [suggestions, setSuggestions] = useState(null)
  const [selectedAI,  setSelectedAI]  = useState(null)
  const [qualityMsg,  setQualityMsg]  = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const { user } = useAuth()
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const picked = e.target.files[0]
    if (!picked) return
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
    setSuggestions(null)
    setCaption('')
  }

  const handleSelectCaption = (cap) => {
    setSelectedAI(cap)
    setCaption(cap)
  }

  const handleSubmit = async () => {
    if (type === 'image' && !file) {
      setError('Please select an image')
      return
    }
    if (type === 'thought' && !caption.trim()) {
      setError('Please write something')
      return
    }

    setError('')
    setLoading(true)

    try {
      const token    = localStorage.getItem('token')
      const formData = new FormData()

      if (type === 'image') formData.append('image',    file)
      formData.append('caption',  caption)
      formData.append('type',     type)
      formData.append('isPublic', isPublic)

      const res  = await fetch('https://lumiere-u53g.onrender.com/api/posts', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message)
        return
      }

      if (data.aiSuggestions) {
        setSuggestions(data.aiSuggestions)
        setQualityMsg(data.aiSuggestions.qualityMessage)
      } else {
        navigate('/feed')
      }

    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-post-page">
      <div className="create-post-header">
        <span className="create-post-label">✦ New Post</span>
        <h1 className="create-post-title">Create a New Post</h1>
        <div className="create-post-line" />
      </div>

      <div className="create-post-card">

        {/* POST TYPE — image or thought */}
        <div className="toggle-group">
          <p className="toggle-label">Post type</p>
          <div className="post-type-toggle">
            <button
              className={`type-btn ${type === 'image' ? 'active' : ''}`}
              onClick={() => setType('image')}
            >
              Photo
            </button>
            <button
              className={`type-btn ${type === 'thought' ? 'active' : ''}`}
              onClick={() => setType('thought')}
            >
              Thought
            </button>
          </div>
        </div>

        {/* PRIVACY — public or private */}
        <div className="toggle-group">
          <p className="toggle-label">Visibility</p>
          <div className="post-type-toggle">
            <button
              className={`type-btn ${isPublic ? 'active' : ''}`}
              onClick={() => setIsPublic(true)}
            >
              Public
            </button>
            <button
              className={`type-btn ${!isPublic ? 'active' : ''}`}
              onClick={() => setIsPublic(false)}
            >
              Private
            </button>
          </div>
          <p className="toggle-hint">
            {isPublic
              ? 'Anyone can see this post in the gallery'
              : 'Only you can see this post on your profile'}
          </p>
        </div>

        {/* IMAGE UPLOAD */}
        {type === 'image' && (
          <div className="upload-zone">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              id="file-input"
              className="file-input-hidden"
            />
            {preview ? (
              <div className="preview-wrapper">
                <img src={preview} alt="preview" className="preview-img" />
                <button
                  className="change-photo-btn"
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                    setSuggestions(null)
                    setCaption('')
                  }}
                >
                  Change photo
                </button>
              </div>
            ) : (
              <label htmlFor="file-input" className="upload-prompt">
                <span className="upload-icon">✦</span>
                <span className="upload-text">Choose a photo</span>
                <span className="upload-sub">JPG, PNG, WEBP up to 10MB</span>
              </label>
            )}
          </div>
        )}

        {/* AI CAPTION SUGGESTIONS */}
        {suggestions && (
          <div className="ai-suggestions">
            <p className="ai-suggestions-label">✦ AI Caption Suggestions</p>
            <p className="quality-message">{qualityMsg}</p>
            <div className="captions-list">
              {suggestions.captions.map((cap, i) => (
                <button
                  key={i}
                  className={`caption-option ${selectedAI === cap ? 'selected' : ''}`}
                  onClick={() => handleSelectCaption(cap)}
                >
                  {cap}
                </button>
              ))}
            </div>
            {suggestions.mood && (
              <div className="mood-tags">
                {suggestions.mood.map((m, i) => (
                  <span key={i} className="mood-tag">{m}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CAPTION INPUT */}
        <div className="toggle-group">
          <p className="toggle-label">Caption</p>
          <input
            type="text"
            className="caption-input"
            placeholder={
              type === 'thought'
                ? 'Write your thought...'
                : 'Write a caption or pick one above...'
            }
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {/* ERROR */}
        {error && <p className="create-error">{error}</p>}

        {/* SUBMIT */}
        {!suggestions ? (
          <button
            className="create-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Create Post'}
          </button>
        ) : (
          <button
            className="create-submit"
            onClick={() => navigate('/feed')}
          >
            Go to Feed ✦
          </button>
        )}

      </div>
    </div>
  )
}

export default CreatePost