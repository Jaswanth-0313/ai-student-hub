import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react'
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [verificationId, setVerificationId] = useState(null)
  const [isPhoneMode, setIsPhoneMode] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, user: authUser } = useContext(AuthContext)
  const { initFirebaseSession } = useSession()

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (authUser) {
      navigate('/dashboard')
    }
  }, [authUser, navigate])

  const setupRecaptcha = () => {
    if (typeof window === 'undefined') return null;

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container-signup',
        {
          size: 'invisible',
          callback: (response) => {
            console.log('✅ reCAPTCHA solved', response);
          },
          'expired-callback': () => {
            console.warn('⚠️ reCAPTCHA expired, please try again');
          },
        },
        auth
      );
    }

    return window.recaptchaVerifier;
  };

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // client-side validation
    const normalizedEmail = String(email).trim().toLowerCase()
    const passwordRegex = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setLoading(false)
      return setError('Please enter a valid email address')
    }
    if (!passwordRegex.test(password)) {
      setLoading(false)
      return setError('Weak password - must be 8+ chars with upper, lower, number and special char')
    }
    if (password !== confirmPassword) {
      setLoading(false)
      return setError('Passwords do not match')
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

      console.log("🔹 Sending email verification...");
      await sendEmailVerification(firebaseUser);
      console.log("✅ Verification email sent to:", normalizedEmail);

      // 2. Global Auth Context Update (for immediate persistence during sync)
      login(firebaseUser)

      // Navigate immediately to dashboard; synchronization is non-blocking
      console.log('🎉 Signup successful, navigating to dashboard then syncing backend...')
      navigate('/dashboard')

      // Non-blocking backend sync for new user
      authAPI.syncFirebaseUser({
        firebaseUID: firebaseUser.uid,
        email: firebaseUser.email,
        name: name,
        provider: 'password'
      })
      .then((syncRes) => {
        if (syncRes.data.token) {
          setAuthToken(syncRes.data.token)
        }
        console.log('✅ Signup backend sync success', syncRes.data)
      })
      .catch((syncErr) => {
        console.warn('⚠️ Signup backend sync failed (ignored):', syncErr)
      })

      // still require email verification for safety
      setError(`✅ Verification email sent to ${normalizedEmail}. Confirm email if required.`)
      setLoading(false)
      return
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

  const handleSendOtp = async () => {
    setError(null)
    setIsSendingCode(true)

    const rawPhone = String(phoneNumber || '').trim()
    if (!rawPhone) {
      setError('Phone number is required')
      setIsSendingCode(false)
      return
    }

    const normalizedPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone.replace(/[^\d]/g, '')}`

    try {
      const verifier = setupRecaptcha()
      const confirmation = await signInWithPhoneNumber(auth, normalizedPhone, verifier)
      setVerificationId(confirmation)
      setError(`OTP sent to ${normalizedPhone}.`)
    } catch (err) {
      console.error('❌ Phone OTP send error:', err)
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError(null)
    setIsVerifyingCode(true)

    if (!verificationId) {
      setError('No OTP request found. Please request a code first.')
      setIsVerifyingCode(false)
      return
    }

    try {
      const result = await verificationId.confirm(otp)
      const firebaseUser = result.user
      firebaseUser.id = firebaseUser.uid

      // Sync with backend
      const syncRes = await authAPI.syncFirebaseUser({
        firebaseUID: firebaseUser.uid,
        email: firebaseUser.phoneNumber + '@phone.user',
        name: name || 'Phone User',
        provider: 'phone'
      });

      if (syncRes.data.token) {
        setAuthToken(syncRes.data.token);
      }

      if (syncRes.data.user && syncRes.data.token) {
        login(syncRes.data.token, syncRes.data.user);
      } else if (syncRes.data.user) {
        login(syncRes.data.user);
      }

      await initFirebaseSession(firebaseUser)
      navigate('/dashboard')
    } catch (err) {
      console.error('❌ OTP verification error:', err)
      setError(err.message || 'Invalid or expired OTP.')
    } finally {
      setIsVerifyingCode(false)
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


        {!isPhoneMode && (
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

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <ShieldCheck size={16} />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat your password"
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

        </form>
        )}

      </Card>

      <div className="mt-8 text-center animate-slide-up delay-200">
        <p className="text-gray-400 text-sm">
          Already have an account? {' '}
          <Link to="/login" className="text-secondary font-bold hover:underline">Sign in instead</Link>
        </p>
      </div>

      <div id="recaptcha-container-signup" className="invisible h-0 w-0" />
    </div>
  )
}
