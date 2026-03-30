import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import CoverPage  from './pages/CoverPage'
import Feed       from './pages/Feed'
import CreatePost from './pages/CreatePost'
import Login      from './pages/Login'
import Signup     from './pages/Signup'
import Profile    from './pages/Profile'
import HallOfFame from './pages/HallOfFame'
import Navbar     from './components/Navbar'
import EditProfile from './pages/EditProfile'

// ProtectedRoute defined here to use useAuth
// useAuth only works inside AuthProvider
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // still checking localStorage for token
  // don't redirect yet
  if (loading) return null

  // not logged in → send to login
  if (!user) return <Navigate to="/login" replace />

  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"                  element={<CoverPage />}  />
        <Route path="/feed"              element={<Feed />}       />
        <Route path="/login"             element={<Login />}      />
        <Route path="/signup"            element={<Signup />}     />
        <Route path="/hall-of-fame"      element={<HallOfFame />} />
        <Route path="/profile/:username" element={<Profile />}    />
        <Route
  path="/settings"
  element={
    <ProtectedRoute>
      <EditProfile />
    </ProtectedRoute>
  }
/>

        {/* Protected — must be logged in */}
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App