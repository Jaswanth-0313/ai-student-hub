# 🛠️ Tool Connection Guide

Your AI Student Hub now has 7 integrated tools. Here's how to connect each one:

## Quick Start

1. **Open your app** → Click "Tools" in the navbar
2. **See all available tools** with connection status
3. **Click "✚ Connect"** on any tool
4. **Enter your credentials** (API key, token, or username)
5. **Click "✓ Connect"** to activate

---

## 📚 Tools & How to Get Credentials

### 🤖 **ChatGPT** - Content Generation
- **Category**: Content Generation
- **Use for**: Explanations, content writing, brainstorming
- **Credential needed**: OpenAI API Key
- **How to get**:
  1. Go to https://platform.openai.com/api-keys
  2. Sign in with OpenAI account
  3. Click "Create new secret key"
  4. Copy and paste in Tools page
  5. Keep it secret! Never share it.

---

### 📊 **Gamma** - Presentations
- **Category**: Presentations
- **Use for**: Create stunning AI-powered slides
- **Credential needed**: Gamma API Key
- **How to get**:
  1. Go to https://gamma.app
  2. Sign up/login
  3. Go to Settings → Integrations
  4. Generate API key
  5. Copy and paste in Tools page

---

### 🎨 **Figma** - UI/UX Design
- **Category**: Design
- **Use for**: Design mockups, prototypes, UI/UX collaboration
- **Credential needed**: Figma API Key (Personal Access Token)
- **How to get**:
  1. Go to https://www.figma.com
  2. Sign in, go to Settings → Developer → Personal access tokens
  3. Click "Create a new personal access token"
  4. Copy and paste in Tools page
  5. Set expiration date (keep long for continuous access)

---

### 💜 **Lovable** - App Development
- **Category**: Development
- **Use for**: AI-powered app building, code generation
- **Credential needed**: Lovable API Key
- **How to get**:
  1. Go to https://lovable.dev
  2. Sign up/login
  3. Dashboard → API Settings
  4. Create new API key
  5. Copy and paste in Tools page

---

### 🖼️ **Canva** - Graphic Design
- **Category**: Design
- **Use for**: Graphic design, social media posts, presentations
- **Credential needed**: Canva API Key
- **How to get**:
  1. Go to https://www.canva.com
  2. Sign up/login → Settings → Integrations
  3. Generate API key
  4. Copy and paste in Tools page

---

### 🐙 **GitHub** - Code Collaboration
- **Category**: Development
- **Use for**: Code hosting, version control, project management
- **Credential needed**: GitHub Personal Access Token
- **How to get**:
  1. Go to https://github.com/settings/tokens
  2. Click "Generate new token (classic)"
  3. Select scopes: `repo`, `gist`, `user`
  4. Generate and copy token
  5. Paste in Tools page
  6. Store safely!

---

### 💻 **LeetCode** - Coding Practice
- **Category**: Practice
- **Use for**: Interview prep, coding problems, practice
- **Credential needed**: LeetCode Username
- **How to get**:
  1. Go to https://leetcode.com
  2. Sign up/login
  3. Just enter your LeetCode username
  4. No secret key needed!

---

## 🔐 Security Tips

### ✅ **DO:**
- Use dedicated API keys (don't use personal keys)
- Set minimal permissions required
- Store keys securely
- Rotate keys periodically
- Use long expiration dates

### ❌ **DON'T:**
- Never share your credentials in messages
- Don't commit credentials to git
- Don't use the same key across services
- Don't post screenshots with credentials visible

---

## ✅ Connection Verification

After connecting a tool, you should see:
- ✅ Tool shows "Connected" status (green)
- 🔗 An "Open" button to go directly to the tool
- ❌ A "Disconnect" button to remove access

---

## 🚀 Using Connected Tools

### From Dashboard
1. Go to Dashboard
2. See list of connected tools
3. Click any tool to be redirected

### From Tools Page
1. Click "🔗 Open" button on connected tool
2. Opens tool in new tab
3. You'll be logged in automatically (if API key configured)

### Smart Recommendations
Get personalized tool recommendations based on your query:
- **Problem**: "I need to make slides" → Recommends Gamma
- **Problem**: "Need UI design help" → Recommends Figma + Canva
- **Problem**: "Interview prep" → Recommends LeetCode
- **Problem**: "Code help" → Recommends GitHub + Lovable

---

## 🐛 Troubleshooting

### **"Invalid API Key" error**
- ❌ Problem: API key is wrong or expired
- ✅ Solution: Generate new key, double-check copy/paste

### **"Connection failed" error**
- ❌ Problem: API key doesn't have proper permissions
- ✅ Solution: Check scope/permissions in tool settings

### **Tool status shows disconnected after refresh**
- ❌ Problem: MongoDB might not be saving
- ✅ Solution: Check MONGO_URI environment variable

### **Can't find credential settings**
- ❌ Problem: Service moved settings location
- ✅ Solution: Google "[Tool name] API key how to get" for latest instructions

---

## 📊 Dashboard Stats

Your Tools page shows:
- **Tools Connected**: Number of connected tools
- **Total Available**: 7 tools available
- **Connected %**: Visual progress (aim for 100%!)

---

## 🎯 Recommended First Connections

**For Learning:**
1. **ChatGPT** - Get explanations on any topic
2. **LeetCode** - Interview prep (username only)
3. **Figma** - Design your projects

**For Development:**
1. **GitHub** - Host your code
2. **Lovable** - Build apps with AI
3. **ChatGPT** - Code generation help

**For Presentations:**
1. **Gamma** - Create presentations
2. **Canva** - Graphics and design
3. **ChatGPT** - Content help

---

## API Key Regeneration

If you ever think your key was compromised:

1. **Go to tool settings** → Regenerate/Create new key
2. **Update in Tools page** → Click Connect again
3. **Old key stops working** immediately

---

## Pro Tips 💡

1. **Multiple tools for one task**: Use ChatGPT for ideas + Figma for design
2. **LeetCode for interview prep**: Username only, free!
3. **GitHub integration**: Version control all your projects
4. **Check expiration dates**: Set reminders to renew API keys
5. **Use recommendations**: Click a tool name to get smart recommendations

---

Still stuck? Check the [AUTH_DEBUGGING_GUIDE.md](AUTH_DEBUGGING_GUIDE.md) for API troubleshooting!
