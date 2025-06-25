import React from 'react';
import { useNavigate } from 'react-router-dom';
import BtnSair from '../components/BtnSair';
import { useAuth } from '../contexts/AuthContext';

export default function AmbienteLayout({ titulo, children, cargo }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleBack = () => {
    if (user && user.email === 'admin@admin.com') {
      navigate('/ambiente/geral');
    } else {
      navigate('/assistente');
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">{titulo}</h1>
      <div className="flex flex-col gap-4 w-full max-w-xs mb-8">
        <button
          onClick={handleBack}
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 font-bold"
        >
          Voltar
        </button>
        <button onClick={() => navigate(cargo ? `/apostilas/${cargo}` : '/apostilas')} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold">Apostilas</button>
        <button onClick={() => navigate('/simulados')} className="bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold">Simulados</button>
        <button onClick={() => navigate('/videoaulas')} className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 font-bold">Videoaulas</button>
        <button onClick={() => navigate('/mapas-mentais')} className="bg-pink-500 text-white py-2 rounded hover:bg-pink-600 font-bold">Mapas Mentais</button>
        <BtnSair />
      </div>
      {children}
    </div>
  );
} 