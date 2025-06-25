import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BtnSair from '../components/BtnSair';
import { useAuth } from '../contexts/AuthContext';

export default function MapasMentais() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mapas, setMapas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMapas() {
      setLoading(true);
      try {
        const res = await axios.get('/api/mapas-mentais', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
        });
        setMapas(res.data);
      } catch {
        setMapas([]);
      }
      setLoading(false);
    }
    fetchMapas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-end items-center gap-2 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Voltar
        </button>
        <BtnSair />
      </div>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Mapas Mentais</h1>
        {loading ? (
          <div className="text-center text-gray-600">Carregando...</div>
        ) : mapas.length === 0 ? (
          <div className="text-center text-red-600">Nenhum mapa mental encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mapas.map((arquivo, idx) => {
              const isFree = user && user.plano && user.plano.toLowerCase() === 'free';
              const bloqueado = isFree && idx > 0;
              return (
                <div key={idx} className={`relative ${bloqueado ? 'opacity-50' : ''}`}>
                  {arquivo.type === 'image' ? (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <img 
                        src={arquivo.path} 
                        alt={arquivo.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{arquivo.title}</h3>
                        <a
                          href={arquivo.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Visualizar
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <h3 className="text-lg font-semibold mb-2">{arquivo.title}</h3>
                      <a
                        href={arquivo.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Baixar PDF
                      </a>
                    </div>
                  )}
                  {bloqueado && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <span className="text-white font-bold">Conteúdo Premium</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 