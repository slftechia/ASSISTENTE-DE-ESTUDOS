import React from 'react';

const ChatModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-[400px] h-[600px] relative animate-fade-in overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ChatModal; 