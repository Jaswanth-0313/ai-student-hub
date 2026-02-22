const ToolConnection = require('../models/ToolConnection');
const toolsList = require('../data/toolsList');
const crypto = require('crypto');

const secret = process.env.CREDENTIAL_SECRET || process.env.JWT_SECRET || 'default_credentials_secret';
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

async function getAllTools(req, res) {
  try {
    // Allow optional auth: if Authorization header present, decode token to get userId
    let userId = req.userId || (req.user && req.user.id);
    const authHeader = req.headers && req.headers.authorization;
    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        userId = decoded.id;
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
    const payload = credential || '';

    const encrypted = encrypt(String(payload));

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
