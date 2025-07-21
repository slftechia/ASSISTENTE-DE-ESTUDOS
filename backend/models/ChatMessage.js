const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  texto: { type: String, required: true },
  remetente: { type: String, enum: ['usuario', 'assistente'], required: true },
  data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema); 