const express = require('express');
const router = express.Router();
const dicasEstudoRoutes = require('./dicasEstudoRoutes');

router.use('/dicas-estudo', dicasEstudoRoutes);

module.exports = router; 