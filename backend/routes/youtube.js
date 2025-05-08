const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { searchVideos, getVideoDetails } = require('../controllers/youtubeController');

router.get('/search', protect, searchVideos);
router.get('/video/:id', protect, getVideoDetails);

module.exports = router; 