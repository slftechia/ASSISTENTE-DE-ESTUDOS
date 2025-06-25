import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PDFViewer from '../components/PDFViewer';
import axios from 'axios';
import BtnSair from '../components/BtnSair';
import BtnEdital from '../components/BtnEdital';
import { useAuth } from '../contexts/AuthContext';

const Simulados = () => {
  const navigate = useNavigate();
  const [simulados, setSimulados] = useState([]);
  const [selectedSimulado, setSelectedSimulado] = useState(null);
  const [temaSelecionado, setTemaSelecionado] = useState(null);
  const [pdfsTema, setPdfsTema] = useState([]);
  const [loadingTema, setLoadingTema] = useState(false);
  const { user } = useAuth();

  const temas = [
    { nome: 'Português', valor: 'portugues', cor: 'from-blue-400 to-blue-600' },
    { nome: 'Conhecimentos Específicos', valor: 'conhecimentos_especificos', cor: 'from-green-400 to-green-600' },
    { nome: 'Temas de Educação', valor: 'temas_educacao', cor: 'from-yellow-400 to-yellow-600' },
    { nome: 'Simulados Completos', valor: 'simulados_completos', cor: 'from-pink-400 to-pink-600' },
  ];

  const buscarPDFsTema = async (tema) => {
    setLoadingTema(true);
    setTemaSelecionado(tema);
    setPdfsTema([]);
    try {
      const res = await axios.get(`/api/simulados/${tema}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      setPdfsTema(res.data);
    } catch (e) {
      setPdfsTema([]);
    }
    setLoadingTema(false);
  };

  const handleVoltarTema = () => {
    setTemaSelecionado(null);
    setPdfsTema([]);
  };

  const handleBack = () => {
    if (selectedSimulado) {
      setSelectedSimulado(null);
    } else {
      if (user && user.email === 'admin@admin.com') {
        navigate('/ambiente/geral');
      } else {
        navigate('/assistente');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-end items-center gap-2 mb-2">
        <button
          onClick={handleBack}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Voltar
        </button>
        {temaSelecionado && (
          <button
            onClick={handleVoltarTema}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Voltar aos Temas
          </button>
        )}
        <BtnEdital />
        <BtnSair />
      </div>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Simulados por Tema</h1>
        {!selectedSimulado ? (
          <div>
            {!temaSelecionado ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {temas.map((tema) => (
                  <button
                    key={tema.valor}
                    className={`bg-gradient-to-br ${tema.cor} shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 font-bold text-white text-lg`}
                    onClick={() => buscarPDFsTema(tema.valor)}
                  >
                    {tema.nome}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">{temas.find(t => t.valor === temaSelecionado)?.nome}</h2>
                {loadingTema ? (
                  <div className="text-center text-gray-600">Carregando PDFs...</div>
                ) : pdfsTema.length === 0 ? (
                  <div className="text-center text-red-600">Nenhum PDF encontrado para este tema.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pdfsTema.map((pdf, idx) => {
                      const isFree = user && user.plano && user.plano.toLowerCase() === 'free';
                      const bloqueado = isFree && idx > 2;
                      return (
                        <div key={pdf.filename || pdf.nome} className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                          <div className="text-4xl mb-2">📝</div>
                          <div className="font-bold text-lg mb-2 text-center break-words whitespace-normal">{pdf.title || pdf.nome}</div>
                          <div className="flex gap-4">
                            <a
                              href={bloqueado ? undefined : pdf.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-4 py-2 rounded font-bold transition ${bloqueado ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                              style={bloqueado ? { pointerEvents: 'none' } : {}}
                            >
                              {bloqueado ? <span>🔒 Visualizar</span> : 'Visualizar'}
                            </a>
                            <a
                              href={bloqueado ? undefined : pdf.path}
                              download={bloqueado ? undefined : (pdf.title || pdf.nome) + '.pdf'}
                              className={`px-4 py-2 rounded font-bold transition ${bloqueado ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                              style={bloqueado ? { pointerEvents: 'none' } : {}}
                            >
                              {bloqueado ? <span>🔒 Baixar</span> : 'Baixar'}
                            </a>
                          </div>
                          {bloqueado && (
                            <div className="mt-2 text-sm text-red-500 font-semibold">Exclusivo para assinantes</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">{selectedSimulado.title}</h2>
            <PDFViewer pdfUrl={selectedSimulado.path} fileName={selectedSimulado.title} />
            <a
              href={selectedSimulado.path}
              download={selectedSimulado.title + '.pdf'}
              className="mt-4 inline-block bg-yellow-600 text-white px-6 py-2 rounded font-bold hover:bg-yellow-700 transition"
            >
              Baixar PDF
            </a>
            <button
              onClick={handleBack}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Simulados; 