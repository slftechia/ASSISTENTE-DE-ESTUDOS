import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PDFViewer from '../components/PDFViewer';
import axios from 'axios';
import BtnEdital from '../components/BtnEdital';
import BtnSair from '../components/BtnSair';
import { useAuth } from '../contexts/AuthContext';

const nomesCargos = {
  professor_iniciais: 'Professor de Anos Iniciais',
  professor_artes_cenicas: 'Professor de Artes Cênicas e/ou Teatro',
  professor_artes_musica: 'Professor de Artes/Música',
  professor_artes_visuais: 'Professor de Artes Plásticas e/ou Visuais',
  professor_artes: 'Professor de Artes',
  professor_ensino_religioso: 'Professor de Ensino Religioso',
  professor_ciencias: 'Professor de Ciências',
  professor_danca: 'Professor de Dança',
  professor_educacao_especial: 'Professor de Educação Especial',
  professor_educacao_fisica: 'Professor de Educação Física',
  professor_educacao_infantil: 'Professor de Educação Infantil',
  professor_espanhol: 'Professor de Espanhol',
  professor_geografia: 'Professor de Geografia',
  professor_historia: 'Professor de História',
  professor_ingles: 'Professor de Inglês',
  professor_libras: 'Professor de LIBRAS',
  professor_portugues: 'Professor de Português',
  professor_portugues_ingles: 'Professor de Português e Inglês',
  professor_aux_ciencias: 'Professor Auxiliar de Atividades de Ciências',
  professor_aux_educacao_especial: 'Professor Auxiliar de Educação Especial',
  professor_aux_educacao_infantil: 'Professor Auxiliar de Educação Infantil',
  professor_aux_ensino_fundamental: 'Professor Auxiliar de Ensino Fundamental',
  professor_aux_tecnologia: 'Professor Auxiliar de Tecnologia Educacional',
  professor_aux_interprete: 'Professor Auxiliar Intérprete Educacional',
  administrador: 'Administrador Escolar',
  orientador: 'Orientador Educacional',
  supervisor: 'Supervisor Escolar',
  monitor: 'Monitor Escolar',
  auxiliar: 'Auxiliar de Sala'
};

// Mapeamento de cargos auxiliares para PDF principal
const cargoParaPDF = {
  professor_aux_ciencias: 'professor_ciencias',
  professor_aux_educacao_especial: 'professor_aux_interprete_educacional',
  professor_aux_educacao_infantil: 'professor_educacao_infantil',
  professor_aux_ensino_fundamental: 'professor_iniciais',
  professor_aux_tecnologia: 'professor_aux_tecnologia',
  professor_aux_interprete: 'professor_libras',
  supervisor: 'supervisor_escolar',
  orientador: 'orientador_educacional',
  administrador: 'administrador',
  auxiliar: 'auxiliar',
  monitor: 'monitor_escolar',
  professor_infantil: 'professor_educacao_infantil',
};

