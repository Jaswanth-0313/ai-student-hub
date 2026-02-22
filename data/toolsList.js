// Static list of available tools
module.exports = [
  {
    name: 'ChatGPT',
    key: 'chatgpt',
    logo: '/assets/tools/chatgpt.svg',
    description: 'Content generation & explanations',
    website: 'https://chat.openai.com',
    features: ['Conversational AI', 'Text generation', 'Summaries', 'Code assistance'],
    useCases: ['Generate study notes', 'Explain concepts', 'Draft essays', 'Debug code'],
    howTo: 'Sign up for OpenAI, create an API key, and add it in Student Hub under Connect → ChatGPT.'
  },
  {
    name: 'Lovable',
    key: 'lovable',
    logo: '/assets/tools/lovable.svg',
    description: 'AI-powered app development',
    website: 'https://lovable.dev',
    features: ['Scaffold apps', 'AI code suggestions'],
    useCases: ['Prototype projects quickly', 'Generate boilerplate code'],
    howTo: 'Get your Lovable API key and connect via Student Hub.'
  },
  {
    name: 'Gamma',
    key: 'gamma',
    logo: '/assets/tools/gamma.svg',
    description: 'Presentation creation',
    website: 'https://gamma.app',
    features: ['Auto-slide generation', 'Design templates'],
    useCases: ['Create class presentations', 'Visualize projects'],
    howTo: 'Generate slides using Gamma and link your API key in Student Hub.'
  },
  {
    name: 'Figma',
    key: 'figma',
    logo: '/assets/tools/figma.svg',
    description: 'UI/UX design',
    website: 'https://figma.com',
    features: ['Design prototypes', 'Collaboration', 'Plugins'],
    useCases: ['Design project UIs', 'Create interactive prototypes'],
    howTo: 'Use Figma personal access token and add it in Student Hub to sync designs.'
  },
  {
    name: 'Canva',
    key: 'canva',
    logo: '/assets/tools/canva.svg',
    description: 'Graphic design',
    website: 'https://canva.com',
    features: ['Templates', 'Drag & drop editor', 'Export assets'],
    useCases: ['Create posters', 'Design study materials'],
    howTo: 'Obtain a Canva API key and add it under Connect → Canva.'
  },
  {
    name: 'GitHub',
    key: 'github',
    logo: '/assets/tools/github.svg',
    description: 'Code collaboration',
    website: 'https://github.com',
    features: ['Repositories', 'PRs', 'Actions'],
    useCases: ['Store assignments', 'Collaborate on code'],
    howTo: 'Create a personal access token and connect it via Student Hub.'
  },
  {
    name: 'LeetCode',
    key: 'leetcode',
    logo: '/assets/tools/leetcode.svg',
    description: 'Coding practice',
    website: 'https://leetcode.com',
    features: ['Problems', 'Discuss', 'Contests'],
    useCases: ['Practice interview questions', 'Track progress'],
    howTo: 'Provide your LeetCode username in the Connect modal to save your profile.'
  },
  {
    name: 'Notebook LM',
    key: 'notebooklm',
    logo: '/assets/tools/notebooklm.svg',
    description: 'AI research and note-taking',
    website: 'https://notebooklm.google.com',
    features: ['Note summarization', 'Document-assisted research'],
    useCases: ['Summarize lecture notes', 'Research topics quickly'],
    howTo: 'Use your Google API token or OAuth to connect Notebook LM.'
  },
  {
    name: 'DevC++',
    key: 'devcpp',
    logo: '/assets/tools/devcpp.svg',
    description: 'Classic C++ IDE for quick practice',
    website: 'https://orwelldevcpp.blogspot.com/',
    features: ['Lightweight IDE', 'Quick compilation'],
    useCases: ['Practice C++ locally', 'Test snippets quickly'],
    howTo: 'DevC++ does not require credentials; use the Visit button to download or open it.'
  }
];
