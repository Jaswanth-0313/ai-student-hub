import React, { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import api, { setAuthToken } from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const localToken = localStorage.getItem('token')
    if (localToken) {
      setAuthToken(localToken)
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
  }, [])

  const login = async (token, userData) => {
    if (token) {
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
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token: user?.uid, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
