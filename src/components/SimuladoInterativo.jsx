import React, { useState } from 'react';

const SimuladoInterativo = ({ questoes }) => {
  if (!questoes || !Array.isArray(questoes) || questoes.length === 0) {
    return <div className="text-red-600 font-bold">Simulado não encontrado ou sem questões.</div>;
  }
  const [respostas, setRespostas] = useState(Array(questoes.length).fill(null));
  const [finalizado, setFinalizado] = useState(false);

  const handleSelecionar = (questaoIdx, alternativaIdx) => {
    if (finalizado) return;
    const novasRespostas = [...respostas];
    novasRespostas[questaoIdx] = alternativaIdx;
    setRespostas(novasRespostas);
  };

  const corrigir = () => {
    setFinalizado(true);
  };

  const acertos = respostas.reduce((acc, resp, idx) =>
    resp === questoes[idx].respostaCorreta ? acc + 1 : acc, 0
  );

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Simulado Interativo</h2>
      {questoes.map((q, idx) => (
        <div key={idx} className="mb-6 p-4 border rounded">
          <div className="font-semibold mb-2">{idx + 1}. {q.pergunta}</div>
          <div className="space-y-2">
            {q.alternativas.map((alt, aIdx) => (
              <label key={aIdx} className={`block p-2 rounded cursor-pointer border ${respostas[idx] === aIdx ? 'bg-blue-100 border-blue-400' : 'border-gray-300'}`}
                style={{ opacity: finalizado && q.respostaCorreta === aIdx ? 1 : 0.8 }}
              >
                <input
                  type="radio"
                  name={`questao_${idx}`}
                  value={aIdx}
                  checked={respostas[idx] === aIdx}
                  onChange={() => handleSelecionar(idx, aIdx)}
                  disabled={finalizado}
                  className="mr-2"
                />
                {alt}
                {finalizado && q.respostaCorreta === aIdx && (
                  <span className="ml-2 text-green-600 font-bold">✔</span>
                )}
                {finalizado && respostas[idx] === aIdx && respostas[idx] !== q.respostaCorreta && (
                  <span className="ml-2 text-red-600 font-bold">✘</span>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
      {!finalizado && (
        <button
          onClick={corrigir}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold"
        >
          Corrigir Simulado
        </button>
      )}
      {finalizado && (
        <div className="mt-6 text-xl font-bold text-center">
          Você acertou {acertos} de {questoes.length} questões!
        </div>
      )}
    </div>
  );
};

export default SimuladoInterativo; 