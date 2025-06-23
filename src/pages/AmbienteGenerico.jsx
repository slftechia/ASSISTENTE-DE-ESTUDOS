import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BtnSair from '../components/BtnSair';
import { useAuth } from '../contexts/AuthContext';

const nomesCargos = {
  professor_iniciais: 'Professor de Anos Iniciais',
  professor_artes_cenicas: 'Professor de Artes Cênicas e/ou Teatro',
  professor_artes_musica: 'Professor de Artes/Música',
  professor_artes_visuais: 'Professor de Artes Plásticas e/ou Visuais',
  professor_ciencias: 'Professor de Ciências',
  professor_danca: 'Professor de Dança',
  professor_educacao_especial: 'Professor de Educação Especial – Sala Multimeios',
  professor_educacao_fisica: 'Professor de Educação Física',
  professor_educacao_infantil: 'Professor de Educação Infantil',
  professor_espanhol: 'Professor de Espanhol',
  professor_geografia: 'Professor de Geografia',
  professor_historia: 'Professor de História',
  professor_ingles: 'Professor de Inglês',
  professor_libras: 'Professor de LIBRAS',
  professor_matematica: 'Professor de Matemática',
  professor_portugues: 'Professor de Português',
  professor_portugues_ingles: 'Professor de Português e Inglês',
  professor_aux_ciencias: 'Professor Auxiliar de Atividades de Ciências',
  professor_aux_educacao_especial: 'Professor Auxiliar de Educação Especial (Profissional de Apoio)',
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

export default function AmbienteGenerico() {
  const { cargo } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const nomeCargo = nomesCargos[cargo] || cargo;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">Ambiente: {nomeCargo}</h1>
      <div className="flex flex-col gap-4 w-full max-w-xs mb-8">
        <button
          onClick={() => {
            if (user && user.email === 'admin@admin.com') {
              navigate('/ambiente/geral');
            } else {
              navigate('/assistente');
            }
          }}
          className="bg-gray-400 text-white py-2 rounded hover:bg-gray-500 font-bold"
        >
          Voltar
        </button>
        <button onClick={() => navigate(cargo ? `/dicas/${cargo}` : '/dicas')} className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 font-bold">Dicas de Estudo</button>
        <button onClick={() => navigate(`/apostilas/${cargo}`)} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold">Apostilas</button>
        <button onClick={() => navigate('/simulados')} className="bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold">Simulados</button>
        <button onClick={() => navigate('/videoaulas')} className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 font-bold">Videoaulas</button>
        <button onClick={() => navigate('/mapas-mentais')} className="bg-pink-500 text-white py-2 rounded hover:bg-pink-600 font-bold">Mapas Mentais</button>
        <BtnSair />
      </div>
      {/* Conteúdo específico do cargo pode ser adicionado aqui futuramente */}
    </div>
  );
} 