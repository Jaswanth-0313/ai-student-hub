import React, { useEffect, useState, useContext } from 'react'
import { CheckCircle2, Globe, Trash2 } from 'lucide-react'
import { getAuth } from 'firebase/auth'
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
    description: 'AI-powered content generation and explanations',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    credentialType: 'apiKey',
    credentialLabel: 'OpenAI API Key'
  },
  lovable: {
    name: 'Lovable',
    url: 'https://lovable.dev',
    logo: 'https://cdn-icons-png.flaticon.com/512/1077/1077035.png',
    description: 'AI-powered app development',
    apiKeyUrl: 'https://lovable.dev/docs/api',
    credentialType: 'token',
    credentialLabel: 'Lovable Token'
  },
  gamma: {
    name: 'Gamma',
    url: 'https://gamma.app',
    logo: 'https://cdn.simpleicons.org/gamma',
    description: 'Presentation creation',
    apiKeyUrl: 'https://gamma.app/login',
    credentialType: 'none',
    credentialLabel: 'Login in browser'
  },
  figma: {
    name: 'Figma',
    url: 'https://figma.com',
    logo: 'https://cdn.simpleicons.org/figma',
    description: 'UI/UX design',
    apiKeyUrl: 'https://www.figma.com/developers/api#authentication',
    credentialType: 'token',
    credentialLabel: 'Figma Personal Access Token'
  },
  canva: {
    name: 'Canva',
    url: 'https://canva.com',
    logo: 'https://cdn.simpleicons.org/canva',
    description: 'Graphic design',
    apiKeyUrl: 'https://www.canva.com/developers/',
    credentialType: 'token',
    credentialLabel: 'Canva API Token'
  },
  github: {
    name: 'GitHub',
    url: 'https://github.com',
    logo: 'https://cdn.simpleicons.org/github',
    description: 'Code collaboration',
    apiKeyUrl: 'https://github.com/settings/tokens',
    credentialType: 'token',
    credentialLabel: 'GitHub Personal Access Token'
  },
  leetcode: {
    name: 'LeetCode',
    url: 'https://leetcode.com',
    logo: 'https://cdn.simpleicons.org/leetcode',
    description: 'Coding practice',
    apiKeyUrl: 'https://leetcode.com/api/zhihui/graphql/query/',
    credentialType: 'username',
    credentialLabel: 'LeetCode Username'
  },
  notebooklm: {
    name: 'Notebook LM',
    url: 'https://notebooklm.google.com',
    logo: 'https://cdn.simpleicons.org/google',
    description: 'AI research and note-taking',
    apiKeyUrl: 'https://notebooklm.google.com',
    credentialType: 'none',
    credentialLabel: 'Login in browser'
  },
  devcpp: {
    name: 'DevC++ v5.11',
    url: 'https://sourceforge.net/projects/orwelldevcpp/',
    logo: 'https://cdn-icons-png.flaticon.com/512/6132/6132222.png',
    description: 'DevC++ v5.11 is used by students for C and C++ programming practice',
    apiKeyUrl: 'https://sourceforge.net/projects/orwelldevcpp/',
    credentialType: 'none',
    credentialLabel: 'No API key required'
  },
  gmail: {
    name: 'Gmail',
    url: 'https://mail.google.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png',
    description: 'Gmail is automatically connected using your login email. Just click to open Gmail.',
    apiKeyUrl: 'https://mail.google.com',
    credentialType: 'none',
    credentialLabel: 'Uses your login email'
  }
}

