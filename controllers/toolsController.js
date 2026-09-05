const ToolConnection = require('../models/ToolConnection');
const toolsList = require('../data/toolsList');
const crypto = require('crypto');

const secret = process.env.CREDENTIAL_SECRET || process.env.JWT_SECRET;
const key = crypto.createHash('sha256').update(secret).digest();

function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt is available for internal use only (not exposed)
function decrypt(data) {
  if (!data) return '';
  const [ivHex, encrypted] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Get all tools merged with connection status for current user
const jwt = require('jsonwebtoken');
const { exec, execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function getAllTools(req, res) {
  try {
    // Allow optional auth: if Authorization header present, decode token to get userId
    let userId = req.userId || (req.user && req.user.id);
    const authHeader = req.headers && req.headers.authorization;
    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        if (process.env.JWT_SECRET) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id;
        } else {
          userId = null;
        }
      } catch (e) {
        // ignore token errors — treat as unauthenticated
        userId = null;
      }
    }

    const connections = userId ? await ToolConnection.find({ userId }) : [];
    const connMap = {};
    connections.forEach(c => { connMap[c.toolName] = c; });

    const merged = toolsList.map(t => ({
      name: t.name,
      key: t.key,
      logo: t.logo,
      description: t.description,
      connected: !!(connMap[t.key] && connMap[t.key].connected),
      connectedAt: connMap[t.key] ? connMap[t.key].connectedAt : null
    }));

    return res.json({ tools: merged });
  } catch (err) {
    console.error('getAllTools error', err);
    return res.status(500).json({ message: err.message });
  }
}

// Get only connected tools
async function getConnectedTools(req, res) {
  try {
    const userId = req.userId || (req.user && req.user.id);
    const connections = await ToolConnection.find({ userId, connected: true });
    const keys = connections.map(c => c.toolName);
    return res.json({ connected: keys });
  } catch (err) {
    console.error('getConnectedTools error', err);
    return res.status(500).json({ message: err.message });
  }
}

// Connect or update a tool for user
async function connectTool(req, res) {
  try {
    const userId = req.userId || (req.user && req.user.id);
    const toolName = req.params.toolName;
    const { credentials, credential } = req.body; // support both old and new format

    // validate tool
    const tool = toolsList.find(t => t.key === toolName);
    if (!tool) return res.status(400).json({ message: 'Invalid tool' });

    // Define which tools require credentials
    const toolsWithCredentials = {
      chatgpt: { requiresCredential: true, label: 'API Key' },
      lovable: { requiresCredential: true, label: 'Token' },
      gamma: { requiresCredential: false, label: null },
      figma: { requiresCredential: true, label: 'Token' },
      canva: { requiresCredential: true, label: 'Token' },
      github: { requiresCredential: true, label: 'Token' },
      leetcode: { requiresCredential: true, label: 'Username' },
      notion: { requiresCredential: true, label: 'API Key' },
      notebooklm: { requiresCredential: false, label: null },
      devcpp: { requiresCredential: false, label: null },
      gmail: { requiresCredential: false, label: null }
    };

    const toolConfig = toolsWithCredentials[toolName];
    
    // Validate credential requirement
    const credentialData = credentials || (credential ? { apiKey: credential } : {});
    if (toolConfig && toolConfig.requiresCredential) {
      const primaryField = toolName === 'chatgpt' ? 'apiKey' : toolName === 'figma' ? 'token' : 'apiKey';
      if (!credentialData[primaryField] || credentialData[primaryField].toString().trim() === '') {
        return res.status(400).json({ 
          message: `${toolName} requires a ${toolConfig.label}. Please provide a valid credential.` 
        });
      }
    }

    // For tools that require credentials, ensure something is provided
    const validator = require('validator');
    const credentialToStore = JSON.stringify(credentialData); // Store as JSON string
    
    // Don't allow empty credentials for tools that require them
    if (toolConfig && toolConfig.requiresCredential && (!credentialData || Object.keys(credentialData).length === 0)) {
      return res.status(400).json({ 
        message: `${toolName} credentials cannot be empty.`
      });
    }

    const sanitizedPayload = validator.escape(credentialToStore);
    const encrypted = encrypt(String(sanitizedPayload));

    const update = {
      userId,
      toolName,
      credentials: encrypted,
      connected: true,
      connectedAt: new Date()
    };

    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
    await ToolConnection.findOneAndUpdate({ userId, toolName }, update, opts);

    return res.json({ message: `${toolName} connected successfully` });
  } catch (err) {
    console.error('connectTool error', err);
    return res.status(500).json({ message: err.message });
  }
}

