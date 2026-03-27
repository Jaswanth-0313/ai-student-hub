import React, { createContext, useState, useEffect } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Normalize: preferred name > displayName > email prefix
        const userObj = {
          ...firebaseUser,
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student'
        };
        setUser(userObj)
      } else {
        setUser(null)
      }
      setLoading(false)
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
        name: userData.name || userData.displayName || prev?.name || 'Student'
      }));
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
