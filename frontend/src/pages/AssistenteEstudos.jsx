import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChatModal from '../components/ChatModal';
import ChatAssistente from './ChatAssistente';
import ChatBar from '../components/ChatBar';
import BtnSair from '../components/BtnSair';
import BtnEdital from '../components/BtnEdital';

const AssistenteEstudos = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Função para formatar o cargo para exibição
  const formatarCargo = (cargo) => {
    if (!cargo) return '';
    switch (cargo) {
      case 'supervisor': return 'Supervisor Escolar';
      case 'orientador': return 'Orientador Educacional';
      case 'administrador': return 'Administrador Escolar';
      case 'auxiliar': return 'Auxiliar de Sala';
      case 'professor_iniciais': return 'Professor dos Anos Iniciais';
      case 'professor_infantil': return 'Professor de Educação Infantil';
      case 'monitor': return 'Monitor Escolar';
      default: return cargo;
    }
  };

  const menuItems = [
    {
      title: 'Apostilas',
      description: 'Acesse apostilas organizadas por tema',
      path: user && user.cargo ? `/apostilas/${user.cargo}` : '/apostilas',
      icon: '📚',
      color: 'from-pink-400 to-pink-600'
    },
    {
      title: 'Simulados',
      description: 'Pratique com simulados específicos',
      path: '/simulados',
      icon: '✍️',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      title: 'Videoaulas',
      description: 'Assista aulas selecionadas',
      path: '/videoaulas',
      icon: '🎥',
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: 'Mapas Mentais',
      description: 'Visualize mapas mentais dos principais temas',
      path: '/mapas-mentais',
      icon: '🧠',
      color: 'from-purple-500 to-purple-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 to-purple-800">
      <div className="flex justify-end items-center gap-2 mb-2">
        <BtnEdital />
        <BtnSair />
      </div>
      <nav className="bg-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-3xl font-bold text-white">
              Assistente de Estudos
              {user?.cargo && (
                <span className="ml-2 text-xl font-semibold text-indigo-200">- {formatarCargo(user.cargo)}</span>
              )}
            </h1>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-2 py-4 mb-24">
        <div className="w-full max-w-3xl mx-auto grid grid-cols-2 gap-6 animate-fade-in-up">
          {menuItems.map((item, idx) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative group bg-gradient-to-br ${item.color} shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-300`}
              style={{ minHeight: 200, height: '100%', width: '100%', maxWidth: 340 }}
            >
              <div className="absolute top-4 right-4 opacity-20 text-5xl pointer-events-none group-hover:opacity-40 transition-opacity duration-300">
                {item.icon}
              </div>
              <div className="text-4xl mb-2 z-10">{item.icon}</div>
              <h3 className="text-lg font-bold text-white drop-shadow mb-2 z-10 text-center">
                {item.title}
              </h3>
              <p className="text-base text-white/90 z-10 text-center">
                {item.description}
              </p>
            </button>
          ))}
        </div>

        {/* Barra fixa do chat */}
        <ChatBar onClick={() => setChatOpen(true)} />

        {/* Modal do chat */}
        <ChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)}>
          <ChatAssistente onClose={() => setChatOpen(false)} />
        </ChatModal>
      </main>
    </div>
  );
};

export default AssistenteEstudos; 