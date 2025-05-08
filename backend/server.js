require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Conectar ao MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/youtube', require('./routes/youtube'));
app.use('/api/assistant', require('./routes/assistant'));
app.use('/api/apostilas', require('./routes/apostilas'));
app.use('/api/simulados', require('./routes/simulados'));

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Assistente de Estudos funcionando!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