// Credential modal component
function CredentialModal({ tool, onClose, onSubmit, isLoading, error }) {
  const [credential, setCredential] = useState('')
  const [credentialError, setCredentialError] = useState('')

  const toolDetails = TOOL_DETAILS[tool] || {}
  const requiresCredential = toolDetails.credentialType && toolDetails.credentialType !== 'none'

  const handleSubmit = () => {
    if (requiresCredential && !credential.trim()) {
      setCredentialError(`${toolDetails.credentialLabel} is required`)
      return
    }
    onSubmit(credential)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-slate-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Connect {toolDetails.name}</h2>
          <p className="text-sm text-gray-400 mt-1">Get started in just a few steps</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Error display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Quick Access Links:</p>
            <div className="flex gap-2">
              <a
                href={toolDetails.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded font-medium transition flex items-center justify-center gap-1 border border-slate-600"
              >
                <Globe size={14} />
                Open Website
              </a>
              {toolDetails.apiKeyUrl && toolDetails.apiKeyUrl !== toolDetails.url && (
                <a
                  href={toolDetails.apiKeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded font-medium transition flex items-center justify-center gap-1 border border-slate-600"
                >
                  <CheckCircle2 size={14} />
                  Get Credentials
                </a>
              )}
            </div>
          </div>

          {/* Credential Input */}
          {requiresCredential && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {toolDetails.credentialLabel}
              </label>
              <input
                type={toolDetails.credentialType === 'apiKey' ? 'password' : 'text'}
                value={credential}
                onChange={(e) => {
                  setCredential(e.target.value)
                  setCredentialError('')
                }}
                placeholder={`Enter your ${toolDetails.credentialLabel.toLowerCase()}`}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-gray-500 focus:border-primary focus:outline-none transition"
              />
              {credentialError && (
                <p className="text-red-400 text-xs mt-1">{credentialError}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                � Your credentials are encrypted and stored securely. We never share them with anyone.
              </p>
            </div>
          )}

          {!requiresCredential && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded px-3 py-2">
              <p className="text-sm text-blue-300">
                Simply log in with your {toolDetails.name} account when you click "Open" button.
              </p>
            </div>
          )}

          {/* Success Message Preview */}
          <div className="bg-green-500/10 border border-green-500/20 rounded px-3 py-2">
            <p className="text-sm text-green-300">
              ✅ Once connected, your credentials will be stored securely until you disconnect the tool.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 px-6 py-3 flex gap-3 justify-end bg-slate-800/50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Connecting...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Connect
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Tools() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connecting, setConnecting] = useState(null)
  const [modalOpen, setModalOpen] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const { token } = useContext(AuthContext)

  const handleOpenTool = (toolKey, toolUrl) => {
    // Special handling for Gmail - verify account consistency
    if (toolKey === 'gmail') {
      const auth = getAuth()
      const currentUser = auth.currentUser

      if (!currentUser?.email) {
        setError('❌ Not logged in. Please log in to open Gmail.')
        return
      }

      // Verify Gmail is opened with the same email as logged-in user
      console.log(`📧 Opening Gmail for: ${currentUser.email}`)
      
      // Open Gmail with hint parameter to prefer the logged-in account
      const gmailUrlWithHint = `${toolUrl}?authuser=${currentUser.email}`
      openToolWindow(toolKey, gmailUrlWithHint)
    } else {
      openToolWindow(toolKey, toolUrl)
    }
  }

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
    if (!window.confirm(`Are you sure you want to disconnect ${TOOL_DETAILS[toolKey]?.name || toolKey}? Your stored API key will be removed.`)) {
      return
    }
    try {
      setConnecting(toolKey)
      await api.delete(`/tools/disconnect/${toolKey}`)
      await loadTools()
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to disconnect ${toolKey}`)
    } finally {
      setConnecting(null)
    }
  }

  const handleConnectClick = (toolKey) => {
    const toolDetails = TOOL_DETAILS[toolKey] || {}
    setError(null) // Clear previous errors when opening modal
    // Set loading state before attempting connection
    setConnecting(toolKey)
    
    // For tools that don't require credentials, connect directly
    if (toolDetails.credentialType === 'none') {
      handleConnectSubmit(toolKey, '')
    } else {
      // Open modal for credential input
      setModalOpen(toolKey)
      setConnecting(null) // Reset loading state since modal is open
    }
  }

  const handleConnectSubmit = async (toolKey, credential) => {
    try {
      setModalLoading(true)
      const payload = credential ? { credential } : {}
      await api.post(`/tools/connect/${toolKey}`, payload)
      await loadTools()
      setModalOpen(null)
      setError(null)
      
      // Show success message
      const toolName = TOOL_DETAILS[toolKey]?.name || toolKey
      console.log(`✅ ${toolName} connected! Your API key is securely stored.`)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to connect ${toolKey}`)
    } finally {
      setModalLoading(false)
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

  useEffect(() => {
    loadTools()
  }, [])

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
                      onClick={() => handleOpenTool(tool.key, tool.url)}
                    >
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 gap-2 text-xs h-9 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => handleDisconnect(tool.key)}
                      disabled={connecting === tool.key}
                    >
                      {connecting === tool.key ? 'Disconnecting...' : 'Disconnect'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full text-xs h-9"
                    onClick={() => handleConnectClick(tool.key)}
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

      {/* Credential Modal */}
      {modalOpen && (
        <CredentialModal
          tool={modalOpen}
          onClose={() => setModalOpen(null)}
          onSubmit={(credential) => handleConnectSubmit(modalOpen, credential)}
          isLoading={modalLoading}
          error={error}
        />
      )}
    </PageContainer>
  )
}

