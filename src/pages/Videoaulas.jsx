import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BtnEdital from '../components/BtnEdital';
import BtnSair from '../components/BtnSair';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Videoaulas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const fetchVideoaulas = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/videoaulas');
        setCategorias(res.data);
        setErro('');
      } catch (e) {
        setErro('Erro ao carregar videoaulas.');
      }
      setLoading(false);
    };
    fetchVideoaulas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-end items-center gap-2 mb-6">
        <button
          onClick={() => {
            if (user && user.email === 'admin@admin.com') {
              navigate('/ambiente/geral');
            } else {
              navigate('/assistente');
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Voltar
        </button>
        <BtnEdital />
        <BtnSair />
      </div>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Videoaulas</h1>
        {loading && <div className="text-center text-gray-500">Carregando videoaulas...</div>}
        {erro && <div className="text-center text-red-500">{erro}</div>}
        {!loading && !erro && categorias.map((categoria, idx) => (
          <div key={idx} className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2">
              {categoria.categoria}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
              {categoria.videos.map((video, videoIdx) => {
                const isFree = user && user.plano && ['free', 'livre'].includes(user.plano.toLowerCase());
                const bloqueado = isFree && videoIdx > 0;
                return (
                  <div
                    key={videoIdx}
                    className="bg-white rounded-xl shadow p-2 flex flex-col items-center hover:shadow-lg transition-shadow duration-300"
                    style={{ minHeight: 'auto', margin: 0, maxWidth: '180px', fontSize: '0.85rem' }}
                  >
                    <div className="text-xl mb-1">🎥</div>
                    <h3 className="text-xs font-bold text-gray-800 mb-1 text-center break-words whitespace-normal">{video.titulo}</h3>
                    <a
                      href={bloqueado ? undefined : video.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`bg-blue-500 text-white px-2 py-1 rounded font-bold text-xs w-full text-center transition-colors mt-auto ${
                        bloqueado ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'hover:bg-blue-600'
                      }`}
                      style={bloqueado ? { pointerEvents: 'none' } : {}}
                    >
                      {bloqueado ? '🔒 Assistir Aula' : 'Assistir Aula'}
                    </a>
                    {bloqueado && (
                      <div className="mt-1 text-xs text-red-500 font-semibold">Exclusivo para assinantes</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Videoaulas; 