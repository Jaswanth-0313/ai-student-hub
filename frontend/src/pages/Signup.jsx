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
