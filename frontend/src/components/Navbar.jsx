// Navbar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      {/* Logo — always visible */}
      <Link to="/" className="navbar-logo">
        ✦ Framr
      </Link>

      {/* Navigation links */}
      <div className="navbar-links">
        <Link to="/feed"         className="navbar-link">Gallery</Link>
        <Link to="/hall-of-fame" className="navbar-link">Hall of Fame</Link>

        {/* Show different options based on login state */}
        {user ? (
          // LOGGED IN
          <>
            <Link to="/create" className="navbar-link">+ Post</Link>
            <Link
              to={`/profile/${user.username}`}
              className="navbar-link navbar-username"
            >
              {user.username}
              <span className="navbar-tier">{user.tier}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="navbar-logout"
            >
              Logout
            </button>
          </>
        ) : (
          // NOT LOGGED IN
          <>
            <Link to="/login"  className="navbar-link">Login</Link>
            <Link to="/signup" className="navbar-btn">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar