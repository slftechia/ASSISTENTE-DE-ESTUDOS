import React from 'react';

const SuggestedQuestions = ({ questions, onQuestionClick }) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="text-xs text-gray-500 mb-1">Sugestões de perguntas:</p>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs transition-colors border border-gray-200 shadow-sm"
            style={{ flex: '0 0 auto' }}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions; 