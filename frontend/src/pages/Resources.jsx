import React, { useState } from 'react'
import { ExternalLink, Globe, Layout, LifeBuoy, Search, Settings, Sparkles, Zap } from 'lucide-react'
import { openToolWindow } from '../utils/tabManager'
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
  },
  {
    name: 'DevC++ v5.11',
    key: 'devcpp',
    icon: '💻',
    url: 'https://sourceforge.net/projects/orwelldevcpp/',
    category: 'IDE',
    description: 'DevC++ v5.11 is used by students for C and C++ programming practice, for local C/C++ exercises and compiling.',
    gradient: 'from-[#10a37f]/20 to-[#10a37f]/5',
    usage: 'Install from SourceForge and run the IDE for offline code practice.'
  },
  {
    name: 'Gmail',
    key: 'gmail',
    icon: '📧',
    url: 'https://mail.google.com/',
    category: 'Communication',
    description: 'Gmail is automatically connected using your login email.',
    gradient: 'from-[#ea4335]/20 to-[#ea4335]/5',
    usage: 'Click Open to launch Gmail in a new tab.'
  }
]

const EXTERNAL_TOOLS = [
  {
    name: 'ChatGPT',
    description: 'OpenAI assistant for content, code, and study help.',
    url: 'https://chat.openai.com',
    icon: '🤖',
    gradient: 'from-[#10a37f]/20 to-[#10a37f]/5'
  },
  {
    name: 'LinkedIn',
    description: 'Professional networking and career growth platform.',
    url: 'https://www.linkedin.com',
    icon: '🔗',
    gradient: 'from-[#0a66c2]/20 to-[#0a66c2]/5'
  },
  {
    name: 'GET Multi',
    description: 'Multi-step task and workflow automation for students.',
    url: 'https://getmulti.com',
    icon: '🧠',
    gradient: 'from-[#ff9900]/20 to-[#ff9900]/5'
  },
  {
    name: 'Emergent',
    description: 'Discover emerging AI tools and product updates.',
    url: 'https://emergent.com',
    icon: '✨',
    gradient: 'from-[#8b5cf6]/20 to-[#8b5cf6]/5'
  }
]

const IMPORTANT_USERS = [
  {
    name: 'LinkedIn',
    description: 'Professional networking for students and career growth.',
    url: 'https://www.linkedin.com',
    icon: '🔗'
  }
]

const USER_INFO = [
  {
    title: 'Profile Overview',
    content: 'Your dashboard profile data and preferences will appear here once you sign in.'
  }
]

const RESOURCE_PURPOSES = [
  { id: 'all', label: 'All learning' }, { id: 'study', label: 'Study & exams' }, { id: 'code', label: 'Coding' },
  { id: 'ai', label: 'AI & machine learning' }, { id: 'design', label: 'UI/UX & design' }, { id: 'create', label: 'Content creation' },
  { id: 'career', label: 'Career' }, { id: 'startup', label: 'Entrepreneurship' }
]

const CURATED_RESOURCES = [
  { title: 'Khan Academy', type: 'Study foundations', purpose: 'study', description: 'Practice mathematics, science, and exam fundamentals.', url: 'https://www.khanacademy.org' },
  { title: 'freeCodeCamp', type: 'Coding practice', purpose: 'code', description: 'Learn web development through guided lessons and projects.', url: 'https://www.freecodecamp.org' },
  { title: 'Machine Learning Crash Course', type: 'AI course', purpose: 'ai', description: 'A practical introduction to machine learning concepts and exercises.', url: 'https://developers.google.com/machine-learning/crash-course' },
  { title: 'Figma Learn', type: 'Design tutorials', purpose: 'design', description: 'Learn layouts, prototypes, and interface design systems.', url: 'https://help.figma.com/hc/en-us/categories/360002051613-Learn-design' },
  { title: 'GitHub Skills', type: 'Project learning', purpose: 'code', description: 'Learn GitHub workflows with interactive exercises.', url: 'https://skills.github.com' },
  { title: 'Y Combinator Startup School', type: 'Startup guide', purpose: 'startup', description: 'Structured lessons for validating ideas and building startups.', url: 'https://www.startupschool.org' }
]

