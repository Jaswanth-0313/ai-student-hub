import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Blocks, Code, Link as LinkIcon, Settings, Sparkles, TrendingUp } from 'lucide-react'
import api, { setAuthToken } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { PageContainer } from '../components/ui/PageContainer'
import { SectionTitle } from '../components/ui/SectionTitle'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Dashboard() {
  const [tools, setTools] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useContext(AuthContext)

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

  const connectedCount = tools.filter(t => t && t.connected).length
  const totalCount = tools.length
  const percentage = totalCount > 0 ? Math.round((connectedCount / totalCount) * 100) : 0

  if (error) return (
    <PageContainer>
      <Card className="border-red-500/50 bg-red-500/10"><p className="text-red-400">{error}</p></Card>
    </PageContainer>
  )

  if (loading) return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    </PageContainer>
  )

  return (
    <PageContainer>
      {/* Welcome Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-1 rounded-xl bg-gradient-to-tr from-primary to-secondary">
            <div className="bg-background rounded-[10px] p-2">
              <img src="/logo.jpg" alt="Logo" className="h-10 w-10 object-contain" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              Welcome back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{user?.name || ''}</span>
              <span className="inline-block animate-bounce origin-bottom">👋</span>
            </h1>
            <p className="mt-1 text-gray-400">Here's your study hub overview for today.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <LinkIcon size={64} className="text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-400">Tools Connected</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{connectedCount}</span>
              <span className="text-sm text-green-400 flex items-center"><TrendingUp size={14} className="mr-1" /> Active</span>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Blocks size={64} className="text-secondary" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-400">Total Integrations</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{totalCount}</span>
              <span className="text-sm text-gray-400">Available</span>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Ecosystem Progress</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{percentage}%</span>
            </div>
          </div>
          <div className="mt-4 h-2 w-full bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Main Grid Floor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Quick Actions & Connected Tools (Spans 2 cols on lg) */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <SectionTitle title="Quick Actions" subtitle="Jump right back into your workflow" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/tools" className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl">
                <Card className="h-full hover:bg-white/[0.02] border-primary/30 hover:border-primary/60 flex items-center p-5 gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <Blocks size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Connect Tools</h3>
                    <p className="text-sm text-gray-400 mt-1">Discover new integrations</p>
                  </div>
                </Card>
              </Link>

              <Link to="/devcpp" className="block focus:outline-none focus:ring-2 focus:ring-secondary rounded-2xl">
                <Card className="h-full hover:bg-white/[0.02] border-secondary/30 hover:border-secondary/60 flex items-center p-5 gap-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                    <Code size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Code Compiler</h3>
                    <p className="text-sm text-gray-400 mt-1">Open Dev-C++ Workspace</p>
                  </div>
                </Card>
              </Link>
            </div>
          </section>

          <section>
            <SectionTitle title="Your Integrations" />
            {tools.filter(t => t && t.connected).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tools.filter(t => t && t.connected).map(t => (
                  <Card key={t.key} className="flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        {t.name}
                      </h4>
                      <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-md font-medium">
                        Active
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Connected since {t.connectedAt ? new Date(t.connectedAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed border-white/20">
                <div className="h-16 w-16 mb-4 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                  <Blocks size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No tools connected yet</h3>
                <p className="text-gray-400 mb-6 max-w-sm">
                  Supercharge your learning experience by integrating AI tools into your hub.
                </p>
                <Link to="/tools">
                  <Button variant="primary">Connect First Tool</Button>
                </Link>
              </Card>
            )}
          </section>
        </div>

        {/* Right Column: Recent Activity Stack */}
        <div className="space-y-8">
          <section>
            <SectionTitle title="System Status" />
            <Card className="p-0 overflow-hidden">
              <div className="p-5 border-b border-white/10 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">All Systems Operational</p>
                  <p className="text-xs text-green-400">Latency: 24ms</p>
                </div>
              </div>
              <div className="p-5 border-b border-white/10 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-400">
                  <Settings size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Profile Configured</p>
                  <Link to="/settings" className="text-xs text-primary hover:underline">Review Settings</Link>
                </div>
              </div>
              <div className="p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-400">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Last Login</p>
                  <p className="text-xs text-gray-500">Just now from Current Device</p>
                </div>
              </div>
            </Card>
          </section>
        </div>

      </div>
    </PageContainer>
  )
}
