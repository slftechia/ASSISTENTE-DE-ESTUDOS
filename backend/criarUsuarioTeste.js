require('dotenv').config({ path: __dirname + '/.env' });
const connectDB = require('./config/db');
const User = require('./models/User');

async function criarUsuarioTeste() {
  await connectDB();
  const email = 'teste.anual@teste.com';
  const senha = '123456';
  const nome = 'Usuário Teste Anual';
  const cargo = 'professor_iniciais';
  const plano = 'Anual';

  // Verifica se já existe
  const existente = await User.findOne({ email });
  if (existente) {
    console.log('Usuário de teste já existe:', existente.email);
    return;
  }

  const user = new User({ nome, email, senha, cargo, plano });
  await user.save();
  console.log('Usuário de teste criado com sucesso:', email);
}

async function criarUsuarioAdmin() {
  await connectDB();
  const email = 'admin@admin.com';
  const senha = 'admin123';
  const nome = 'Administrador Geral';
  const cargo = 'administrador';
  const plano = 'Anual';
  const pagamentoStatus = 'ativo';

  // Verifica se já existe
  let user = await User.findOne({ email });
  if (user) {
    user.nome = nome;
    user.senha = senha;
    user.cargo = cargo;
    user.plano = plano;
    user.pagamentoStatus = pagamentoStatus;
    user.dataCriacao = new Date();
    await user.save();
    console.log('Usuário admin atualizado com sucesso:', email);
    process.exit(0);
  }

  user = new User({ nome, email, senha, cargo, plano, pagamentoStatus, dataCriacao: new Date() });
  await user.save();
  console.log('Usuário admin criado com sucesso:', email);
  process.exit(0);
}

async function corrigirStatusUsuarios() {
  await connectDB();
  // Atualiza todos para pendente, exceto admin e teste
  await User.updateMany(
    { email: { $nin: ['admin@admin.com', 'teste@teste.com'] } },
    { $set: { pagamentoStatus: 'pendente' } }
  );
  // Garante admin e teste como ativo
  await User.updateMany(
    { email: { $in: ['admin@admin.com', 'teste@teste.com'] } },
    { $set: { pagamentoStatus: 'ativo' } }
  );
  console.log('Status de pagamento corrigido para todos os usuários.');
  process.exit(0);
}

async function bloquearGabimartins() {
  await connectDB();
  await User.updateOne(
    { email: 'gabimartins55@gmail.com' },
    { $set: { pagamentoStatus: 'pendente' } }
  );
  console.log('Usuário gabimartins55@gmail.com bloqueado (pagamento pendente).');
  process.exit(0);
}

async function removerGabimartins() {
  await connectDB();
  await User.deleteOne({ email: 'gabimartins55@gmail.com' });
  console.log('Usuário gabimartins55@gmail.com removido do banco de dados.');
  process.exit(0);
}

if (require.main === module) {
  criarUsuarioTeste();
  criarUsuarioAdmin();
  corrigirStatusUsuarios();
  bloquearGabimartins();
  removerGabimartins();
} 