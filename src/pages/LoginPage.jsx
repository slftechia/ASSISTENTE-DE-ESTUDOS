import React from 'react';

function LoginPage() {
  return (
    <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center' }}>
      <h2>Login</h2>
      <input type="text" placeholder="Usuário" style={{ width: '100%', margin: '8px 0', padding: 8 }} />
      <input type="password" placeholder="Senha" style={{ width: '100%', margin: '8px 0', padding: 8 }} />
      <button style={{ width: '100%', padding: 10, marginTop: 16 }}>Entrar</button>
    </div>
  );
}

export default LoginPage; 