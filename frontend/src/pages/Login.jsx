import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Mail, Lock, AlertCircle, Rocket } from 'lucide-react'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from '../firebase'
import { AuthContext } from '../context/AuthContext'
import { authAPI, setAuthToken } from '../services/api'
import { useSession } from '../context/SessionContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const { initFirebaseSession } = useSession()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Basic client-side validation
    const normalizedEmail = String(email).trim().toLowerCase()
    if (!normalizedEmail.endsWith('@gmail.com')) {
      setLoading(false)
      return setError('Please use a @gmail.com email address')
    }

    try {
      console.log("🚀 Starting Login process for:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("✅ Firebase Login Success:", userCredential.user.uid);

      const firebaseUser = userCredential.user;
      firebaseUser.id = firebaseUser.uid;

      // Set initial Firebase user
      login(firebaseUser)

      // Sync with Backend
      try {
        console.log("🔹 Syncing with backend MongoDB...");
        const syncRes = await authAPI.syncFirebaseUser({
          firebaseUID: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || '',
          provider: 'firebase'
        });

        if (syncRes.data.token) {
          setAuthToken(syncRes.data.token);
        }

        // Update context with backend user data and token
        if (syncRes.data.user && syncRes.data.token) {
          login(syncRes.data.token, syncRes.data.user);
        } else if (syncRes.data.user) {
          login(syncRes.data.user);
        }

        console.log("✅ Backend Sync Success");
      } catch (syncErr) {
        console.error("❌ Backend Sync Failed:", syncErr);
      }

      console.log("✅ Login Firebase success- now navigating to home");

      console.log("🎉 Login Complete! Navigating...");
      navigate('/dashboard')
    } catch (err) {
      console.error("❌ FULL FIREBASE ERROR:", err.code, err.message);
      console.error("❌ LOGIN ERROR STACK:", err);
      let msg = err.message;
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') msg = 'Invalid email or password';
      setError(msg || 'Login failed')
    } finally {
      console.log("🏁 Login process finished");
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setError(null)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const firebaseUser = result.user
      firebaseUser.id = firebaseUser.uid

      login(firebaseUser)

      // Sync Google User with Backend
      try {
        console.log("🔹 Syncing Google User with backend... Name:", firebaseUser.displayName);
        const syncRes = await authAPI.syncFirebaseUser({
          firebaseUID: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          provider: 'google'
        });

        if (syncRes.data.token) {
          setAuthToken(syncRes.data.token);
        }

        if (syncRes.data.user && syncRes.data.token) {
          login(syncRes.data.token, syncRes.data.user);
        } else if (syncRes.data.user) {
          login(syncRes.data.user);
        }
      } catch (syncErr) {
        console.error("❌ Google Sync Failed:", syncErr);
      }

      await initFirebaseSession(firebaseUser)
      navigate('/dashboard')
    } catch (err) {
      console.error("Google Login Error:", err)
      setError(err.message || 'Google Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Logo Section */}
      <div className="mb-10 text-center animate-slide-up">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary to-secondary mb-4 shadow-lg shadow-primary/20">
          <div className="bg-background rounded-xl p-3">
            <img src="/logo.jpg" alt="Student Hub" className="h-12 w-12 object-contain" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
        <p className="text-gray-400 mt-2">Sign in to your AI Student Hub account</p>
      </div>

      <Card className="w-full max-w-md p-8 shadow-2xl border-white/10 animate-slide-up delay-100">
        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="yours@example.com"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-600 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-600 transition-all text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-6 text-base gap-2 shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : <><LogIn size={18} /> Sign In</>}
          </Button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-4 text-gray-500 font-bold">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-semibold"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="h-5 w-5" alt="Google" />
            Continue with Google
          </button>
        </form>
      </Card>

      <div className="mt-8 text-center animate-slide-up delay-200">
        <p className="text-gray-400 text-sm">
          Don't have an account? {' '}
          <Link to="/signup" className="text-primary font-bold hover:underline">Create one for free</Link>
        </p>
      </div>

      <footer className="mt-16 text-xs text-gray-600 flex items-center gap-4">
        <span>&copy; 2026 AI Student Hub</span>
        <span className="h-1 w-1 bg-gray-800 rounded-full" />
        <Link to="/" className="hover:text-gray-400 transition-colors">Go Back Home</Link>
      </footer>
    </div>
  )
}
