import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BtnEdital from '../components/BtnEdital';
import BtnSair from '../components/BtnSair';
import { useAuth } from '../contexts/AuthContext';

const cargoParaPasta = {
  supervisor: 'supervisor_escolar',
  orientador: 'orientador_educacional',
  administrador: 'administrador_escolar',
  monitor: 'monitor_escolar',
  auxiliar: 'auxiliar_de_sala',
  // Adicione outros se necessário
};

export default function DicasEstudo() {
  const { cargo } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const pasta = cargoParaPasta[cargo] || cargo;
  const nomeArquivo = 'dicas.pdf';
  const caminhoPDF = `/pdfs/dicas de estudos/${pasta}/${nomeArquivo}`;
  const caminhoPDFCodificado = encodeURI(caminhoPDF);

  const [existe, setExiste] = React.useState(true);
  React.useEffect(() => {
    fetch(caminhoPDFCodificado, { method: 'HEAD' })
      .then(res => setExiste(res.ok))
      .catch(() => setExiste(false));
  }, [caminhoPDFCodificado]);

  const handleVoltar = () => {
    if (user && user.email === 'admin@admin.com') {
      if (window.history.length > 2) {
        window.history.back();
      } else {
        navigate('/ambiente/geral');
      }
    } else {
      navigate('/assistente');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex justify-end items-center gap-2 mb-2 w-full max-w-2xl">
        <button
          onClick={handleVoltar}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-bold"
        >
          Voltar
        </button>
        <BtnEdital />
        <BtnSair />
      </div>
      <h1 className="text-3xl font-bold mb-8 text-center">Dicas de Estudo</h1>
      {existe ? (
        <a
          href={caminhoPDFCodificado}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-6 py-3 rounded font-bold text-lg hover:bg-green-700"
        >
          Abrir PDF de Dicas de Estudo
        </a>
      ) : (
        <p className="text-red-500 font-bold">PDF de dicas ainda não disponível para este cargo.</p>
      )}
    </div>
  );
} 