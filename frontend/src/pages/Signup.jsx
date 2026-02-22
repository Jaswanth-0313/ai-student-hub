import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api, { authAPI } from '../services/api'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function Signup(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await authAPI.register({ name, email, password })
      // after register redirect to login (or auto-login if API returned token)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
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
