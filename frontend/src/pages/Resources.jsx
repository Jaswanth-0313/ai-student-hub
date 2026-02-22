import React from 'react'

const TOOLS = [
  {
    name: 'ChatGPT',
    icon: '🤖',
    url: 'https://chat.openai.com',
    setupUrl: 'https://platform.openai.com/api-keys',
    category: 'Content Generation',
    description: 'Get explanations, write content, brainstorm ideas',
    color: 'from-green-400 to-blue-600'
  },
  {
    name: 'Gamma',
    icon: '📊',
    url: 'https://gamma.app',
    setupUrl: 'https://gamma.app/integrations',
    category: 'Presentations',
    description: 'Create beautiful AI-powered presentations',
    color: 'from-purple-400 to-pink-600'
  },
  {
    name: 'Figma',
    icon: '🎨',
    url: 'https://www.figma.com',
    setupUrl: 'https://www.figma.com/developers/api',
    category: 'Design',
    description: 'Design mockups, prototypes, user interfaces',
    color: 'from-blue-400 to-purple-600'
  },
  {
    name: 'Lovable',
    icon: '💜',
    url: 'https://lovable.dev',
    setupUrl: 'https://lovable.dev/settings/api',
    category: 'Development',
    description: 'Build applications with AI assistance',
    color: 'from-pink-400 to-purple-600'
  },
  {
    name: 'Canva',
    icon: '🖼️',
    url: 'https://www.canva.com',
    setupUrl: 'https://www.canva.com/integrations',
    category: 'Design',
    description: 'Create graphics, posters, social media posts',
    color: 'from-blue-400 to-cyan-600'
  },
  {
    name: 'GitHub',
    icon: '🐙',
    url: 'https://github.com',
    setupUrl: 'https://github.com/settings/tokens',
    category: 'Development',
    description: 'Store code, collaborate, version control',
    color: 'from-gray-600 to-gray-900'
  },
  {
    name: 'LeetCode',
    icon: '💻',
    url: 'https://leetcode.com',
    setupUrl: 'https://leetcode.com/accounts/login',
    category: 'Practice',
    description: 'Practice coding problems for interviews',
    color: 'from-yellow-400 to-red-600'
  }
]

export default function Resources() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🌐 AI Tools & Resources</h1>
        <p className="text-gray-600">Direct access to all integrated tools and services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((tool) => (
          <div
            key={tool.name}
            className={`bg-gradient-to-br ${tool.color} p-6 rounded-lg shadow-lg text-white hover:shadow-2xl transition-shadow`}
          >
            <div className="text-4xl mb-2">{tool.icon}</div>
            <h2 className="text-xl font-bold mb-1">{tool.name}</h2>
            <p className="text-sm opacity-90 mb-3">{tool.category}</p>
            <p className="text-sm mb-4">{tool.description}</p>

            <div className="flex gap-2 flex-wrap">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded text-sm font-semibold transition text-center"
              >
                🔗 Visit
              </a>
              <a
                href={tool.setupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded text-sm font-semibold transition text-center"
              >
                ⚙️ Setup
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📚 How to Use</h3>
          <ol className="text-blue-800 text-sm space-y-2">
            <li>1. Click "🔗 Visit" to open any tool website</li>
            <li>2. Or click "⚙️ Setup" to get your API key</li>
            <li>3. Go to "Tools" page to connect with your app</li>
            <li>4. Once connected, click "🔗 Open" to use the tool</li>
          </ol>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-3">🎯 Quick Tips</h3>
          <ul className="text-green-800 text-sm space-y-2">
            <li>✨ LeetCode only needs your username (free!)</li>
            <li>🔐 Keep your API keys safe and secret</li>
            <li>🚀 Connect tools to enhance your learning</li>
            <li>💡 Use multiple tools for better results</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-6 bg-purple-100 border-2 border-purple-300 rounded-lg">
        <h3 className="text-lg font-bold text-purple-900 mb-2">📖 Learn More</h3>
        <p className="text-purple-800 mb-4">
          See our detailed guides for connecting each tool:
        </p>
        <ul className="text-purple-800 text-sm space-y-1">
          <li>📄 <a href="/docs/tool-connection-guide" className="underline font-semibold">Tool Connection Guide</a> - Step-by-step setup for each tool</li>
          <li>🔗 <a href="/docs/website-connections" className="underline font-semibold">Website Connections</a> - All URLs and how to access them</li>
          <li>🐛 <a href="/docs/auth-debugging" className="underline font-semibold">Debugging Guide</a> - Troubleshoot issues</li>
        </ul>
      </div>
    </div>
  )
}
