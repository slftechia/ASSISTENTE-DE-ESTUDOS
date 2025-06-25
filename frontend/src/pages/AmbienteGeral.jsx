import React from 'react';
import { useNavigate } from 'react-router-dom';
import BtnSair from '../components/BtnSair';

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
  professor_aux_educacao_especial: 'Professor Auxiliar de Educação Especial',
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
  professor_aux_ensino_fundamental: 'Professor Auxiliar de Ensino Fundamental',
  professor_aux_tecnologia: 'Professor Auxiliar de Tecnologia Educacional',
  professor_aux_interprete: 'Professor Auxiliar Intérprete Educacional',
  administrador: 'Administrador Escolar',
  orientador: 'Orientador Educacional',
  supervisor: 'Supervisor Escolar',
  monitor: 'Monitor Escolar',
  auxiliar: 'Auxiliar de Sala'
};

export default function AmbienteGeral() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex justify-end w-full max-w-2xl mt-4 mb-2">
        <BtnSair />
      </div>
      <h1 className="text-3xl font-bold mb-6 text-center">Ambiente Geral - Acesso a Todos os Cargos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
        {Object.entries(nomesCargos).map(([id, nome]) => (
          <button
            key={id}
            onClick={() => navigate(`/ambiente/${id}`)}
            className="bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-bold shadow"
          >
            {nome}
          </button>
        ))}
      </div>
    </div>
  );
} 