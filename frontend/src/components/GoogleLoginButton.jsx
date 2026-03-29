import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chrome } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

/**
 * GoogleLoginButton Component
 * 
 * Handles Google OAuth login flow via popup
 * 1. User clicks button
 * 2. Popup opens backend /auth/google
 * 3. Backend handles OAuth with Google and redirects to frontend with token
 * 4. Popup sends token to opener and closes
 * 5. Main window authenticates user
 */

export default function GoogleLoginButton({ className = '' }) {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return
      const { type, token, user } = event.data || {}
      if (type === 'google-oauth-success' && token) {
        login(token, user)
        navigate('/dashboard')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [login, navigate])

  const handleGoogleLogin = () => {
    const authWindow = window.open(
      `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/auth/google`,
      'google-oauth',
      'width=500,height=650'
    )

    if (!authWindow) {
      console.error('Failed to open Google login popup')
      return
    }

    const timer = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(timer)
      }
    }, 500)
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className={`w-full py-3 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3 font-medium ${className}`}
    >
      <Chrome size={18} />
      Continue with Google
    </button>
  )
}
