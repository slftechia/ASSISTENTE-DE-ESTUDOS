const express = require('express');
const router = express.Router();

// Rota exemplo
router.get('/', (req, res) => res.send('Simulados'));

module.exports = router;