const Apostilas = () => {
  const navigate = useNavigate();
  const { cargo } = useParams();
  const [apostilas, setApostilas] = useState([]);
  const [selectedApostila, setSelectedApostila] = useState(null);
  const [temaSelecionado, setTemaSelecionado] = useState(null);
  const [pdfsTema, setPdfsTema] = useState([]);
  const [loadingTema, setLoadingTema] = useState(false);
  const { user } = useAuth();

  const temas = [
    { nome: 'Português', valor: 'Portugues', cor: 'from-blue-400 to-blue-600' },
    { nome: 'Conhecimentos Específicos', valor: 'Conhecimentos_Especificos', cor: 'from-green-400 to-green-600' },
    { nome: 'Temas de Educação', valor: 'Temas_de_Educacao', cor: 'from-yellow-400 to-yellow-600' },
    { nome: 'Apostilas Completas', valor: 'completa', cor: 'from-pink-400 to-pink-600' },
    { nome: 'Mapas Mentais', valor: 'mapas mentais', cor: 'from-purple-400 to-purple-600' },
  ];

  useEffect(() => {
    axios.get('/api/apostilas', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
    })
      .then(res => setApostilas(res.data))
  }, []);

  const handleBack = () => {
    if (selectedApostila) {
      setSelectedApostila(null);
    } else {
      if (user && user.email === 'admin@admin.com') {
        navigate('/ambiente/geral');
      } else {
        navigate('/assistente');
      }
    }
  };

  const buscarPDFsTema = async (tema) => {
    setLoadingTema(true);
    setTemaSelecionado(tema);
    setPdfsTema([]);
    try {
      let res;
      if (tema === 'mapas_mentais') {
        res = await axios.get('/api/mapas-mentais', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
        });
      } else {
        res = await axios.get(`/api/apostilas/${tema}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
        });
      }
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

  const formatarNomeCargo = (cargo) => {
    if (!cargo) return '';
    if (cargo === 'professor_iniciais') return 'Professor';
    const nomesEspeciais = {
      professor_artes: 'Professor de Artes',
      professor_ensino_religioso: 'Professor de Ensino Religioso',
      professor_educacao_especial: 'Professor de Educação Especial',
      professor_aux_educacao_especial: 'Professor Auxiliar de Educação Especial',
    };
    if (nomesEspeciais[cargo]) return nomesEspeciais[cargo];
    return cargo
      .replace(/_/g, ' ')
      .replace(/\b([a-z])/g, l => l.toUpperCase());
  };

  // Determinar o nome do cargo para o botão específico
  let nomeCargo = '';
  if (cargo) {
    nomeCargo = formatarNomeCargo(cargo);
  } else if (user && user.cargo) {
    nomeCargo = formatarNomeCargo(user.cargo);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-end items-center gap-2 mb-2">
        <button
          onClick={handleBack}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Voltar
        </button>
        <BtnEdital />
        <BtnSair />
      </div>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Apostilas por Tema</h1>
        {!selectedApostila ? (
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
                {(cargo || (user && user.cargo)) && (
                  <a
                    href={`/pdfs/apostilas_especificas/${cargoParaPDF[cargo || user.cargo] || cargo || user.cargo}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-br from-red-500 to-red-700 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 font-bold text-white text-lg"
                  >
                    Apostila Específica
                  </a>
                )}
              </div>
            ) : (
              <div>
                <button
                  onClick={handleVoltarTema}
                  className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Voltar aos Temas
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">{temas.find(t => t.valor === temaSelecionado)?.nome}</h2>
                {loadingTema ? (
                  <div className="text-center text-gray-600">Carregando...</div>
                ) : pdfsTema.length === 0 ? (
                  <div className="text-center text-red-600">Nenhum material encontrado para este tema.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pdfsTema.map((arquivo, idx) => {
                      const isFree = user && user.plano && user.plano.toLowerCase() === 'free';
                      const bloqueado = isFree && idx > 2;
                      
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
            )}
            {/* Aqui ficava a listagem dinâmica das apostilas, que pode ser reativada depois */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {apostilas.map((apostila, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedApostila(apostila)}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-pink-300"
                >
                  <div className="text-5xl mb-3">📚</div>
                  <h3 className="text-xl font-bold text-white drop-shadow mb-2 text-center">{apostila.title}</h3>
                  <p className="text-base text-white/90 text-center">{apostila.resumo}</p>
                </button>
              ))}
            </div> */}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">{selectedApostila.title}</h2>
            <PDFViewer pdfUrl={selectedApostila.path} fileName={selectedApostila.title} />
            <a
              href={selectedApostila.path}
              download={selectedApostila.title + '.pdf'}
              className="mt-4 inline-block bg-pink-600 text-white px-6 py-2 rounded font-bold hover:bg-pink-700 transition"
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

export default Apostilas; 