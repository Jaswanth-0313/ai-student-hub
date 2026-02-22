import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Navbar(){
  const { user, logout } = useContext(AuthContext)
  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🤖</div>
          <Link to="/dashboard" className="font-semibold">AI Student Hub</Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/tools" className="text-sm text-gray-700">Tools</Link>
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.name}</span>
              <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Logout</button>
            </>
          ) : (
            <Link to="/login" className="text-sm text-gray-700">Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
