import React, { createContext, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import api, { setAuthToken } from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [userProvider, setUserProvider] = useState(null) // 'google', 'email', 'password'
  const navigate = useNavigate()
  const broadcastChannelRef = useRef(null)

  // Initialize BroadcastChannel for cross-tab logout
  useEffect(() => {
    // Initialize BroadcastChannel for auth synchronization
    try {
      broadcastChannelRef.current = new BroadcastChannel('auth_state');
      
      const channel = broadcastChannelRef.current;
      
      // Listen for logout messages from other tabs
      channel.addEventListener('message', (event) => {
        console.log('📡 Auth state change from another tab:', event.data);
        
        if (event.data.type === 'LOGOUT') {
          console.log('📡 Logout detected on another tab, logging out this tab');
          // Trigger logout on this tab without re-broadcasting
          handleCrossTabLogout();
        } else if (event.data.type === 'LOGIN') {
          console.log('📡 Login detected on another tab, refreshing state');
          // Optional: refresh auth state if needed
        }
      });

      return () => {
        channel.close();
      };
    } catch (error) {
      console.warn('⚠️  BroadcastChannel not supported:', error);
    }
  }, [])

  const handleCrossTabLogout = async () => {
    // Logout without broadcasting (to avoid infinite loop)
    localStorage.removeItem('token');
    localStorage.removeItem('authProvider');
    setToken(null);
    setUser(null);
    setFirebaseUser(null);
    setUserProvider(null);
    
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    
    navigate('/login', { replace: true });
  }

  useEffect(() => {
    let authInitialized = false

    const localToken = localStorage.getItem('token')
    if (localToken) {
      setToken(localToken)
      setAuthToken(localToken)
    }

    // Handle OAuth redirect token (from backend Google login)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlProvider = urlParams.get('provider');
    
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      setToken(urlToken)
      setAuthToken(urlToken);
      if (urlProvider) {
        localStorage.setItem('authProvider', urlProvider);
        setUserProvider(urlProvider);
      }
      // Remove token from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      // Don't navigate here, let onAuthStateChanged handle it
    }

    // ✅ Monitor Firebase Auth State (handles persistence automatically)
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          // Firebase user is logged in
          console.log('✅ Firebase Auth State: User logged in', fbUser.email, 'Providers:', fbUser.providerData);
          
          const provider = fbUser.providerData?.[0]?.providerId || 'password';
          setFirebaseUser(fbUser);
          setUserProvider(provider);
          localStorage.setItem('authProvider', provider);

          // Build user object from Firebase
          const userObj = {
            id: fbUser.uid,
            uid: fbUser.uid,
            email: fbUser.email,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
            provider: provider
          }
          setUser(userObj)

          // If no backend token yet, sync with backend
          if (!token && !urlToken) {
            try {
              console.log('🔹 Syncing Firebase user with backend...');
              const syncRes = await api.post('/users/firebase', {
                firebaseUID: fbUser.uid,
                email: fbUser.email,
                name: fbUser.displayName || '',
                provider: provider
              });
              
              if (syncRes.data.token) {
                setAuthToken(syncRes.data.token);
                setToken(syncRes.data.token);
                localStorage.setItem('token', syncRes.data.token);
              }
              console.log('✅ Firebase backend sync successful');
            } catch (syncErr) {
              console.error('⚠️  Backend sync failed:', syncErr.message);
              // Don't fail auth, user can still use app if frontend loads
            }
          }
        } else {
          // Firebase user is NOT logged in
          console.log('✅ Firebase Auth State: No user logged in');
          setFirebaseUser(null);
          
          // Only clear user if explicitly logged out, not on page load with valid token
          if (authInitialized || !token) {
            setUser(null);
            setUserProvider(null);
            localStorage.removeItem('authProvider');
            
            // Only clear token if explicitly logged out
            if (authInitialized) {
              localStorage.removeItem('token');
              setToken(null);
            }
          }
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error);
      } finally {
        authInitialized = true;
        setLoading(false);
      }
    })

    return () => unsubscribe()
  }, [])

  // ✅ Check user's login provider to prevent mixing credentials
  const getLoginProvider = () => {
    return userProvider || localStorage.getItem('authProvider');
  }

  // ✅ Check if email is Google-only account
  const isGoogleOnlyUser = (email) => {
    return userProvider === 'google.com' || userProvider === 'google';
  }

  const login = (tokenOrUser, userData) => {
    // Handle both signatures:
    // 1. login(userObject) - from Firebase auth
    // 2. login(token, userObject) - from backend
    
    let newToken = null
    let newUser = null

    if (typeof tokenOrUser === 'string') {
      // First param is token
      newToken = tokenOrUser
      newUser = userData
    } else {
      // First param is user object (Firebase auth)
      newUser = tokenOrUser
    }

    if (newToken) {
      setToken(newToken)
      setAuthToken(newToken)
      localStorage.setItem('token', newToken)
    }
    
    if (newUser) {
      // Ensure user object has necessary properties
      const userObj = {
        id: newUser.id || newUser.uid || newUser._id,
        uid: newUser.uid || newUser.id || newUser._id,
        name: newUser.name || newUser.displayName || 'Student',
        email: newUser.email,
        provider: newUser.provider || 'firebase'
      }
      setUser(userObj)
      if (newUser.provider) {
        setUserProvider(newUser.provider);
        localStorage.setItem('authProvider', newUser.provider);
      }
    }
    
    setLoading(false)
  }

  const logout = async (broadcast = true) => {
    try {
      console.log('🔓 Logout initiated');
      
      // Clear local state immediately
      localStorage.removeItem('token');
      localStorage.removeItem('authProvider');
      setToken(null);
      setUser(null);
      setFirebaseUser(null);
      setUserProvider(null);
      
      // Sign out from Firebase
      await signOut(auth);
      console.log('✅ Logout successful');

      // Broadcast logout to other tabs
      if (broadcast && broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage({ type: 'LOGOUT' });
        } catch (error) {
          console.warn('⚠️  Failed to broadcast logout:', error);
        }
      }

      // Navigate to login
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      loading, 
      login, 
      logout,
      firebaseUser,
      userProvider,
      getLoginProvider,
      isGoogleOnlyUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}
