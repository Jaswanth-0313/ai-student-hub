import React, { useContext, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Menu, X, User as UserIcon, LogOut, ChevronDown, Settings } from 'lucide-react'
import { cn } from './ui/Card'
import { Button } from './ui/Button'

export default function Navbar() {
  console.log('✅ Navbar rendered')
  const { user, logout } = useContext(AuthContext)
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Tools', path: '/tools' },
    { name: 'Resources', path: '/resources' },
    { name: 'Info', path: '/info' },
    { name: 'Support', path: '/support' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Student Hub" className="h-10 w-10 object-contain rounded-lg" />
          <Link to="/dashboard" className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            AI Student Hub
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive(link.path) ? "text-primary" : "text-gray-400"
              )}
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <div className="relative ml-4">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-3 pr-2 text-sm text-text transition-colors hover:bg-white/10"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <UserIcon size={14} />
                </div>
                <span className="max-w-[100px] truncate font-medium">{user.name}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-white/10 bg-surface shadow-xl glass animate-fade-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <button
                        onClick={() => { setDropdownOpen(false); logout(); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm">Login</Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-surface/95 backdrop-blur-xl animate-fade-in">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-base font-medium transition-colors",
                  isActive(link.path) ? "bg-primary/10 text-primary" : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="mt-4 border-t border-white/10 pt-4 pb-2">
                <div className="flex items-center px-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <UserIcon size={20} />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.name}</div>
                    <div className="text-sm font-medium text-gray-400">{user.email}</div>
                  </div>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  <Settings size={20} className="text-gray-400" /> Settings
                </Link>
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-red-400 hover:bg-red-500/10"
                >
                  <LogOut size={20} /> Logout
                </button>
              </div>
            ) : (
              <div className="mt-4 px-3">
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="primary" className="w-full">Login</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
