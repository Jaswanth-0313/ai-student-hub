import React, { useEffect, useState, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

// Tool definitions with metadata
const AVAILABLE_TOOLS = {
  chatGPT: {
    name: 'ChatGPT',
    icon: '🤖',
    category: 'Content Generation',
    description: 'AI-powered content generation and explanations',
    url: 'https://chat.openai.com',
    credentialType: 'apiKey',
    credentialLabel: 'OpenAI API Key'
  },
  gamma: {
    name: 'Gamma',
    icon: '📊',
    category: 'Presentations',
    description: 'Create stunning AI-powered presentations',
    url: 'https://gamma.app',
    credentialType: 'apiKey',
    credentialLabel: 'Gamma API Key'
  },
  figma: {
    name: 'Figma',
    icon: '🎨',
    category: 'Design',
    description: 'UI/UX design and prototyping',
    url: 'https://figma.com',
    credentialType: 'apiKey',
    credentialLabel: 'Figma API Key'
  },
  lovable: {
    name: 'Lovable',
    icon: '💜',
    category: 'Development',
    description: 'AI-powered app development',
    url: 'https://lovable.dev',
    credentialType: 'apiKey',
    credentialLabel: 'Lovable API Key'
  },
  canva: {
    name: 'Canva',
    icon: '🖼️',
    category: 'Design',
    description: 'Graphic design made easy',
    url: 'https://canva.com',
    credentialType: 'apiKey',
    credentialLabel: 'Canva API Key'
  },
  github: {
    name: 'GitHub',
    icon: '🐙',
    category: 'Development',
    description: 'Code hosting and collaboration',
    url: 'https://github.com',
    credentialType: 'token',
    credentialLabel: 'GitHub Personal Access Token'
  },
  leetcode: {
    name: 'LeetCode',
    icon: '💻',
    category: 'Practice',
    description: 'Coding interview preparation',
    url: 'https://leetcode.com',
    credentialType: 'username',
    credentialLabel: 'LeetCode Username'
  }
}

export default function Tools(){
  const [tools, setTools] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connecting, setConnecting] = useState(null)
  const [showModal, setShowModal] = useState(null)
  const [credentials, setCredentials] = useState({})
  const { token } = useContext(AuthContext)

  useEffect(() => {
    if (!token) return
    loadTools()
  }, [token])

  const loadTools = async () => {
    try {
      setLoading(true)
      const res = await api.get('/tools/mytools')
      setTools(res.data)
    } catch (err) {
      console.error('Error loading tools:', err)
      setError(err.response?.data?.message || 'Failed to load tools')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (toolName) => {
    try {
      setConnecting(toolName)
      const tool = AVAILABLE_TOOLS[toolName]
      const payload = {}

      if (tool.credentialType === 'apiKey') {
        payload.apiKey = credentials[toolName] || ''
      } else if (tool.credentialType === 'token') {
        payload.token = credentials[toolName] || ''
        payload.username = ''
      } else if (tool.credentialType === 'username') {
        payload.username = credentials[toolName] || ''
      }

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
      const res = await api.post(`/tools/disconnect/${toolName}`, {})
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

  const connectedToolNames = tools?.connectedTools || []
  const allTools = Object.entries(AVAILABLE_TOOLS)

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
        {allTools.map(([toolId, toolInfo]) => {
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
                <div className="text-3xl">{toolInfo.icon}</div>
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
