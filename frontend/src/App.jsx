import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'

function App() {
  function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true)
    const [authed, setAuthed] = useState(false)

    useEffect(() => {
      let mounted = true
      axios
        .get('/api/auth/me', { withCredentials: true })
        .then(() => {
          if (mounted) setAuthed(true)
        })
        .catch(() => {
          if (mounted) setAuthed(false)
        })
        .finally(() => {
          if (mounted) setLoading(false)
        })
      return () => {
        mounted = false
      }
    }, [])

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>
    return authed ? children : <Navigate to="/login" replace />
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<h2 style={{ padding: '2rem' }}>404 - Not Found</h2>} />
      </Routes>
    </div>
  )
}

export default App
