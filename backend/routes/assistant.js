const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { chatWithAssistant, generateStudyPlan } = require('../controllers/openaiController');

router.post('/chat', chatWithAssistant);
router.post('/study-plan', protect, generateStudyPlan);

module.exports = router; 