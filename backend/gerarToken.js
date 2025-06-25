require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: 1, nome: 'Teste', plano: 'premium' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

console.log(token); 