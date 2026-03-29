import React, { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import api, { setAuthToken } from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const localToken = localStorage.getItem('token')
    if (localToken) {
      setToken(localToken)
      setAuthToken(localToken)
    }

    // Handle OAuth redirect token
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      setToken(urlToken)
      setAuthToken(urlToken);
      // Remove token from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      navigate('/dashboard');
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userObj = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
          email: firebaseUser.email,
          provider: firebaseUser.providerData?.[0]?.providerId || 'firebase'
        }
        setUser(userObj)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  const login = async (token, userData) => {
    if (token) {
      setToken(token)
      setAuthToken(token)
      localStorage.setItem('token', token)
    }
    if (userData) {
      setUser(userData)
    }
    setLoading(false)
  }

  const logout = async (broadcast = true) => {
    if (broadcast) {
      window.dispatchEvent(new Event('manual_logout'));
    }
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
