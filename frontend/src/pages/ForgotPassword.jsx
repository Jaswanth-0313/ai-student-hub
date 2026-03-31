import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebase'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { authAPI } from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const normalizedEmail = String(email).trim().toLowerCase()

    if (!normalizedEmail) {
      setLoading(false)
      return setError('Email is required')
    }

    try {
      // First check with backend if user exists and what provider they use
      try {
        const backendRes = await authAPI.forgotPassword(normalizedEmail)
        
        // Check if it's a Google user
        if (backendRes.data.provider === 'google') {
          setError('This account uses Google login. Please use Google to reset your password.')
          setLoading(false)
          return
        }
      } catch (backendErr) {
        // Backend error is OK, we'll try Firebase anyway
        console.log('Backend check skipped, proceeding with Firebase')
      }

      // Send Firebase password reset email
      console.log('🔹 Sending Firebase password reset email to:', normalizedEmail)
      await sendPasswordResetEmail(auth, normalizedEmail, {
        url: "https://ai-student-hub.web.app/login",
        handleCodeInApp: true
      })

      setSuccess(true)
      console.log('✅ Password reset email sent successfully')

      // Optionally redirect after a delay
      setTimeout(() => {
        navigate('/login')
      }, 5000)

    } catch (err) {
      console.error('❌ Password reset error:', err)
      
      let msg = err.message || 'Failed to send password reset email'
      
      // Firebase-specific error handling
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        msg = 'Email not found in our system'
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many password reset attempts. Please try again later.'
      }

      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Link 
          to="/login" 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Login</span>
        </Link>
      </div>

      {/* Logo Section */}
      <div className="mb-10 text-center animate-slide-up">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary to-secondary mb-4 shadow-lg shadow-primary/20">
          <div className="bg-background rounded-xl p-3">
            <img src="/logo.jpg" alt="Student Hub" className="h-12 w-12 object-contain" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Reset Password</h1>
        <p className="text-gray-400 mt-2">Enter your email to receive a password reset link</p>
      </div>

      <Card className="w-full max-w-md p-8 shadow-2xl border-white/10 animate-slide-up delay-100">
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                Email Address
              </label>
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
              <p className="text-xs text-gray-500 ml-1">
                We'll send a password reset link to this email
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-6 text-base shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Remember your password? {' '}
                <Link to="/login" className="text-primary font-bold hover:underline">
                  Sign in instead
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center animate-in scale-in duration-300">
                <CheckCircle size={32} className="text-green-500" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-gray-400 text-sm">
                We've sent a password reset link to <span className="text-white font-semibold">{email}</span>
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-left">
              <p className="text-sm text-blue-300">
                <strong>Next steps:</strong>
              </p>
              <ul className="text-sm text-blue-300 list-disc list-inside space-y-1 mt-2">
                <li>Check your email inbox</li>
                <li>Click the password reset link</li>
                <li>Enter your new password</li>
                <li>Sign in with your new password</li>
              </ul>
            </div>

            <p className="text-xs text-gray-500">
              Link will expire in 1 hour for security
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                className="w-full py-3"
              >
                Back to Login
              </Button>
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or {' '}
                <button
                  onClick={() => {
                    setSuccess(false)
                    setError(null)
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        )}
      </Card>

      <footer className="mt-16 text-xs text-gray-600 flex items-center gap-4">
        <span>&copy; 2026 AI Student Hub</span>
        <span className="h-1 w-1 bg-gray-800 rounded-full" />
        <Link to="/" className="hover:text-gray-400 transition-colors">Go Back Home</Link>
      </footer>
    </div>
  )
}
