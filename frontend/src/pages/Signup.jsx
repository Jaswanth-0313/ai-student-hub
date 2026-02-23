import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api, { authAPI, setAuthToken } from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function Signup(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    // client-side validation
    const normalizedEmail = String(email).trim().toLowerCase()
    const passwordRegex = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/
    if (!normalizedEmail.endsWith('@gmail.com')) {
      return setError('Please use a @gmail.com email for signup')
    }
    if (!passwordRegex.test(password)) {
      return setError('Weak password - must be 8+ chars with upper, lower, number and special char')
    }
    try {
      const res = await authAPI.register({ name, email, password })
      const { token, user } = res.data
      
      // Auto-login after successful signup
      if (token && user) {
        setAuthToken(token)
        authContext.login(token, user)
        navigate('/dashboard')
      } else {
        // Fallback to login page if no token returned
        navigate('/login')
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Signup failed'
      console.error('Signup Error:', errorMsg)
      setError(errorMsg)
    }
  }

  return (
    <div className="auth-box">
      <h2>Sign up</h2>
      <div style={{marginBottom:12}}>
        <a className="btn-google" href="/api/users/google">Continue with Google</a>
      </div>
      <form onSubmit={submit}>
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />

        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />

        <button type="submit">Create account</button>
        {error && <div className="error">{error}</div>}
      </form>
      <div className="muted">Already have an account? <Link to="/login">Login</Link></div>
    </div>
  )
}
