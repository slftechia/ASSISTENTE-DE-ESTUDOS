import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatHeader = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-blue-500 flex-shrink-0 px-4 py-3 flex items-center gap-3">
      <button
        onClick={() => {
          navigate('/assistente');
          onClose();
        }}
        className="text-white hover:bg-blue-600 rounded-full p-1 transition-colors"
        aria-label="Voltar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 className="text-lg font-semibold text-white">Chatbot Assistente</h1>
    </nav>
  );
};

export default ChatHeader; 