import React, { createContext, useState, useEffect } from 'react'
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom'
import api, { setAuthToken } from '../services/api'
=======
import { auth } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
>>>>>>> 70f6487315ffb4abfc0e2702cd18e56bbd3189d9

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
<<<<<<< HEAD
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
=======
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Normalize: preferred name > displayName > email prefix
        const userObj = {
          ...firebaseUser,
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || ''
        };
        setUser(userObj)
      } else {
        setUser(null)
>>>>>>> 70f6487315ffb4abfc0e2702cd18e56bbd3189d9
      }
      setLoading(false)
<<<<<<< HEAD
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
=======
    })

    return () => unsubscribe()
  }, [])

  const login = (userData) => {
    if (userData) {
      // Merge: STRONGLY favor data from backend sync if it exists (contains 'name')
      setUser(prev => ({
        ...prev,
        ...userData,
        id: userData.uid || userData.firebaseUID || prev?.id,
        name: userData.name || userData.displayName || prev?.name || ''
      }));
>>>>>>> 70f6487315ffb4abfc0e2702cd18e56bbd3189d9
    }
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
