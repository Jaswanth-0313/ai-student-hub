import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function ProtectedRoute({ children }){
  const { token, loading } = useContext(AuthContext)

  if (loading) return <div className="p-6">Loading...</div>
  if (!token) return <Navigate to="/login" />
  return children
}
