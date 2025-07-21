const express = require('express');
const router = express.Router();
const dicasEstudoController = require('../controllers/dicasEstudoController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, dicasEstudoController.getDicasEstudo);
router.get('/:id', protect, dicasEstudoController.getDicaEstudo);

module.exports = router; 