// Disconnect tool (remove connection)
async function disconnectTool(req, res) {
  try {
    const userId = req.userId || (req.user && req.user.id);
    const toolName = req.params.toolName;

    const tool = toolsList.find(t => t.key === toolName);
    if (!tool) return res.status(400).json({ message: 'Invalid tool' });

    await ToolConnection.findOneAndDelete({ userId, toolName });
    return res.json({ message: `${toolName} disconnected successfully` });
  } catch (err) {
    console.error('disconnectTool error', err);
    return res.status(500).json({ message: err.message });
  }
}

// Return detailed tool metadata (features, howTo, use cases) for learning pages
async function getToolDetails(req, res) {
  try {
    const list = toolsList.map(t => ({
      name: t.name,
      key: t.key,
      logo: t.logo,
      description: t.description,
      features: t.features || [],
      useCases: t.useCases || [],
      howTo: t.howTo || '',
      website: t.website || ''
    }));
    return res.json({ tools: list });
  } catch (err) {
    console.error('getToolDetails error', err);
    return res.status(500).json({ message: err.message });
  }
}

// Execute API for connected tool
async function executeToolAPI(req, res) {
  try {
    const userId = req.userId || (req.user && req.user.id);
    const toolName = req.params.toolName;
    const { params } = req.body;

    // Simple rate limiting (in production, use Redis or similar)
    const rateLimitKey = `api_${userId}_${toolName}`;
    const now = Date.now();
    if (!global.rateLimits) global.rateLimits = {};
    if (global.rateLimits[rateLimitKey] && now - global.rateLimits[rateLimitKey] < 60000) { // 1 min
      return res.status(429).json({ message: 'Rate limit exceeded. Please wait before making another request.' });
    }
    global.rateLimits[rateLimitKey] = now;

    // Check if tool is connected
    const connection = await ToolConnection.findOne({ userId, toolName, connected: true });
    if (!connection) {
      return res.status(400).json({ message: 'Tool not connected' });
    }

    // Decrypt credentials
    const decryptedCredentials = JSON.parse(decrypt(connection.credentials));

    let result;
    try {
      switch (toolName) {
        case 'chatgpt':
          result = await executeChatGPT(decryptedCredentials, params);
          break;
        case 'figma':
          result = await executeFigma(decryptedCredentials, params);
          break;
        default:
          return res.status(400).json({ message: 'API execution not supported for this tool' });
      }
    } catch (apiErr) {
      console.error(`API execution error for ${toolName}:`, apiErr.message);
      return res.status(400).json({ message: `API request failed: ${apiErr.message}` });
    }

    return res.json(result);
  } catch (err) {
    console.error('executeToolAPI error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// ChatGPT API execution
async function executeChatGPT(credentials, params) {
  const { apiKey, endpoint = 'https://api.openai.com/v1' } = credentials;
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: params.prompt || 'Hello' }],
      max_tokens: 100
    })
  });

  if (!response.ok) {
    throw new Error(`ChatGPT API error: ${response.status}`);
  }

  return await response.json();
}

