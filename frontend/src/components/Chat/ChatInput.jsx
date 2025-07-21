import React from 'react';

const ChatInput = ({ inputRef, inputValue, onInputChange, onSendMessage, disabled }) => {
  return (
    <form onSubmit={onSendMessage} className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-none"
          disabled={disabled}
          ref={inputRef}
        />
        <button
          type="submit"
          disabled={disabled || !inputValue.trim()}
          className={`rounded-full p-2 transition-colors ${
            disabled || !inputValue.trim()
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          aria-label="Enviar mensagem"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default ChatInput; 