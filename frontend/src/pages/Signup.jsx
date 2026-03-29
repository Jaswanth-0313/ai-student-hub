import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react'
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from '../firebase'
import { AuthContext } from '../context/AuthContext'
import { authAPI, setAuthToken } from '../services/api'
import { useSession } from '../context/SessionContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Signup() {
  const [name, setName] = useState('')
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

    // client-side validation
    const normalizedEmail = String(email).trim().toLowerCase()
    const passwordRegex = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/

    if (!normalizedEmail.endsWith('@gmail.com')) {
      setLoading(false)
      return setError('Please use a @gmail.com email for signup')
    }
    if (!passwordRegex.test(password)) {
      setLoading(false)
      return setError('Weak password - must be 8+ chars with upper, lower, number and special char')
    }

    try {
      console.log("🚀 Starting Signup process for:", normalizedEmail);

      // 1. Firebase Authentication
      console.log("🔹 Step 1: Firebase createUserWithEmailAndPassword...");
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
      console.log("✅ Firebase User Created:", userCredential.user.uid);

      await updateProfile(userCredential.user, { displayName: name });
      const firebaseUser = userCredential.user;
      firebaseUser.id = firebaseUser.uid;

      // 2. Global Auth Context Update
      login(firebaseUser)

      // 3. Backend Synchronization (MongoDB)
      try {
        console.log("🔹 Syncing with backend MongoDB... User name:", name);
        const syncRes = await authAPI.syncFirebaseUser({
          firebaseUID: firebaseUser.uid,
          email: firebaseUser.email,
          name: name,
          provider: 'local'
        });

        if (syncRes.data.token) {
          setAuthToken(syncRes.data.token);
        }

        // 4. Update Global Context with Backend Data and Token
        if (syncRes.data.user && syncRes.data.token) {
          login(syncRes.data.token, syncRes.data.user);
        } else if (syncRes.data.user) {
          login(syncRes.data.user);
        }

        console.log("✅ Backend Sync Success:", syncRes.data);
      } catch (syncErr) {
        console.error("❌ Backend Sync Failed:", syncErr);
      }

      console.log("🎉 Signup Complete! Navigating...");
      navigate('/dashboard')
    } catch (err) {
      console.error("❌ FULL FIREBASE ERROR:", err.code, err.message);
      console.error("❌ SIGNUP ERROR STACK:", err);
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') msg = 'Email is already taken';
      setError(msg || 'Signup failed')
    } finally {
      console.log("🏁 Signup sequence finished (setLoading(false))");
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
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Header Section */}
      <div className="mb-10 text-center animate-slide-up">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary to-secondary mb-4 shadow-lg shadow-primary/20">
          <div className="bg-background rounded-xl p-3">
            <img src="/logo.jpg" alt="Student Hub" className="h-12 w-12 object-contain" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
        <p className="text-gray-400 mt-2">Join the AI Student Hub community today</p>
      </div>

      <Card className="w-full max-w-md p-8 shadow-2xl border-white/10 animate-slide-up delay-100 relative">
        <div className="absolute top-4 right-4 text-primary opacity-20">
          <ShieldCheck size={48} />
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <User size={16} />
              </div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-600 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Gmail Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="yours@gmail.com"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-600 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Secure Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="8+ chars, upper, symbol"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-600 transition-all text-sm font-mono"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-6 text-base gap-2 shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? 'Creating Profile...' : <><UserPlus size={18} /> Create Account</>}
          </Button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
              <AlertCircle size={18} />
              <span className="text-sm font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-4 text-gray-500 font-bold">Or</span>
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
          Already have an account? {' '}
          <Link to="/login" className="text-secondary font-bold hover:underline">Sign in instead</Link>
        </p>
      </div>

      <footer className="mt-16 text-xs text-gray-600 flex items-center gap-4">
        <span>Student Privacy First</span>
        <span className="h-1 w-1 bg-gray-800 rounded-full" />
        <span>Secured by JWT</span>
        <span className="h-1 w-1 bg-gray-800 rounded-full" />
        <Link to="/" className="hover:text-gray-400 transition-colors">Go Back Home</Link>
      </footer>
    </div>
  )
}
