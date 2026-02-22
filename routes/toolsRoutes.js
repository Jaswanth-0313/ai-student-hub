const express = require('express');
const router = express.Router();
const toolsController = require('../controllers/toolsController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require auth
router.use(authMiddleware);

router.get('/', toolsController.getAllTools);
router.get('/status', toolsController.getConnectedTools);
router.get('/connected', toolsController.getConnectedTools);
router.get('/details', toolsController.getToolDetails);
router.post('/connect/:toolName', toolsController.connectTool);
router.delete('/disconnect/:toolName', toolsController.disconnectTool);

module.exports = router;
