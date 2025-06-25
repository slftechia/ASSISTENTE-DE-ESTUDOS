const express = require('express');
const router = express.Router();
const { criarAssinaturaPersonalizada } = require('../mercadopago');

router.post('/mercadopago', async (req, res) => {
  console.log('--- [LOG] Requisição recebida em /api/pagamento/mercadopago ---');
  console.log('Body recebido:', req.body);
  try {
    const plano = req.body;
    const email = req.body.email || (req.user && req.user.email) || '';
    if (!plano || !plano.nome || !email) {
      console.error('[LOG] Dados do plano ou email inválidos:', plano, email);
      return res.status(400).json({ error: 'Dados do plano ou email inválidos.' });
    }
    const url = await criarAssinaturaPersonalizada(plano, email);
    console.log('[LOG] URL de assinatura personalizada gerada:', url);
    res.json({ url });
  } catch (error) {
    console.error('[LOG] Erro ao criar assinatura personalizada Mercado Pago:', error);
    if (error.response) {
      console.error('[LOG] Erro response data:', error.response.data);
    }
    res.status(500).json({ error: 'Erro ao criar assinatura personalizada.', details: error.message });
  }
});

// Webhook do Mercado Pago para atualização automática de status de pagamento
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    // Exemplo: body.data.id é o ID do pagamento
    const paymentId = body.data && (body.data.id || body.data.payment_id);
    if (!paymentId) return res.status(400).json({ error: 'ID de pagamento não informado.' });

    // Buscar detalhes do pagamento na API do Mercado Pago
    const mercadopago = require('mercadopago');
    mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });
    const payment = await mercadopago.payment.findById(paymentId);
    const status = payment.body.status;
    const email = payment.body.payer && payment.body.payer.email;

    // Mapear status do Mercado Pago para status interno
    let pagamentoStatus = 'pendente';
    if (status === 'approved') pagamentoStatus = 'ativo';
    else if (status === 'cancelled' || status === 'rejected') pagamentoStatus = 'cancelado';

    // Atualizar usuário
    if (email) {
      const User = require('../models/User');
      await User.findOneAndUpdate({ email }, { pagamentoStatus });
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Erro no webhook do Mercado Pago:', err);
    res.sendStatus(500);
  }
});

module.exports = router; 