const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, listarUsuarios, criarUsuarioAdmin, editarUsuario, removerUsuario, isAdmin, listarConversasAdmin } = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
require('dotenv').config();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getMe);

// Rotas protegidas do admin (requerem autenticação)
router.get('/admin/usuarios', auth, isAdmin, listarUsuarios);
router.post('/admin/usuarios', auth, isAdmin, criarUsuarioAdmin);
router.put('/admin/usuarios/:id', auth, isAdmin, editarUsuario);
router.delete('/admin/usuarios/:id', auth, isAdmin, removerUsuario);
router.get('/admin/conversas', auth, isAdmin, listarConversasAdmin);

// Rotas públicas do admin (não requerem autenticação)
router.get('/admin/public/usuarios', listarUsuarios);
router.post('/admin/public/usuarios', criarUsuarioAdmin);
router.put('/admin/public/usuarios/:id', editarUsuario);
router.delete('/admin/public/usuarios/:id', removerUsuario);
router.get('/admin/public/conversas', listarConversasAdmin);

// Gera um token JWT para testes
router.post('/test-token', (req, res) => {
    const { userId = 1, nome = 'Teste', plano = 'premium' } = req.body;
    const token = jwt.sign(
        { userId, nome, plano },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    res.json({ token });
});

module.exports = router; 