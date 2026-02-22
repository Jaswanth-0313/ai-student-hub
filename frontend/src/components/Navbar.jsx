import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Navbar(){
  const { user, logout } = useContext(AuthContext)
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img src="/studenthub-logo.png" alt="Student Hub" className="h-8 w-8 rounded" onError={(e) => e.target.style.display = 'none'} />
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600">AI Student Hub</Link>
        </div>
        <nav className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm text-gray-700 hover:text-indigo-600 transition">Dashboard</Link>
          <Link to="/tools" className="text-sm text-gray-700 hover:text-indigo-600 transition">Tools</Link>
          <Link to="/info" className="text-sm text-gray-700 hover:text-indigo-600 transition">Information & Uses</Link>
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.name}</span>
              <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition">Logout</button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition">Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
