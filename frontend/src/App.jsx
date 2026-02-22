import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Tools from './pages/Tools'
import Resources from './pages/Resources'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>} />
        <Route path="/tools" element={<ProtectedRoute><Navbar /><Tools /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><Navbar /><Resources /></ProtectedRoute>} />
        <Route path="*" element={<div className="p-6">Page not found</div>} />
      </Routes>
    </div>
  )
}
