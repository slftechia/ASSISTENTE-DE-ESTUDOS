const axios = require('axios');
const mercadopago = require('mercadopago');
require('dotenv').config();

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN;
console.log('[MP] Token sendo usado:', ACCESS_TOKEN);

const mp = new mercadopago.MercadoPagoConfig({
  accessToken: ACCESS_TOKEN
});

const preference = new mercadopago.Preference(mp);

// Função para criar preferência
async function criarPreferencia(plano) {
  // Retorna o link de assinatura recorrente conforme o plano
  if (plano.nome === 'Mensal') {
    return 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380849788f4e40197a32f1dcf0930';
  } else if (plano.nome === 'Semestral') {
    return 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c938084979341770197a330b6f00579';
  } else if (plano.nome === 'Anual') {
    return 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380849783ce770197a331d2650b93';
  } else {
    throw new Error('Plano não suportado para assinatura recorrente.');
  }
}

// Função para criar assinatura recorrente via API
async function criarAssinaturaRecorrente(plano) {
  let trialAmount, transactionAmount, frequency, reason;

  if (plano.nome === 'Mensal') {
    trialAmount = 47.92;
    transactionAmount = 59.90;
    frequency = 1;
    reason = 'Assinatura Mensal';
  } else if (plano.nome === 'Semestral') {
    trialAmount = 35.69;
    transactionAmount = 54.90;
    frequency = 1;
    reason = 'Assinatura Semestral';
  } else if (plano.nome === 'Anual') {
    trialAmount = 24.95;
    transactionAmount = 49.90;
    frequency = 1;
    reason = 'Assinatura Anual';
  } else {
    throw new Error('Plano inválido');
  }

  const body = {
    reason,
    auto_recurring: {
      frequency,
      frequency_type: "months",
      transaction_amount: transactionAmount,
      currency_id: "BRL",
      trial_period_days: 30, // 1 mês de desconto
      trial_amount: trialAmount
    },
    back_url: "https://seusite.com/obrigado"
  };

  const response = await axios.post(
    'https://api.mercadopago.com/preapproval_plan',
    body,
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
  );

  return response.data.init_point;
}

// Função para criar assinatura personalizada via API de preapproval
async function criarAssinaturaPersonalizada(plano, email) {
  let trialAmount, transactionAmount, reason;

  if (plano.nome === 'Mensal') {
    trialAmount = 47.92;
    transactionAmount = 59.90;
    reason = 'Assinatura Mensal';
  } else if (plano.nome === 'Semestral') {
    trialAmount = 35.69;
    transactionAmount = 54.90;
    reason = 'Assinatura Semestral';
  } else if (plano.nome === 'Anual') {
    trialAmount = 24.95;
    transactionAmount = 49.90;
    reason = 'Assinatura Anual';
  } else {
    throw new Error('Plano inválido');
  }

  const body = {
    reason,
    payer_email: email, // email do usuário
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: transactionAmount,
      currency_id: "BRL",
      trial_period_days: 30, // 1 mês de desconto
      trial_amount: trialAmount
    },
    back_url: "https://seusite.com/obrigado"
  };

  const response = await axios.post(
    'https://api.mercadopago.com/preapproval',
    body,
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
  );

  return response.data.init_point;
}

module.exports = { criarPreferencia, criarAssinaturaRecorrente, criarAssinaturaPersonalizada }; 