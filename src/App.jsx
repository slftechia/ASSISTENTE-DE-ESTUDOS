import { useState } from 'react';

function App() {
  const [mensagem, setMensagem] = useState('');
  const [resposta, setResposta] = useState('');

  const enviarPergunta = async () => {
    const res = await fetch('http://localhost:5000/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: mensagem }),
    });
    const data = await res.json();
    setResposta(data.response);
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Assistente de Estudos</h1>
      <textarea
        value={mensagem}
        onChange={e => setMensagem(e.target.value)}
        placeholder="Digite sua pergunta..."
        rows={4}
        style={{ width: '100%', marginBottom: 12 }}
      />
      <br />
      <button onClick={enviarPergunta} style={{ padding: '8px 16px', fontSize: 16 }}>Enviar</button>
      <div style={{ marginTop: 24 }}>
        <strong>Resposta:</strong>
        <p>{resposta}</p>
      </div>
    </div>
  );
}

export default App; 