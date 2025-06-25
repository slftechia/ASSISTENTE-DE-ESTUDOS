const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ChatMessage = require('../models/ChatMessage');

// Função para validar senha com regras de segurança
const validarSenha = (senha) => {
  const erros = [];
  
  // Verificar comprimento mínimo
  if (senha.length < 8) {
    erros.push('A senha deve ter pelo menos 8 caracteres');
  }
  
  // Verificar se contém pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(senha)) {
    erros.push('A senha deve conter pelo menos uma letra maiúscula');
  }
  
  // Verificar se contém pelo menos uma letra minúscula
  if (!/[a-z]/.test(senha)) {
    erros.push('A senha deve conter pelo menos uma letra minúscula');
  }
  
  // Verificar se contém pelo menos um número
  if (!/\d/.test(senha)) {
    erros.push('A senha deve conter pelo menos um número');
  }
  
  // Verificar se contém pelo menos um caractere especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) {
    erros.push('A senha deve conter pelo menos um caractere especial (!@#$%^&*...)');
  }
  
  // Verificar sequências numéricas (123, 321, etc.)
  const sequenciasNumericas = ['123', '321', '456', '654', '789', '987', '012', '210'];
  for (const seq of sequenciasNumericas) {
    if (senha.toLowerCase().includes(seq)) {
      erros.push('A senha não pode conter sequências numéricas (123, 321, etc.)');
      break;
    }
  }
  
  // Verificar sequências de teclado (qwe, asd, etc.)
  const sequenciasTeclado = ['qwe', 'ewq', 'asd', 'dsa', 'zxc', 'cxz', 'tyu', 'uyt', 'ghj', 'jhg', 'bnm', 'mnb'];
  for (const seq of sequenciasTeclado) {
    if (senha.toLowerCase().includes(seq)) {
      erros.push('A senha não pode conter sequências de teclado (qwe, asd, etc.)');
      break;
    }
  }
  
  // Verificar datas comuns (ano atual, anos anteriores)
  const anoAtual = new Date().getFullYear();
  const anosAnteriores = [anoAtual - 1, anoAtual - 2, anoAtual - 3];
  for (const ano of anosAnteriores) {
    if (senha.includes(ano.toString())) {
      erros.push('A senha não pode conter anos (datas de nascimento, etc.)');
      break;
    }
  }
  
  // Verificar senhas comuns
  const senhasComuns = [
    'password', 'senha', '123456', '12345678', 'qwerty', 'abc123', 'password123',
    'admin', 'administrator', 'user', 'usuario', 'test', 'teste', 'guest', 'convidado',
    'welcome', 'bemvindo', 'hello', 'ola', 'hi', 'oi', 'login', 'entrar', 'access',
    'acesso', 'secret', 'secreto', 'private', 'privado', 'public', 'publico'
  ];
  
  if (senhasComuns.includes(senha.toLowerCase())) {
    erros.push('A senha não pode ser uma senha comum');
  }
  
  // Verificar repetição de caracteres (aaa, 111, etc.)
  if (/(.)\1{2,}/.test(senha)) {
    erros.push('A senha não pode conter caracteres repetidos (aaa, 111, etc.)');
  }
  
  return erros;
};

// Gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { nome, email, senha, cargo, plano } = req.body;

    // Validar senha
    const errosSenha = validarSenha(senha);
    if (errosSenha.length > 0) {
      return res.status(400).json({ 
        message: 'Senha não atende aos requisitos de segurança:',
        erros: errosSenha 
      });
    }

    // Verificar se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Criar usuário
    const user = await User.create({
      nome,
      email,
      senha,
      cargo,
      plano: plano || 'Free',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        plano: user.plano,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Autenticar usuário
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar se usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Bloqueio para plano Free após 7 dias
    if (user.plano === 'Free') {
      const dataCriacao = user.dataCriacao || user.createdAt;
      const agora = new Date();
      const diffMs = agora - dataCriacao;
      const diffDias = diffMs / (1000 * 60 * 60 * 24);
      if (diffDias > 7) {
        return res.status(403).json({ message: 'Seu período de teste grátis expirou. Assine um plano para continuar acessando.' });
      }
    }

    // Bloqueio para planos pagos se pagamento pendente ou cancelado
    const isAdmin = user.email === 'admin@admin.com';
    const isTeste = user.email === 'teste@teste.com';
    if (!isAdmin && !isTeste && ['Mensal', 'Semestral', 'Anual'].includes(user.plano) && user.pagamentoStatus !== 'ativo') {
      return res.status(403).json({ message: 'Seu acesso está bloqueado por falta de pagamento. Regularize sua assinatura para continuar.' });
    }

    // Verificar senha
    const isMatch = await user.matchPassword(senha);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    res.json({
      _id: user._id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      plano: user.plano,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Retornar dados do usuário autenticado
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-senha');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Middleware para verificar se é admin
const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || user.email !== 'admin@admin.com') {
    return res.status(403).json({ message: 'Acesso restrito ao administrador.' });
  }
  next();
};

// Listar todos os usuários
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find().select('-senha');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Criar usuário manualmente
const criarUsuarioAdmin = async (req, res) => {
  try {
    const { nome, email, senha, cargo, plano, pagamentoStatus } = req.body;
    
    // Validar senha se fornecida
    if (senha) {
      const errosSenha = validarSenha(senha);
      if (errosSenha.length > 0) {
        return res.status(400).json({ 
          message: 'Senha não atende aos requisitos de segurança:',
          erros: errosSenha 
        });
      }
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }
    const user = await User.create({
      nome,
      email,
      senha,
      cargo,
      plano: plano || 'Free',
      pagamentoStatus: pagamentoStatus || 'ativo',
    });
    res.status(201).json({ _id: user._id, nome: user.nome, email: user.email, cargo: user.cargo, plano: user.plano, pagamentoStatus: user.pagamentoStatus });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Editar usuário
const editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, cargo, plano, pagamentoStatus } = req.body;
    const user = await User.findByIdAndUpdate(id, { nome, email, cargo, plano, pagamentoStatus }, { new: true }).select('-senha');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remover usuário
const removerUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Listar conversas dos usuários (admin)
const listarConversasAdmin = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('Buscando conversas para userId:', userId);
    
    const filtro = userId ? { user: userId } : {};
    console.log('Filtro aplicado:', filtro);
    
    const conversas = await ChatMessage.find(filtro).populate('user', 'nome email cargo').sort({ data: 1 });
    console.log('Conversas encontradas:', conversas.length);
    console.log('Primeira conversa:', conversas[0]);
    
    res.json(conversas);
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  listarUsuarios,
  criarUsuarioAdmin,
  editarUsuario,
  removerUsuario,
  isAdmin,
  listarConversasAdmin,
}; 