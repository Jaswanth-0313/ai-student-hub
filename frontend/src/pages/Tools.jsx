import React, { useEffect, useState, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

// Tool definitions with metadata (keys match server `data/toolsList.js`)
const AVAILABLE_TOOLS = {
  chatgpt: {
    name: 'ChatGPT',
    logo: '/assets/tools/chatgpt.png',
    icon: '🤖',
    category: 'Content Generation',
    description: 'AI-powered content generation and explanations',
    url: 'https://chat.openai.com',
    credentialType: 'apiKey',
    credentialLabel: 'OpenAI API Key'
  },
  gamma: {
    name: 'Gamma',
    logo: '/assets/tools/gamma.png',
    icon: '📊',
    category: 'Presentations',
    description: 'Create stunning AI-powered presentations',
    url: 'https://gamma.app',
    credentialType: 'apiKey',
    credentialLabel: 'Gamma API Key'
  },
  figma: {
    name: 'Figma',
    logo: '/assets/tools/figma.png',
    icon: '🎨',
    category: 'Design',
    description: 'UI/UX design and prototyping',
    url: 'https://figma.com',
    credentialType: 'apiKey',
    credentialLabel: 'Figma API Key'
  },
  lovable: {
    name: 'Lovable',
    logo: '/assets/tools/lovable.png',
    icon: '💜',
    category: 'Development',
    description: 'AI-powered app development',
    url: 'https://lovable.dev',
    credentialType: 'apiKey',
    credentialLabel: 'Lovable API Key'
  },
  canva: {
    name: 'Canva',
    logo: '/assets/tools/canva.png',
    icon: '🖼️',
    category: 'Design',
    description: 'Graphic design made easy',
    url: 'https://canva.com',
    credentialType: 'apiKey',
    credentialLabel: 'Canva API Key'
  },
  github: {
    name: 'GitHub',
    logo: '/assets/tools/github.png',
    icon: '🐙',
    category: 'Development',
    description: 'Code hosting and collaboration',
    url: 'https://github.com',
    credentialType: 'token',
    credentialLabel: 'GitHub Personal Access Token'
  },
  leetcode: {
    name: 'LeetCode',
    logo: '/assets/tools/leetcode.png',
    icon: '💻',
    category: 'Practice',
    description: 'Coding interview preparation',
    url: 'https://leetcode.com',
    credentialType: 'username',
    credentialLabel: 'LeetCode Username'
  },
  notebooklm: {
    name: 'Notebook LM',
    logo: '/assets/tools/notebooklm.png',
    icon: '📔',
    category: 'Research & Analysis',
    description: 'AI-powered research and note-taking with Google',
    url: 'https://notebooklm.google.com',
    credentialType: 'token',
    credentialLabel: 'Google API Key or OAuth Token'
  }
}

export default function Tools(){
  const [tools, setTools] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [connecting, setConnecting] = useState(null)
  const [showModal, setShowModal] = useState(null)
  const [credentials, setCredentials] = useState({})
  const { token } = useContext(AuthContext)

  // Fetch tools once on mount. Use Vite env for base URL.
  useEffect(() => {
    let mounted = true

    const loadTools = async () => {
      setLoading(true)
      setError(null)
      try {
        const base = import.meta.env.VITE_API_BASE || '/api'
        const url = `${base.replace(/\/$/, '')}/tools`
        console.log('🔍 Fetching tools from:', url)
        
        const res = await api.get(url)
        console.log('✅ Tools API response:', res.data)

        // Normalize response shape. Handle: array, {tools: []}, {data: []}, etc.
        const payload = res.data
        let list = []
        if (Array.isArray(payload)) {
          list = payload
        } else if (payload && typeof payload === 'object') {
          if (Array.isArray(payload.tools)) list = payload.tools
          else if (Array.isArray(payload.data)) list = payload.data
          else if (Array.isArray(payload.items)) list = payload.items
          else {
            // Fallback: find first array in object
            for (const v of Object.values(payload)) {
              if (Array.isArray(v)) {
                list = v
                break
              }
            }
          }
        }

        if (mounted) {
          setTools(list)
          console.log('📦 Tools state set to:', list)
        }
      } catch (err) {
        console.error('❌ Error loading tools:', err)
        const message = err?.response?.data?.message || err?.message || 'Failed to load tools'
        if (mounted) {
          setError(message)
          console.error('Error message:', message)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadTools()
    return () => {
      mounted = false
    }
  }, [])

  const handleConnect = async (toolName) => {
    try {
      setConnecting(toolName)
      const tool = AVAILABLE_TOOLS[toolName]
      const payload = { credential: credentials[toolName] || '' }

      const res = await api.post(`/tools/connect/${toolName}`, payload)
      console.log(`✅ ${toolName} connected:`, res.data)
      
      // Refresh tools list
      await loadTools()
      setShowModal(null)
      setCredentials({})
    } catch (err) {
      console.error(`❌ Error connecting ${toolName}:`, err)
      setError(err.response?.data?.message || `Failed to connect ${toolName}`)
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = async (toolName) => {
    try {
      setConnecting(toolName)
      const res = await api.delete(`/tools/disconnect/${toolName}`)
      console.log(`✅ ${toolName} disconnected:`, res.data)
      
      // Refresh tools list
      await loadTools()
    } catch (err) {
      console.error(`❌ Error disconnecting ${toolName}:`, err)
      setError(err.response?.data?.message || `Failed to disconnect ${toolName}`)
    } finally {
      setConnecting(null)
    }
  }

  if (loading) {
    return <div className="p-6 text-center">⏳ Loading tools...</div>
  }

  // Ensure tools is an array. Prevent undefined/null crashes.
  const toolsArray = Array.isArray(tools) ? tools : []
  const allTools = Object.entries(AVAILABLE_TOOLS)
  const connectedToolNames = toolsArray
    .filter(t => t && typeof t === 'object' && t.connected)
    .map(t => t.key || t.name || '')

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🛠️ Connected Tools</h1>
        <p className="text-gray-600">Connect AI tools to enhance your learning experience</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{connectedToolNames.length}</div>
          <div className="text-sm text-gray-600">Tools Connected</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{allTools.length}</div>
          <div className="text-sm text-gray-600">Total Available</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round((connectedToolNames.length / allTools.length) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Connected</div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(!toolsArray || toolsArray.length === 0) && (
          <div className="p-6 text-center col-span-full text-gray-500">No tools available</div>
        )}

        {allTools && allTools.length > 0 && allTools.map(([toolId, toolInfo]) => {
          const isConnected = connectedToolNames.includes(toolId)
          return (
            <div
              key={toolId}
              className={`p-4 rounded-lg border-2 transition-all ${
                isConnected
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img src={toolInfo.logo} alt={toolInfo.name} className="w-8 h-8 rounded" onError={(e) => e.target.style.display = 'none'} />
                  <div className="text-3xl">{toolInfo.icon}</div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    isConnected
                      ? 'bg-green-200 text-green-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {isConnected ? '✅ Connected' : '⭕ Not Connected'}
                </span>
              </div>

              <h3 className="text-lg font-bold mb-1">{toolInfo.name}</h3>
              <p className="text-xs text-gray-600 mb-1">{toolInfo.category}</p>
              <p className="text-sm text-gray-700 mb-4">{toolInfo.description}</p>

              <div className="flex gap-2">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => window.open(toolInfo.url, '_blank')}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                    >
                      🔗 Open
                    </button>
                    <button
                      onClick={() => handleDisconnect(toolId)}
                      disabled={connecting === toolId}
                      className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition disabled:opacity-50"
                    >
                      {connecting === toolId ? '...' : '❌ Disconnect'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowModal(toolId)}
                    className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                  >
                    ✚ Connect
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal for credentials */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              Connect {AVAILABLE_TOOLS[showModal].name}
            </h2>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              📖 Get your {AVAILABLE_TOOLS[showModal].credentialLabel} from:{' '}
              <a
                href={AVAILABLE_TOOLS[showModal].url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline"
              >
                {AVAILABLE_TOOLS[showModal].url}
              </a>
            </div>

            <input
              type={AVAILABLE_TOOLS[showModal].credentialType === 'apiKey' ? 'password' : 'text'}
              placeholder={AVAILABLE_TOOLS[showModal].credentialLabel}
              value={credentials[showModal] || ''}
              onChange={(e) =>
                setCredentials({ ...credentials, [showModal]: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(null)
                  setCredentials({})
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConnect(showModal)}
                disabled={connecting === showModal || !credentials[showModal]}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                {connecting === showModal ? '⏳ Connecting...' : '✓ Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
