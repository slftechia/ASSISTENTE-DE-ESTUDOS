import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Assistant = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studyPlan, setStudyPlan] = useState(null);
  const [topic, setTopic] = useState('');
  const [availableTime, setAvailableTime] = useState('');
  const { token } = useAuth();

  const handleChat = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        '/api/assistant/chat',
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setChatHistory([
        ...chatHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: response.data.response }
      ]);
      setMessage('');
    } catch (err) {
      setError('Erro ao enviar mensagem. Tente novamente.');
      console.error('Erro no chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudyPlan = async (e) => {
    e.preventDefault();
    if (!topic.trim() || !availableTime.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        '/api/assistant/study-plan',
        { topic, availableTime },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStudyPlan(response.data.plan);
    } catch (err) {
      setError('Erro ao gerar plano de estudos. Tente novamente.');
      console.error('Erro no plano de estudos:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Chat Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Chat com o Assistente</h2>
        
        <div className="h-96 overflow-y-auto mb-4 space-y-4">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-indigo-100 ml-12'
                  : 'bg-gray-100 mr-12'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleChat} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </div>

      {/* Study Plan Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Gerar Plano de Estudos</h2>
        
        <form onSubmit={handleStudyPlan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tópico
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Matemática Básica"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tempo Disponível
            </label>
            <input
              type="text"
              value={availableTime}
              onChange={(e) => setAvailableTime(e.target.value)}
              placeholder="Ex: 2 horas por dia"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Gerar Plano
          </button>
        </form>

        {studyPlan && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Plano de Estudos Gerado:</h3>
            <div className="prose prose-sm">
              {studyPlan.split('\n').map((line, index) => (
                <p key={index} className="mb-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="col-span-2 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default Assistant; 