import React, { useEffect, useState, useContext } from 'react'
import { CheckCircle2, ExternalLink, Globe, Info as InfoIcon, Link as LinkIcon, Lock, Plus, Trash2, X } from 'lucide-react'
import api, { setAuthToken } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { PageContainer } from '../components/ui/PageContainer'
import { SectionTitle } from '../components/ui/SectionTitle'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const AVAILABLE_TOOLS = {
  chatgpt: {
    name: 'ChatGPT',
    logo: '/assets/tools/chatgpt.svg',
    icon: '🤖',
    category: 'Content Generation',
    description: 'AI-powered content generation and explanations',
    url: 'https://chat.openai.com',
    credentialType: 'apiKey',
    credentialLabel: 'OpenAI API Key'
  },
  gamma: {
    name: 'Gamma',
    logo: '/assets/tools/gamma.svg',
    icon: '📊',
    category: 'Presentations',
    description: 'Create stunning AI-powered presentations',
    url: 'https://gamma.app',
    credentialType: 'apiKey',
    credentialLabel: 'Gamma API Key'
  },
  figma: {
    name: 'Figma',
    logo: '/assets/tools/figma.svg',
    icon: '🎨',
    category: 'Design',
    description: 'UI/UX design and prototyping',
    url: 'https://figma.com',
    credentialType: 'apiKey',
    credentialLabel: 'Figma API Key'
  },
  lovable: {
    name: 'Lovable',
    logo: '/assets/tools/lovable.svg',
    icon: '💜',
    category: 'Development',
    description: 'AI-powered app development',
    url: 'https://lovable.dev',
    credentialType: 'apiKey',
    credentialLabel: 'Lovable API Key'
  },
  canva: {
    name: 'Canva',
    logo: '/assets/tools/canva.svg',
    icon: '🖼️',
    category: 'Design',
    description: 'Graphic design made easy',
    url: 'https://canva.com',
    credentialType: 'apiKey',
    credentialLabel: 'Canva API Key'
  },
  github: {
    name: 'GitHub',
    logo: '/assets/tools/github.svg',
    icon: '🐙',
    category: 'Development',
    description: 'Code hosting and collaboration',
    url: 'https://github.com',
    credentialType: 'token',
    credentialLabel: 'GitHub Personal Access Token'
  },
  leetcode: {
    name: 'LeetCode',
    logo: '/assets/tools/leetcode.svg',
    icon: '💻',
    category: 'Practice',
    description: 'Coding interview preparation',
    url: 'https://leetcode.com',
    credentialType: 'username',
    credentialLabel: 'LeetCode Username'
  },
  notebooklm: {
    name: 'Notebook LM',
    logo: '/assets/tools/notebooklm.svg',
    icon: '📔',
    category: 'Research & Analysis',
    description: 'AI-powered research and note-taking with Google',
    url: 'https://notebooklm.google.com',
    credentialType: 'token',
    credentialLabel: 'Google API Key or OAuth Token'
  },
  devcpp: {
    name: 'DevC++',
    logo: '/assets/tools/devcpp.svg',
    icon: '💻',
    category: 'IDE',
    description: 'Classic C++ IDE for quick practice',
    url: 'https://orwelldevcpp.blogspot.com/',
    credentialType: 'none',
    credentialLabel: 'No credential required'
  }
}

