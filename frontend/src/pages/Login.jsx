import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Mail, Lock, AlertCircle, Rocket } from 'lucide-react'
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  fetchSignInMethodsForEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendEmailVerification,
  signOut
} from "firebase/auth";
import { auth } from '../firebase'
import { AuthContext } from '../context/AuthContext'
import { authAPI, setAuthToken, setFirebaseIdToken } from '../services/api'
import { useSession } from '../context/SessionContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [verificationId, setVerificationId] = useState(null)
  const [isPhoneMode, setIsPhoneMode] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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
        'recaptcha-container',
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

  const syncFirebaseUser = async (firebaseUser, providerType = 'password') => {
    try {
      console.log("🔹 Syncing Firebase User with backend...");
      const idToken = await firebaseUser.getIdToken(true);
      setFirebaseIdToken(idToken);

      const payload = {
        firebaseUID: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.phoneNumber || 'Student',
        provider: providerType
      };

      if (providerType === 'phone') {
        delete payload.email;
        payload.phoneNumber = firebaseUser.phoneNumber;
      }

      const syncRes = await authAPI.syncFirebaseUser(payload);

      if (syncRes.data.token) {
        setAuthToken(syncRes.data.token);
      }

      if (syncRes.data.user && syncRes.data.token) {
        login(syncRes.data.token, syncRes.data.user);
      } else if (syncRes.data.user) {
        login(syncRes.data.user);
      }

      await initFirebaseSession(firebaseUser);
      console.log("✅ Backend sync successful");
    } catch (syncErr) {
      console.error("❌ Firebase sync failed:", syncErr);
      const errorMsg = syncErr.response?.data?.message || syncErr.message || 'Failed to sync with backend';
      throw new Error(errorMsg);
    }
  };

  const syncGoogleUser = async (firebaseUser) => {
    try {
      console.log("🔹 Syncing Google User with backend...");
      // Get Firebase ID token for API calls
      const idToken = await firebaseUser.getIdToken(true);
      setFirebaseIdToken(idToken);
      
      console.log("🔹 Sending sync request with:", {
        firebaseUID: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        provider: 'google.com'
      });

      const syncRes = await authAPI.syncFirebaseUser({
        firebaseUID: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        provider: 'google.com'
      });

      console.log("✅ Sync response received:", syncRes.data);

      if (syncRes.data.token) {
        setAuthToken(syncRes.data.token);
      }

      if (syncRes.data.user && syncRes.data.token) {
        login(syncRes.data.token, syncRes.data.user);
      } else if (syncRes.data.user) {
        login(syncRes.data.user);
      }

      await initFirebaseSession(firebaseUser);
      console.log("✅ Google sync successful");
    } catch (syncErr) {
      console.error("❌ Google sync failed - Details:");
      console.error("  Error code:", syncErr.code);
      console.error("  Error message:", syncErr.message);
      console.error("  Response status:", syncErr.response?.status);
      console.error("  Response data:", syncErr.response?.data);
      
      // Provide helpful error message
      const errorMsg = syncErr.response?.data?.message || syncErr.message || 'Failed to sync with backend';
      throw new Error(errorMsg);
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const normalizedEmail = String(email).trim().toLowerCase()
    if (!normalizedEmail || !password) {
      setLoading(false)
      return setError('Email and password are required')
    }

    try {
      // ✅ CHECK PROVIDER BEFORE LOGIN
      console.log("🔍 Checking provider for:", normalizedEmail);
      const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
      console.log("📋 Sign-in methods for email:", methods);

      // If user has Google as provider, block password login
      if (methods.includes('google.com')) {
        setLoading(false);
        return setError('❌ This account uses Google login. Please continue with Google instead.');
      }

      // Proceed with password login
      console.log("🚀 Starting password login for:", normalizedEmail);
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password)
      console.log("✅ Firebase Login Success:", userCredential.user.uid);

      const firebaseUser = userCredential.user;
      firebaseUser.id = firebaseUser.uid;

      if (!firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser);
        setError('✉️ Email not verified. Verification email sent. Please verify before signing in.');
        setLoading(false);
        await signOut(auth);
        return;
      }

      // Get Firebase ID token for API calls
      const idToken = await firebaseUser.getIdToken(true);
      setFirebaseIdToken(idToken);

      // Set initial Firebase user
      login(firebaseUser)

      // Sync with backend using shared function
      try {
        await syncFirebaseUser(firebaseUser, 'password');
        console.log("🎉 Login Complete! Navigating...");
        navigate('/dashboard');
      } catch (syncErr) {
        console.error("❌ Backend sync failed during login:", syncErr);
        setError(syncErr.message || 'Failed to sync user.');
      }
    } catch (err) {
      console.error("❌ FULL FIREBASE ERROR:", err.code, err.message);

      let msg = err.message || 'Login failed';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'User not found. Please sign up first.';
      }

      setError(msg);
    } finally {
      console.log("🏁 Login process finished");
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setError(null)
      setGoogleLoading(true)
      const provider = new GoogleAuthProvider()

      console.log("🚀 Starting Google login with popup...");
      // Use popup for better user experience
      const result = await signInWithPopup(auth, provider)
      const firebaseUser = result.user

      console.log("✅ Google popup successful:", firebaseUser.email);
      
      // Sync Google user with backend
      await syncGoogleUser(firebaseUser)
      navigate('/dashboard')
    } catch (err) {
      console.error("❌ Google Login Error:", err.code, err.message)
      
      // Handle specific error codes
      if (err.code === 'auth/popup-blocked') {
        setError('⚠️ Google sign-in popup was blocked. Please allow popups for this site and try again.')
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError(null) // User closed popup, don't show error
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('❌ This domain is not authorized for Google sign-in. Contact support.')
      } else {
        setError(err.message || 'Google login failed. Please try again.')
      }
      setGoogleLoading(false)
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

      await syncFirebaseUser(firebaseUser, 'phone')
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
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`py-2 px-3 rounded-lg border ${isPhoneMode ? 'border-white/20 bg-transparent text-white/70' : 'border-primary bg-primary/20 text-white'}`}
            onClick={() => setIsPhoneMode(false)}
          >Email login</button>
          <button
            type="button"
            className={`py-2 px-3 rounded-lg border ${isPhoneMode ? 'border-primary bg-primary/20 text-white' : 'border-white/20 bg-transparent text-white/70'}`}
            onClick={() => setIsPhoneMode(true)}
          >Phone login</button>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {isPhoneMode ? (
            <> 
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full pl-4 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-600 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingCode}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingCode ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">OTP Code</label>
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full pl-4 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-600 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingCode}
                className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifyingCode ? 'Verifying...' : 'Verify OTP and Sign In'}
              </button>
            </>
          ) : (
            <>
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
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline font-semibold">
                    Forgot?
                  </Link>
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
            </>
          )}

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
            disabled={googleLoading || loading}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                Connecting...
              </>
            ) : (
              <>
                <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="h-5 w-5" alt="Google" />
                Continue with Google
              </>
            )}
          </button>
        </form>
      </Card>

      <div id="recaptcha-container" className="invisible h-0 w-0" />

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
