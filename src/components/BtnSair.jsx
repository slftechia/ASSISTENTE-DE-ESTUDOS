import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BtnSair = ({ redirectTo = '/' }) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await axios.post('/api/auth/logout');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate(redirectTo);
  };
  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold transition"
    >
      Sair
    </button>
  );
};

export default BtnSair; 