export default function Tools() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connecting, setConnecting] = useState(null)
  const [showModal, setShowModal] = useState(null)
  const [credentials, setCredentials] = useState({})
  const { token } = useContext(AuthContext)

  const loadTools = async () => {
    try {
      const res = await api.get('/tools')
      let list = []
      const payload = res.data
      if (Array.isArray(payload)) list = payload
      else if (payload?.tools) list = payload.tools
      setTools(list)
    } catch (err) {
      console.error('Error loading tools:', err)
      setError(err.response?.data?.message || 'Failed to load tools')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTools()
  }, [])

  const handleConnect = async (toolName) => {
    try {
      setConnecting(toolName)
      const payload = { credential: credentials[toolName] || '' }
      await api.post(`/tools/connect/${toolName}`, payload)
      await loadTools()
      setShowModal(null)
      setCredentials({})
    } catch (err) {
      setError(err.response?.data?.message || `Failed to connect ${toolName}`)
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = async (toolName) => {
    try {
      setConnecting(toolName)
      await api.delete(`/tools/disconnect/${toolName}`)
      await loadTools()
    } catch (err) {
      setError(err.response?.data?.message || `Failed to disconnect ${toolName}`)
    } finally {
      setConnecting(null)
    }
  }

  if (loading) return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    </PageContainer>
  )

  const connectedToolNames = tools.filter(t => t?.connected).map(t => t.key || t.name)
  const allTools = Object.entries(AVAILABLE_TOOLS)

  return (
    <PageContainer>
      <SectionTitle
        title="Connected Tools"
        subtitle="Manage and connect AI integrations to supercharge your study workflow."
      />

      {error && (
        <Card className="mb-6 border-red-500/50 bg-red-500/10">
          <p className="text-red-400 text-sm">{error}</p>
        </Card>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="flex flex-col items-center justify-center py-8">
          <span className="text-4xl font-bold text-primary mb-1">{connectedToolNames.length}</span>
          <span className="text-sm font-medium text-gray-400">Tools Active</span>
        </Card>
        <Card className="flex flex-col items-center justify-center py-8">
          <span className="text-4xl font-bold text-white mb-1">{allTools.length}</span>
          <span className="text-sm font-medium text-gray-400">Available</span>
        </Card>
        <Card className="flex flex-col items-center justify-center py-8">
          <span className="text-4xl font-bold text-secondary mb-1">
            {allTools.length > 0 ? Math.round((connectedToolNames.length / allTools.length) * 100) : 0}%
          </span>
          <span className="text-sm font-medium text-gray-400">Connection Rate</span>
        </Card>
      </div>

      {/* Multi-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTools.map(([toolId, toolInfo]) => {
          const isConnected = connectedToolNames.includes(toolId)
          return (
            <Card
              key={toolId}
              className={`group flex flex-col justify-between overflow-hidden transition-all duration-300 ${isConnected ? 'border-primary/50 ring-1 ring-primary/20' : 'hover:border-white/20'
                }`}
            >
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-xl bg-surface border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                      <span className="text-2xl">{toolInfo.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{toolInfo.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{toolInfo.category}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${isConnected ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-gray-500 border border-white/5'
                    }`}>
                    {isConnected ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">{toolInfo.description}</p>
              </div>

              <div className="flex gap-3">
                {isConnected ? (
                  <>
                    <Button
                      variant="primary"
                      className="flex-1 gap-2 text-xs h-9"
                      onClick={() => window.open(toolInfo.url, '_blank')}
                    >
                      <Globe size={14} /> Open
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 gap-2 text-xs h-9 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => handleDisconnect(toolId)}
                      disabled={connecting === toolId}
                    >
                      <Trash2 size={14} /> {connecting === toolId ? '...' : 'Remove'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-xs h-9 hover:bg-primary/10 hover:border-primary/30 border-white/10"
                    onClick={() => setShowModal(toolId)}
                  >
                    <Plus size={14} /> Connect Tool
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Connection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="max-w-md w-full p-8 shadow-2xl relative border-white/10 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowModal(null)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-primary to-secondary">
                <span className="text-3xl">{AVAILABLE_TOOLS[showModal].icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Connect {AVAILABLE_TOOLS[showModal].name}</h2>
                <p className="text-sm text-gray-400">Security-first API integration</p>
              </div>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-3">
              <InfoIcon className="text-primary shrink-0 mt-0.5" size={18} />
              <div className="text-sm leading-relaxed text-gray-300">
                You can generate your <strong>{AVAILABLE_TOOLS[showModal].credentialLabel}</strong> at:
                <a
                  href={AVAILABLE_TOOLS[showModal].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 font-bold text-primary hover:underline flex items-center gap-1"
                >
                  {AVAILABLE_TOOLS[showModal].url} <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <Lock size={16} />
                </div>
                <input
                  type={AVAILABLE_TOOLS[showModal].credentialType === 'apiKey' ? 'password' : 'text'}
                  placeholder={AVAILABLE_TOOLS[showModal].credentialLabel}
                  value={credentials[showModal] || ''}
                  onChange={(e) =>
                    setCredentials({ ...credentials, [showModal]: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-500 transition-all font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 py-6 border border-white/5 hover:bg-white/5"
                onClick={() => {
                  setShowModal(null)
                  setCredentials({})
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-[2] py-6 shadow-lg shadow-primary/20"
                onClick={() => handleConnect(showModal)}
                disabled={connecting === showModal || (!credentials[showModal] && AVAILABLE_TOOLS[showModal].credentialType !== 'none')}
              >
                {connecting === showModal ? 'Negotiating Connection...' : 'Verify & Connect'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  )
}