export default function Resources() {
  const [purpose, setPurpose] = useState('all')
  const [search, setSearch] = useState('')
  const visibleResources = CURATED_RESOURCES.filter(resource => {
    const query = search.trim().toLowerCase()
    return (purpose === 'all' || resource.purpose === purpose) && (!query || `${resource.title} ${resource.type} ${resource.description}`.toLowerCase().includes(query))
  })

  return (
    <PageContainer>
      <SectionTitle
        title="Learn with purpose"
        subtitle="Choose a goal to find curated learning resources, while keeping the existing guides below."
      />

      <Card className="mb-10 border-secondary/20 bg-secondary/5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><Search size={17} className="text-secondary" /> What do you want to learn?</div>
        <div className="flex flex-wrap gap-2">{RESOURCE_PURPOSES.map(item => <button key={item.id} type="button" onClick={() => setPurpose(item.id)} className={`rounded-full border px-3 py-2 text-xs font-medium transition ${purpose === item.id ? 'border-secondary bg-secondary text-white' : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}>{item.label}</button>)}</div>
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search courses, tutorials, and guides" className="mt-4 w-full rounded-xl border border-white/10 bg-surface/60 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30" />
      </Card>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleResources.map(resource => <Card key={resource.title} className="flex flex-col justify-between border-white/10 hover:border-secondary/40"><div><div className="mb-3 flex items-center justify-between"><span className="rounded-full bg-secondary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">{resource.type}</span><Globe size={16} className="text-gray-500" /></div><h2 className="text-xl font-bold text-white">{resource.title}</h2><p className="mt-2 text-sm leading-6 text-gray-400">{resource.description}</p></div><a href={resource.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline">Open resource <ExternalLink size={14} /></a></Card>)}
      </div>

      <SectionTitle title="Existing tool guides" subtitle="Your connected services and setup links remain available here." />

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

            {tool.usage && (
              <p className="text-xs text-gray-300 mb-3">{tool.usage}</p>
            )}

            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1 gap-2 text-xs h-9 bg-white/10 border-white/10 text-white hover:bg-white/20"
                onClick={() => openToolWindow(tool.key || tool.name, tool.url)}
              >
                <Globe size={14} /> Open
              </Button>
              {tool.setupUrl && (
                <Button
                  variant="outline"
                  className="flex-1 gap-2 text-xs h-9 border-white/5 hover:border-white/20"
                  onClick={() => openToolWindow(`${tool.key || tool.name}-setup`, tool.setupUrl)}
                >
                  <Settings size={14} /> Setup
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <SectionTitle
          title="External Tools"
          subtitle="Quick access to extra study and productivity resources."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
          {EXTERNAL_TOOLS.map((tool) => (
            <Card key={tool.name} className={`bg-gradient-to-br ${tool.gradient} border-white/5 hover:border-white/20 transition-all duration-300`}>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{tool.icon}</div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">External</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{tool.name}</h2>
                  <p className="text-sm text-gray-300 leading-relaxed">{tool.description}</p>
                </div>
                <Button
                  variant="primary"
                  className="w-full gap-2 text-xs h-11 bg-white/10 border-white/10 text-white hover:bg-white/20"
                  onClick={() => openToolWindow(tool.name, tool.url)}
                >
                  <Globe size={14} /> Open
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-white/10">
            <h3 className="text-lg font-bold text-white mb-3">Important Users</h3>
            <p className="text-sm text-gray-400 mb-4">Useful platforms for students, professionals, and networking.</p>
            <div className="space-y-3">
              {IMPORTANT_USERS.map((user) => (
                <a
                  key={user.name}
                  href={user.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-2xl border border-white/10 bg-slate-900/50 hover:border-white/20 transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{user.icon}</span>
                    <span className="font-semibold text-white">{user.name}</span>
                  </div>
                  <p className="text-sm text-gray-400">{user.description}</p>
                </a>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-white/10">
            <h3 className="text-lg font-bold text-white mb-3">User Info</h3>
            <p className="text-sm text-gray-400 mb-4">Profile info and personal details will appear here when you sign in.</p>
            <div className="space-y-4">
              {USER_INFO.map((item) => (
                <div key={item.title} className="rounded-2xl bg-slate-900/60 p-4 border border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.content}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
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
