import React, { createContext, useState, useEffect } from 'react'
import api, { setAuthToken } from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }){
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)

  useEffect(()=>{
    if (token){
      setAuthToken(token)
      // fetch basic dashboard to get user info
      api.get('/dashboard')
        .then(res => {
          setUser(res.data.user)
        })
        .catch(()=>{
          setToken(null)
          setAuthToken(null)
        })
        .finally(()=>setLoading(false))
    } else {
      setLoading(false)
    }
  },[])

  const login = (newToken, userObj) => {
    setToken(newToken)
    setUser(userObj)
    setAuthToken(newToken)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setAuthToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
