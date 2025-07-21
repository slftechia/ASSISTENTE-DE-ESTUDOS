import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import emoji from 'emoji-dictionary';

const ChatMessages = ({ messages, loading }) => {
  const processarResposta = (texto) => {
    // Substitui emojis por seus códigos
    texto = texto.replace(/:\w+:/g, (match) => {
      const emojiCode = emoji.getUnicode(match);
      return emojiCode || match;
    });

    return texto;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-3" style={{ height: 'calc(100% - 120px)' }}>
      <div className="space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}>
            {msg.tipo !== 'usuario' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 flex-shrink-0">
                <span className="text-white text-sm">🤖</span>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.tipo === 'usuario'
                  ? 'bg-blue-500 text-white'
                  : msg.tipo === 'erro'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-white shadow-sm border border-gray-200'
              }`}
            >
              {msg.tipo === 'assistente' ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="whitespace-pre-wrap break-words" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      code: ({node, ...props}) => <code className="bg-gray-100 px-1 rounded" {...props} />,
                      pre: ({node, ...props}) => <pre className="bg-gray-100 p-2 rounded overflow-x-auto" {...props} />
                    }}
                  >
                    {processarResposta(msg.texto)}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.texto}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 pl-10">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-white text-sm">🤖</span>
            </div>
            <div className="bg-gray-200 rounded-full px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessages; 