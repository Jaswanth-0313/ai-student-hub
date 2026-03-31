// Static list of available tools
module.exports = [
  {
    name: 'ChatGPT',
    key: 'chatgpt',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    description: 'Content generation & explanations',
    website: 'https://chat.openai.com',
    features: ['Conversational AI', 'Text generation', 'Summaries', 'Code assistance'],
    useCases: ['Generate study notes', 'Explain concepts', 'Draft essays', 'Debug code'],
    howTo: 'Sign up for OpenAI, create an API key, and add it in Student Hub under Connect → ChatGPT.'
  },
  {
    name: 'Lovable',
    key: 'lovable',
    logo: 'https://cdn-icons-png.flaticon.com/512/1077/1077035.png',
    description: 'AI-powered app development',
    website: 'https://lovable.dev',
    features: ['Scaffold apps', 'AI code suggestions'],
    useCases: ['Prototype projects quickly', 'Generate boilerplate code'],
    howTo: 'Get your Lovable API key and connect via Student Hub.'
  },
  {
    name: 'Gamma',
    key: 'gamma',
    logo: '/src/assets/logos/gamma.png',
    description: 'Presentation creation',
    website: 'https://gamma.app',
    features: ['Auto-slide generation', 'Design templates'],
    useCases: ['Create class presentations', 'Visualize projects'],
    howTo: 'Generate slides using Gamma and link your API key in Student Hub.'
  },
  {
    name: 'Figma',
    key: 'figma',
    logo: 'https://cdn.simpleicons.org/figma',
    description: 'UI/UX design',
    website: 'https://figma.com',
    features: ['Design prototypes', 'Collaboration', 'Plugins'],
    useCases: ['Design project UIs', 'Create interactive prototypes'],
    howTo: 'Use Figma personal access token and add it in Student Hub to sync designs.'
  },
  {
    name: 'Canva',
    key: 'canva',
    logo: '/src/assets/logos/canva.png',
    description: 'Graphic design',
    website: 'https://canva.com',
    features: ['Templates', 'Drag & drop editor', 'Export assets'],
    useCases: ['Create posters', 'Design study materials'],
    howTo: 'Obtain a Canva API key and add it under Connect → Canva.'
  },
  {
    name: 'GitHub',
    key: 'github',
    logo: 'https://cdn.simpleicons.org/github',
    description: 'Code collaboration',
    website: 'https://github.com',
    features: ['Repositories', 'PRs', 'Actions'],
    useCases: ['Store assignments', 'Collaborate on code'],
    howTo: 'Create a personal access token and connect it via Student Hub.'
  },
  {
    name: 'LeetCode',
    key: 'leetcode',
    logo: 'https://cdn.simpleicons.org/leetcode',
    description: 'Coding practice',
    website: 'https://leetcode.com',
    features: ['Problems', 'Discuss', 'Contests'],
    useCases: ['Practice interview questions', 'Track progress'],
    howTo: 'Provide your LeetCode username in the Connect modal to save your profile.'
  },
  {
    name: 'Notebook LM',
    key: 'notebooklm',
    logo: '/src/assets/logos/notebooklm.png',
    description: 'AI research and note-taking',
    website: 'https://notebooklm.google.com',
    features: ['Note summarization', 'Document-assisted research'],
    useCases: ['Summarize lecture notes', 'Research topics quickly'],
    howTo: 'Use your Google API token or OAuth to connect Notebook LM.'
  },
  {
    name: 'Notion',
    key: 'notion',
    logo: 'https://cdn.simpleicons.org/notion',
    description: 'Notion workspace integration for notes',
    website: 'https://www.notion.so',
    features: ['Database sync', 'Documentation', 'Notes'],
    useCases: ['Organize assignments', 'Track projects'],
    howTo: 'Use Notion integration token and connect it via Student Hub.'
  },
  {
    name: 'DevC++ v5.11',
    key: 'devcpp',
    logo: 'https://cdn-icons-png.flaticon.com/512/6132/6132222.png',
    description: 'DevC++ v5.11 is used by students for C and C++ programming practice',
    website: 'https://sourceforge.net/projects/orwelldevcpp/',
    features: ['Lightweight IDE', 'Quick compilation', 'C/C++ learning'],
    useCases: ['Practice C++ problems', 'Learn C/C++ programming', 'Test code snippets'],
    howTo: 'Use the DevC++ connection in Tools and open the official download/reference site using the Open button.'
  },
  {
    name: 'Gmail',
    key: 'gmail',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png',
    description: 'Gmail is automatically connected via your user account',
    website: 'https://mail.google.com',
    features: ['Email access', 'Notifications', 'Inbox management'],
    useCases: ['Open Gmail directly', 'Send emails', 'Track assignments'],
    howTo: 'Gmail is automatically connected using your login email. Just click Open Gmail.'
  }
];
