import React, { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { setAuthToken } from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }){
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)
  const navigate = useNavigate()

  useEffect(()=>{
    // Check URL for token (OAuth redirect)
    try {
      const params = new URLSearchParams(window.location.search)
      const urlToken = params.get('token')
      const userParam = params.get('user')

      if (urlToken && !token) {
        localStorage.setItem('token', urlToken)
        setToken(urlToken)

        const userData = userParam ? (() => { try { return JSON.parse(userParam) } catch { return null } })() : null
        if (userData) setUser(userData)

        // Notify opener popup if present
        if (window.opener && window.opener !== window) {
          window.opener.postMessage({ type: 'google-oauth-success', token: urlToken, user: userData }, window.location.origin)
          window.close()
          return
        }

        // Clean URL by removing token params
        const newUrl = new URL(window.location)
        newUrl.searchParams.delete('token')
        newUrl.searchParams.delete('user')
        window.history.replaceState({}, '', newUrl.toString())

        // Redirect to dashboard after OAuth login
        navigate('/dashboard', { replace: true })
        return
      }
    } catch (e) {}

    if (token){
      setAuthToken(token)
      // fetch basic dashboard to get user info
      api.get('/dashboard')
        .then(res => {
          setUser(res.data.user)
        })
        .catch(()=>{
          setToken(null)
          localStorage.removeItem('token')
          setAuthToken(null)
        })
        .finally(()=>setLoading(false))
    } else {
      setLoading(false)
    }
  },[token, navigate])

  const login = async (newToken, userObj) => {
    setToken(newToken)
    setUser(userObj)
    setAuthToken(newToken)
    localStorage.setItem('token', newToken)

    // Auto-connect Gmail for logged in users
    try {
      await api.post('/tools/connect/gmail', { credential: 'oauth' })
    } catch (err) {
      console.warn('Gmail auto-connect attempt failed (non-blocking)', err.message)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setAuthToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
