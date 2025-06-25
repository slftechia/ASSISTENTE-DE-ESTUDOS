import React from 'react';

const ChatBar = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 text-lg font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-300 z-50 focus:outline-none focus:ring-4 focus:ring-indigo-300"
    style={{ minWidth: 280 }}
    title="Clique para conversar com o assistente"
  >
    <span className="text-2xl">🤖</span>
    <span>Dica: Clique aqui para conversar com o assistente!</span>
  </button>
);

export default ChatBar; 