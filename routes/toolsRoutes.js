const express = require('express');
const router = express.Router();
const toolsController = require('../controllers/toolsController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', toolsController.getAllTools);
router.get('/details', toolsController.getToolDetails);

// Protected routes (require auth)
router.get('/status', authMiddleware, toolsController.getConnectedTools);
router.get('/connected', authMiddleware, toolsController.getConnectedTools);
router.post('/connect/:toolName', authMiddleware, toolsController.connectTool);
router.delete('/disconnect/:toolName', authMiddleware, toolsController.disconnectTool);

// Dev-C++ compile endpoint
router.post('/devcpp/compile', authMiddleware, toolsController.compileDevCPP);

module.exports = router;
