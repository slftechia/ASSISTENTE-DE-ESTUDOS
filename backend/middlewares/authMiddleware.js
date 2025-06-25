const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obter token do header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obter usuário do token
      req.user = decoded;

      next();
    } catch (error) {
      res.status(401).json({ message: 'Não autorizado' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, token não fornecido' });
  }
};

module.exports = { protect }; 