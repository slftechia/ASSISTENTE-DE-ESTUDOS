import React from 'react';
import ReactDOM from 'react-dom/client';
<<<<<<< HEAD
=======
import { AuthProvider } from './contexts/AuthContext';
>>>>>>> aaafbec43ab72ad9305f0e7e0a1e92687b56a87a
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
<<<<<<< HEAD
    <App />
  </React.StrictMode>
); 
=======
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
>>>>>>> aaafbec43ab72ad9305f0e7e0a1e92687b56a87a
