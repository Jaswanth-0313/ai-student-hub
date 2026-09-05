const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const controller = require('../controllers/studyController');

const router = express.Router();
router.use(authMiddleware);
router.post('/extract', controller.extract);
router.post('/summarize', controller.summarize);
router.post('/questions', controller.questions);
router.post('/explain', controller.explain);
router.post('/plan', controller.plan);
router.post('/quiz/evaluate', controller.evaluateQuiz);

module.exports = router;
