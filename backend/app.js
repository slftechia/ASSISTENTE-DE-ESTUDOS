const express = require('express');
const cors = require('cors');
const pagamentoRoutes = require('./routes/pagamento');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api/pagamento', pagamentoRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

module.exports = app; 