// Figma API execution
async function executeFigma(credentials, params) {
  const { token } = credentials;
  const response = await fetch(`https://api.figma.com/v1/files/${params.fileId || '0'}`, {
    headers: {
      'X-Figma-Token': token
    }
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status}`);
  }

  return await response.json();
}

module.exports = {
  getAllTools,
  connectTool,
  disconnectTool,
  getConnectedTools,
  getToolDetails,
  executeToolAPI
};

// --- Dev-C++ compile endpoint (basic sandboxed runner) ---
// Note: This is a simple implementation using local compiler (g++/gcc).
// For production, run inside containers with strict resource limits.
function resolveCompilerExecutable(filename) {
  const compilerName = filename.endsWith('.c') ? 'gcc' : 'g++';
  const candidateNames = process.platform === 'win32'
    ? [`${compilerName}.exe`, compilerName]
    : [compilerName];

  const extraPaths = [];
  if (process.env.PATH) {
    extraPaths.push(...process.env.PATH.split(path.delimiter).filter(Boolean));
  }

  if (process.platform === 'win32') {
    extraPaths.push(
      'C:\\msys64\\mingw64\\bin',
      'C:\\msys64\\usr\\bin',
      'C:\\mingw64\\bin',
      'C:\\MinGW\\bin'
    );
  }

  for (const dir of extraPaths) {
    for (const candidate of candidateNames) {
      const resolved = path.join(dir, candidate);
      if (fs.existsSync(resolved)) return resolved;
    }
  }

  if (process.platform === 'win32') {
    const explicitPaths = [
      'C:\\msys64\\mingw64\\bin\\g++.exe',
      'C:\\msys64\\mingw64\\bin\\gcc.exe',
      'C:\\mingw64\\bin\\g++.exe',
      'C:\\MinGW\\bin\\g++.exe'
    ];
    for (const p of explicitPaths) {
      if (fs.existsSync(p)) return p;
    }
  }

  return compilerName;
}

async function compileDevCPP(req, res) {
  try {
    const userId = req.userId;
    const { source, filename = 'main.cpp', compileArgs = '' } = req.body;
    if (!source) return res.status(400).json({ message: 'Source code required' });

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devcpp-'));
    const filePath = path.join(tmpDir, filename);
    fs.writeFileSync(filePath, source);

    const exePath = path.join(tmpDir, 'a.out');
    const useDocker = String(process.env.USE_DOCKER_RUNNER || 'false').toLowerCase() === 'true';
    const dockerImage = process.env.DOCKER_RUNNER_IMAGE || 'ai-student-hub-devcpp';

    function cleanup() {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
    }

    if (useDocker) {
      const dockerCmd = `docker run --rm -v ${tmpDir}:/work ${dockerImage} /work/${path.basename(filePath)} /work/${path.basename(exePath)}`;
      exec(dockerCmd, { timeout: 20000, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
        if (err) {
          return res.status(200).json({ success: false, output: stdout, error: stderr || err.message });
        }
        return res.json({ success: true, output: stdout, error: stderr });
      });
      return;
    }

    const compiler = resolveCompilerExecutable(filename);
    const compilerAvailable = fs.existsSync(compiler) || await new Promise((resolve) => {
      const testCmd = process.platform === 'win32' ? `where "${compiler}"` : `command -v "${compiler}"`;
      exec(testCmd, { timeout: 5000 }, (error) => resolve(!error));
    });

    if (!compilerAvailable) {
      cleanup();
      return res.status(200).json({
        success: false,
        compileStdout: '',
        compileStderr: `${compiler} is not installed on this server. Install a C/C++ compiler or enable USE_DOCKER_RUNNER=true for the containerized runner.`
      });
    }

    const extraArgs = String(compileArgs || '')
      .split(/\s+/)
      .filter(Boolean);

    execFile(compiler, [...extraArgs, filePath, '-o', exePath], { timeout: 10000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        cleanup();
        return res.status(200).json({ success: false, compileStdout: stdout, compileStderr: stderr || err.message });
      }

      execFile(exePath, [], { timeout: 5000, maxBuffer: 1024 * 1024 }, (runErr, runStdout, runStderr) => {
        cleanup();
        if (runErr) {
          return res.status(200).json({ success: false, runStdout, runStderr: runStderr || runErr.message });
        }
        return res.json({ success: true, runStdout, runStderr });
      });
    });
  } catch (err) {
    console.error('compileDevCPP error', err);
    return res.status(500).json({ message: err.message });
  }
}

// Export compile function
module.exports.compileDevCPP = compileDevCPP;
