import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api, { setAuthToken, authAPI } from '../services/api'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await authAPI.login({ email, password })
      const { token, user } = res.data
      
      if (!token || !user) {
        throw new Error('Invalid server response - missing token or user')
      }
      
      setAuthToken(token)
      // update global auth
      authContext.login(token, user)
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed'
      console.error('Login Error:', errorMsg)
      setError(errorMsg)
    }
  }

  return (
    <div className="auth-box">
      <h2>Login</h2>
      <div style={{marginBottom:12}}>
        <a className="btn-google" href="/api/users/google">Sign in with Google</a>
      </div>
      <form onSubmit={submit}>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />

        <button type="submit">Login</button>
        {error && <div className="error">{error}</div>}
      </form>
      <div className="muted">Don't have an account? <Link to="/register">Sign up</Link></div>
    </div>
  )
}
