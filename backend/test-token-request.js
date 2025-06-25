const fetch = require('node-fetch');

async function testToken() {
  const response = await fetch('http://localhost:5001/api/auth/test-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 1, nome: 'Teste', plano: 'premium' })
  });
  const data = await response.json();
  console.log('Resposta do endpoint /api/auth/test-token:', data);
}

testToken(); 