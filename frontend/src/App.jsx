import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Tools from './pages/Tools'
import Resources from './pages/Resources'
import Info from './pages/Info'
import DevCPP from './pages/DevCPP'
import Support from './pages/Support'
import Profile from './pages/Profile'
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
        <Route path="/info" element={<ProtectedRoute><Navbar /><Info /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Navbar /><Support /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Navbar /><Profile /></ProtectedRoute>} />
        <Route path="/devcpp" element={<ProtectedRoute><Navbar /><DevCPP /></ProtectedRoute>} />
        <Route path="*" element={<div className="p-6">Page not found</div>} />
      </Routes>
    </div>
  )
}
