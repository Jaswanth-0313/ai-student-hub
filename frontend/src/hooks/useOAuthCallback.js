import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setAuthToken } from '../services/api'

/**
 * useOAuthCallback Hook
 * 
 * Handles OAuth callback flow:
 * 1. Extracts token from URL query params
 * 2. Saves token to localStorage
 * 3. Updates auth header
 * 4. Navigates to dashboard
 * 
 * Usage in a page component:
 * useOAuthCallback()
 */

export function useOAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const user = searchParams.get('user')
    const error = searchParams.get('auth')

    if (error === 'failed' || error === 'error') {
      console.error('❌ OAuth failed:', searchParams.get('message'))
      navigate('/login?error=oauth_failed')
      return
    }

    if (token) {
      try {
        console.log('✅ OAuth successful, token received')
        
        // Save token
        setAuthToken(token)
        
        // Parse and save user info if available
        if (user) {
          const userData = JSON.parse(user)
          localStorage.setItem('user', JSON.stringify(userData))
          console.log('✅ User info saved:', userData.name)
        }

        // Navigate to dashboard
        setTimeout(() => {
          navigate('/dashboard')
        }, 500)
      } catch (err) {
        console.error('❌ OAuth callback error:', err.message)
        navigate('/login?error=oauth_error')
      }
    }
  }, [searchParams, navigate])
}

export default useOAuthCallback
