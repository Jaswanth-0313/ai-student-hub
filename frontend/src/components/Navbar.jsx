import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Navbar(){
  const { user, logout } = useContext(AuthContext)
  const [open, setOpen] = useState(false)
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img src="/studenthub-logo.svg" alt="Student Hub" className="h-8 w-8" onError={(e) => e.target.style.display = 'none'} />
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600">AI Student Hub</Link>
        </div>

        <div className="lg:hidden">
          <button aria-label="Toggle menu" onClick={() => setOpen(!open)} className="p-2 rounded-md border">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h14M3 10h14M3 14h14" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <nav className={`hidden lg:flex items-center gap-4 ${open ? 'block' : ''}`}>
          <Link to="/dashboard" className="text-sm text-gray-700 hover:text-indigo-600 transition">Dashboard</Link>
          <Link to="/tools" className="text-sm text-gray-700 hover:text-indigo-600 transition">Tools</Link>
          <Link to="/info" className="text-sm text-gray-700 hover:text-indigo-600 transition">Information</Link>
          <Link to="/support" className="text-sm text-gray-700 hover:text-indigo-600 transition">Support</Link>
          <Link to="/profile" className="text-sm text-gray-700 hover:text-indigo-600 transition">Profile</Link>
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.name}</span>
              <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition">Logout</button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition">Login</Link>
          )}
        </nav>

        {open && (
          <div className="absolute top-16 left-0 right-0 bg-white border-t shadow-md lg:hidden">
            <div className="max-w-6xl mx-auto p-4 flex flex-col gap-3">
              <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm text-gray-700">Dashboard</Link>
              <Link to="/tools" onClick={() => setOpen(false)} className="text-sm text-gray-700">Tools</Link>
              <Link to="/info" onClick={() => setOpen(false)} className="text-sm text-gray-700">Information</Link>
              <Link to="/support" onClick={() => setOpen(false)} className="text-sm text-gray-700">Support</Link>
              <Link to="/profile" onClick={() => setOpen(false)} className="text-sm text-gray-700">Profile</Link>
              {user ? (
                <>
                  <span className="text-sm text-gray-600">{user.name}</span>
                  <button onClick={() => { setOpen(false); logout(); }} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Login</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
