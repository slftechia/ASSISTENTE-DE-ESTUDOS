<<<<<<< HEAD
import React from 'react';
import { useNavigate } from 'react-router-dom';

function MenuPage() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
      <h2>Menu Principal</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
        <button onClick={() => navigate('/apostilas')}>Apostilas por tema</button>
        <button onClick={() => navigate('/simulados')}>Simulados por tema</button>
        <button onClick={() => navigate('/dicas')}>Dicas de estudo</button>
        <button onClick={() => navigate('/comunidade')}>Comunidade de estudo</button>
        <button onClick={() => navigate('/')}>Sair</button>
      </div>
    </div>
  );
}

export default MenuPage; 
=======
 
>>>>>>> aaafbec43ab72ad9305f0e7e0a1e92687b56a87a
