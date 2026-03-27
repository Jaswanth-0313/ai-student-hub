import React from 'react'
import { ExternalLink, Globe, Layout, LifeBuoy, Settings, Sparkles, Zap } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { SectionTitle } from '../components/ui/SectionTitle'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const TOOLS = [
  {
    name: 'ChatGPT',
    icon: '🤖',
    url: 'https://chat.openai.com',
    setupUrl: 'https://platform.openai.com/api-keys',
    category: 'Content Generation',
    description: 'Get explanations, write content, brainstorm ideas',
    gradient: 'from-[#10a37f]/20 to-[#10a37f]/5'
  },
  {
    name: 'Gamma',
    icon: '📊',
    url: 'https://gamma.app',
    setupUrl: 'https://gamma.app/integrations',
    category: 'Presentations',
    description: 'Create beautiful AI-powered presentations',
    gradient: 'from-[#8e44ad]/20 to-[#8e44ad]/5'
  },
  {
    name: 'Figma',
    icon: '🎨',
    url: 'https://www.figma.com',
    setupUrl: 'https://www.figma.com/developers/api',
    category: 'Design',
    description: 'Design mockups, prototypes, user interfaces',
    gradient: 'from-[#1abc9c]/20 to-[#1abc9c]/5'
  },
  {
    name: 'Lovable',
    icon: '💜',
    url: 'https://lovable.dev',
    setupUrl: 'https://lovable.dev/settings/api',
    category: 'Development',
    description: 'Build applications with AI assistance',
    gradient: 'from-[#ff00ff]/20 to-[#ff00ff]/5'
  },
  {
    name: 'Canva',
    icon: '🖼️',
    url: 'https://www.canva.com',
    setupUrl: 'https://www.canva.com/integrations',
    category: 'Design',
    description: 'Create graphics, posters, social media posts',
    gradient: 'from-[#00c4cc]/20 to-[#00c4cc]/5'
  },
  {
    name: 'GitHub',
    icon: '🐙',
    url: 'https://github.com',
    setupUrl: 'https://github.com/settings/tokens',
    category: 'Development',
    description: 'Store code, collaborate, version control',
    gradient: 'from-[#ffffff]/10 to-[#ffffff]/5'
  },
  {
    name: 'LeetCode',
    icon: '💻',
    url: 'https://leetcode.com',
    setupUrl: 'https://leetcode.com/accounts/login',
    category: 'Practice',
    description: 'Practice coding problems for interviews',
    gradient: 'from-[#ffa116]/20 to-[#ffa116]/5'
  }
]

export default function Resources() {
  return (
    <PageContainer>
      <SectionTitle
        title="AI Tools & Resources"
        subtitle="Direct access to all integrated services and quick-start guides."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {TOOLS.map((tool) => (
          <Card
            key={tool.name}
            className={`flex flex-col justify-between overflow-hidden group bg-gradient-to-br ${tool.gradient} border-white/5 hover:border-white/20 transition-all duration-300`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-background/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{tool.category}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{tool.name}</h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">{tool.description}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1 gap-2 text-xs h-9 bg-white/10 border-white/10 text-white hover:bg-white/20"
                onClick={() => {
                  const win = window.open(tool.url, '_blank');
                  if (win) {
                    if (!window.externalTabs) window.externalTabs = [];
                    window.externalTabs.push(win);
                  }
                }}
              >
                <Globe size={14} /> Visit
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-xs h-9 border-white/5 hover:border-white/20"
                onClick={() => {
                  const win = window.open(tool.setupUrl, '_blank');
                  if (win) {
                    if (!window.externalTabs) window.externalTabs = [];
                    window.externalTabs.push(win);
                  }
                }}
              >
                <Settings size={14} /> Setup
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Guides & Tips */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 border-primary/20 bg-primary/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
            <Layout size={20} className="text-primary" /> How to Get Started
          </h3>
          <ul className="space-y-4">
            {[
              'Click "Visit" to explore any tool\'s website.',
              'Use the "Setup" link to generate your API keys.',
              'Head to the Tools page to link them to your hub.',
              'Enjoy a unified workflow from your personal dashboard.'
            ].map((text, i) => (
              <li key={i} className="flex gap-4 items-start text-sm text-gray-400">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                  {i + 1}
                </span>
                <span className="mt-0.5 leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-8 border-secondary/20 bg-secondary/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
            <Zap size={20} className="text-secondary" /> Pro Learning Tips
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Consistency', text: 'LeetCode only needs your username to track progress.' },
              { label: 'Security', text: 'Never share your API keys with anyone.' },
              { label: 'Efficiency', text: 'Connect tools to automate repetitive tasks.' },
              { label: 'Synergy', text: 'Use ChatGPT and NotebookLM together for research.' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-secondary/70 tracking-tighter">{item.label}</span>
                <p className="text-sm text-gray-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Learn More Banner */}
      <Card className="mt-8 p-8 bg-indigo-500/10 border-indigo-500/20 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-[1.7] transition-transform duration-700">
          <Sparkles size={120} className="text-indigo-400" />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-3">Master the Platform</h3>
          <p className="text-gray-400 max-w-xl mx-auto text-sm mb-6">
            Our documentation center covers everything from initial setup to advanced debugging.
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            <a href="/docs/guide" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-1.5 transition-colors">
              Connection Guide <ExternalLink size={14} />
            </a>
            <a href="/docs/web" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-1.5 transition-colors">
              Website Index <ExternalLink size={14} />
            </a>
            <a href="/docs/debug" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-1.5 transition-colors text-red-400/80 hover:text-red-400">
              Debug Auth <LifeBuoy size={14} />
            </a>
          </div>
        </div>
      </Card>
    </PageContainer>
  )
}
