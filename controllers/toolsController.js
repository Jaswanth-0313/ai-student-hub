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
const { exec } = require('child_process');
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
    const { credential } = req.body; // generic field for apiKey/token/username

    // validate tool
    const tool = toolsList.find(t => t.key === toolName);
    if (!tool) return res.status(400).json({ message: 'Invalid tool' });

    // For LeetCode only username required
    const validator = require('validator');
    const payload = credential ? String(credential) : '';
    const sanitizedPayload = validator.escape(payload);

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

module.exports = {
  getAllTools,
  connectTool,
  disconnectTool,
  getConnectedTools,
  getToolDetails
};

// --- Dev-C++ compile endpoint (basic sandboxed runner) ---
// Note: This is a simple implementation using local compiler (g++/gcc).
// For production, run inside containers with strict resource limits.
async function compileDevCPP(req, res) {
  try {
    const userId = req.userId;
    const { source, filename = 'main.cpp', compileArgs = '' } = req.body;
    if (!source) return res.status(400).json({ message: 'Source code required' });

    // create temp directory
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devcpp-'));
    const filePath = path.join(tmpDir, filename);
    fs.writeFileSync(filePath, source);

    const exePath = path.join(tmpDir, 'a.out');

    // If configured to use Docker runner, run inside container
    const useDocker = String(process.env.USE_DOCKER_RUNNER || 'false').toLowerCase() === 'true';
    const dockerImage = process.env.DOCKER_RUNNER_IMAGE || 'ai-student-hub-devcpp';

    if (useDocker) {
      // Ensure tmpDir is accessible to Docker; run container to compile and run
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

    // choose compiler for local execution
    const compiler = filename.endsWith('.c') ? 'gcc' : 'g++';
    const cmd = `${compiler} ${filePath} -o ${exePath} ${compileArgs}`;

    // compile with timeout
    exec(cmd, { timeout: 10000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        // return compile errors
        cleanup();
        return res.status(200).json({ success: false, compileStdout: stdout, compileStderr: stderr || err.message });
      }

      // run the binary with timeout
      exec(exePath, { timeout: 5000, maxBuffer: 1024 * 1024 }, (runErr, runStdout, runStderr) => {
        cleanup();
        if (runErr) {
          return res.status(200).json({ success: false, runStdout, runStderr: runStderr || runErr.message });
        }
        return res.json({ success: true, runStdout, runStderr });
      });
    });

    function cleanup(){
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
    }
  } catch (err) {
    console.error('compileDevCPP error', err);
    return res.status(500).json({ message: err.message });
  }
}

// Export compile function
module.exports.compileDevCPP = compileDevCPP;
