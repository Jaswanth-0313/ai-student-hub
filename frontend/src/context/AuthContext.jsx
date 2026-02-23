import React, { createContext, useState, useEffect } from 'react'
import api, { setAuthToken } from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }){
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)

  useEffect(()=>{
    // Check URL for token (OAuth redirect)
    try {
      const params = new URLSearchParams(window.location.search)
      const urlToken = params.get('token')
      if (urlToken && !token) {
        localStorage.setItem('token', urlToken)
        setToken(urlToken)
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
  },[token])

  const login = (newToken, userObj) => {
    setToken(newToken)
    setUser(userObj)
    setAuthToken(newToken)
    localStorage.setItem('token', newToken)
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
