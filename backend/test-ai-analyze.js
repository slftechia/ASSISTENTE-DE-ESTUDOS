const fetch = require('node-fetch');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5vbWUiOiJUZXN0ZSIsInBsYW5vIjoicHJlbWl1bSIsImlhdCI6MTc0OTU2NTI5MCwiZXhwIjoxNzQ5NjUxNjkwfQ.9UWU5plfJ1iYLCQ-8rnJMiSTZ3nBA47XW_bHtPQ-mk4';

async function testAnalyze() {
  const response = await fetch('http://localhost:5001/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      code: 'function soma(a, b) { return a + b; }',
      context: 'Função simples de soma em JavaScript.'
    })
  });
  const data = await response.json();
  console.log('Resposta do endpoint /api/ai/analyze:', data);
}

testAnalyze(); 