const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  },
  cargo: {
    type: String,
    required: true,
    enum: [
      'supervisor',
      'orientador',
      'administrador',
      'auxiliar',
      'professor_iniciais',
      'professor_artes_cenicas',
      'professor_artes_musica',
      'professor_artes_visuais',
      'professor_artes',
      'professor_ensino_religioso',
      'professor_ciencias',
      'professor_danca',
      'professor_educacao_especial',
      'professor_aux_educacao_especial',
      'professor_educacao_fisica',
      'professor_educacao_infantil',
      'professor_espanhol',
      'professor_geografia',
      'professor_historia',
      'professor_ingles',
      'professor_libras',
      'professor_matematica',
      'professor_portugues',
      'professor_portugues_ingles',
      'professor_aux_ciencias',
      'professor_aux_educacao_infantil',
      'professor_aux_ensino_fundamental',
      'professor_aux_tecnologia',
      'professor_aux_interprete',
      'monitor'
    ]
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  },
  plano: {
    type: String,
    default: 'Free'
  },
  pagamentoStatus: {
    type: String,
    enum: ['ativo', 'pendente', 'cancelado'],
    default: 'pendente'
  }
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
});

// Método para comparar senhas
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.senha);
};

module.exports = mongoose.model('User', userSchema); 