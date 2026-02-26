import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import api, { setAuthToken } from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function Dashboard() {
  const [tools, setTools] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const { logout, user } = useContext(AuthContext)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setAuthToken(token)

    const fetchTools = async () => {
      try {
        setLoading(true)
        const res = await api.get('/tools')
        const list = Array.isArray(res.data) ? res.data : res.data.tools || []
        setTools(list)
      } catch (err) {
        console.error('Error loading tools:', err)
        setError(err.response?.data?.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const connectedCount = tools.filter(t => t && t.connected).length
  const totalCount = tools.length
  const percentage = totalCount > 0 ? Math.round((connectedCount / totalCount) * 100) : 0

  if (error) return <div className="p-6 text-red-600">Error: {error}</div>
  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img src="/studenthub-logo.svg" alt="AI Student Hub" className="h-12 w-12" onError={(e) => e.target.style.display = 'none'} />
          <h1 className="text-3xl font-bold">Welcome, {user?.name || 'Student'}! 👋</h1>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">Logout</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{connectedCount}</div>
          <div className="text-sm text-gray-600 mt-1">Tools Connected</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-600">{totalCount}</div>
          <div className="text-sm text-gray-600 mt-1">Total Available</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="text-3xl font-bold text-purple-600">{percentage}%</div>
          <div className="text-sm text-gray-600 mt-1">Integration Progress</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Get Started</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/tools" className="px-6 py-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-center">
            🔗 Connect Tools
          </Link>
          <Link to="/devcpp" className="px-6 py-4 bg-white text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition text-center">
            💻 C/C++ Compiler
          </Link>
          <Link to="/settings" className="px-6 py-4 bg-white text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition text-center">
            ⚙️ Settings
          </Link>
        </div>
      </div>

      {/* Connected Tools Preview */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Connected Tools</h2>
        {tools.filter(t => t && t.connected).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.filter(t => t && t.connected).map(t => (
              <div key={t.key} className="bg-green-50 border-2 border-green-500 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-green-800">{t.name}</h4>
                <p className="text-sm text-gray-600 mt-1">✅ Connected</p>
                <p className="text-xs text-gray-500 mt-2">Connected since {t.connectedAt ? new Date(t.connectedAt).toLocaleDateString() : 'Recently'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-600">
            <p className="mb-4">No tools connected yet. Start connecting tools to enhance your learning!</p>
            <Link to="/tools" className="inline-block px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
              Connect Your First Tool
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
