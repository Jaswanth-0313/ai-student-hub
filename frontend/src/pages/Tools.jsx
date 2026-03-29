import React, { useEffect, useState, useContext } from 'react'
import { CheckCircle2, Globe, Trash2 } from 'lucide-react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { openToolWindow } from '../utils/tabManager'
import { PageContainer } from '../components/ui/PageContainer'
import { SectionTitle } from '../components/ui/SectionTitle'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const TOOL_FALLBACK_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'

const TOOL_DETAILS = {
  chatgpt: {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    description: 'AI-powered content generation and explanations'
  },
  lovable: {
    name: 'Lovable',
    url: 'https://lovable.dev',
    logo: 'https://cdn-icons-png.flaticon.com/512/1077/1077035.png',
    description: 'AI-powered app development'
  },
  gamma: {
    name: 'Gamma',
    url: 'https://gamma.app',
    logo: 'https://cdn.simpleicons.org/gamma',
    description: 'Presentation creation'
  },
  figma: {
    name: 'Figma',
    url: 'https://figma.com',
    logo: 'https://cdn.simpleicons.org/figma',
    description: 'UI/UX design'
  },
  canva: {
    name: 'Canva',
    url: 'https://canva.com',
    logo: 'https://cdn.simpleicons.org/canva',
    description: 'Graphic design'
  },
  github: {
    name: 'GitHub',
    url: 'https://github.com',
    logo: 'https://cdn.simpleicons.org/github',
    description: 'Code collaboration'
  },
  leetcode: {
    name: 'LeetCode',
    url: 'https://leetcode.com',
    logo: 'https://cdn.simpleicons.org/leetcode',
    description: 'Coding practice'
  },
  notebooklm: {
    name: 'Notebook LM',
    url: 'https://notebooklm.google.com',
    logo: 'https://cdn.simpleicons.org/google',
    description: 'AI research and note-taking'
  },
  devcpp: {
    name: 'DevC++ v5.11',
    url: 'https://sourceforge.net/projects/orwelldevcpp/',
    logo: 'https://cdn-icons-png.flaticon.com/512/6132/6132222.png',
    description: 'DevC++ v5.11 is used by students for C and C++ programming practice'
  },
  gmail: {
    name: 'Gmail',
    url: 'https://mail.google.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png',
    description: 'Gmail is automatically connected using your login email. Just click to open Gmail.'
  }
}

export default function Tools() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connecting, setConnecting] = useState(null)
  const { token } = useContext(AuthContext)

  const loadTools = async () => {
    try {
      const res = await api.get('/tools')
      const payload = res.data
      const list = Array.isArray(payload) ? payload : payload?.tools || []
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

  const handleDisconnect = async (toolKey) => {
    try {
      setConnecting(toolKey)
      await api.delete(`/tools/disconnect/${toolKey}`)
      await loadTools()
    } catch (err) {
      setError(err.response?.data?.message || `Failed to disconnect ${toolKey}`)
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

  const connectedToolKeys = new Set(tools.filter(t => t?.connected).map(t => t.key || ''))

  const enrichedTools = tools.map((tool) => {
    const details = TOOL_DETAILS[tool.key] || {}
    return {
      ...tool,
      name: tool.name || details.name,
      logo: details.logo || tool.logo || '/assets/tools/default.svg',
      url: details.url || '#',
      description: tool.description || details.description || ''
    }
  })

  const handleConnect = async (toolKey) => {
    try {
      setConnecting(toolKey)
      await api.post(`/tools/connect/${toolKey}`, { credential: '' })
      await loadTools()
    } catch (err) {
      setError(err.response?.data?.message || `Failed to connect ${toolKey}`)
    } finally {
      setConnecting(null)
    }
  }

  return (
    <PageContainer>
      <SectionTitle
        title="Available Tools"
        subtitle="Connect and manage your tools."
      />

      {error && (
        <Card className="mb-6 border-red-500/50 bg-red-500/10">
          <p className="text-red-400 text-sm">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrichedTools.map((tool) => {
          const isConnected = !!tool.connected

          return (
            <Card
              key={tool.key}
              className={`group flex flex-col justify-between overflow-hidden transition-all duration-300 ${isConnected ? 'border-primary/50 ring-1 ring-primary/20' : 'hover:border-white/20'}`}
            >
              <div className="p-4 flex flex-col items-center text-center">
                <div className="h-16 w-16 mb-3 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                  {tool.logo ? (
                    <img
                      src={tool.logo}
                      alt={`${tool.name} logo`}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = TOOL_FALLBACK_LOGO
                      }}
                    />
                  ) : (
                    <span className="text-2xl">{tool.name?.charAt(0)}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">{tool.key}</p>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{tool.description}</p>
              </div>

              <div className="px-4 pb-4 flex flex-wrap gap-2">
                {isConnected ? (
                  <>
                    <Button
                      variant="primary"
                      className="flex-1 gap-2 text-xs h-9"
<<<<<<< HEAD
                      onClick={() => openToolWindow(tool.key, tool.url)}
=======
                      onClick={() => {
                        const win = window.open(toolInfo.url, '_blank');
                        if (win) {
                          if (!window.externalTabs) window.externalTabs = [];
                          window.externalTabs.push(win);
                        }
                      }}
>>>>>>> 70f6487315ffb4abfc0e2702cd18e56bbd3189d9
                    >
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 gap-2 text-xs h-9 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => handleDisconnect(tool.key)}
                      disabled={connecting === tool.key}
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full text-xs h-9"
                    onClick={() => handleConnect(tool.key)}
                    disabled={connecting === tool.key}
                  >
                    {connecting === tool.key ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </PageContainer>
  )
}

