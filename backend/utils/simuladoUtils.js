const path = require('path');
const fs = require('fs').promises;
const { removeAcentosLower } = require('./stringUtils');
const { simuladosEnviadosUsuario } = require('./state');

// Função para busca inteligente de simulados SEM REPETIÇÃO
async function buscarSimuladoAleatorioSemRepetir(temaBusca, chaveUsuario) {
  const basePath = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'simulados');
  let termo = removeAcentosLower(temaBusca.trim());
  let palavras = termo.split(' ').filter(Boolean);
  let simuladosDisponiveis = [];
  // 1. Busca na raiz
  const arquivosRaiz = await fs.readdir(basePath);
  for (const arquivo of arquivosRaiz) {
    if (!arquivo.endsWith('.pdf')) continue;
    const nomeArquivo = removeAcentosLower(arquivo.replace('.pdf', ''));
    if (
      nomeArquivo.includes(termo) ||
      termo.includes(nomeArquivo) ||
      palavras.some(palavra => nomeArquivo.includes(palavra))
    ) {
      simuladosDisponiveis.push({
        filename: arquivo,
        title: arquivo.replace('.pdf', '').split('-').join(' '),
        subject: 'Completo',
        path: `/pdfs/simulados/${arquivo}`
      });
    }
  }
  // 2. Busca nas subpastas
  const temas = await fs.readdir(basePath);
  for (const tema of temas) {
    const temaPath = path.join(basePath, tema);
    try {
      const arquivos = await fs.readdir(temaPath);
      const nomeTema = removeAcentosLower(tema);
      for (const arquivo of arquivos) {
        if (!arquivo.endsWith('.pdf')) continue;
        const nomeArquivo = removeAcentosLower(arquivo.replace('.pdf', ''));
        if (
          nomeArquivo.includes(termo) ||
          nomeTema.includes(termo) ||
          termo.includes(nomeArquivo) ||
          termo.includes(nomeTema) ||
          palavras.some(palavra => nomeArquivo.includes(palavra) || nomeTema.includes(palavra))
        ) {
          simuladosDisponiveis.push({
            filename: arquivo,
            title: arquivo.replace('.pdf', '').split('-').join(' '),
            subject: tema.charAt(0).toUpperCase() + tema.slice(1).split('-').join(' '),
            path: `/pdfs/simulados/${tema}/${arquivo}`
          });
        }
      }
    } catch (err) { /* Pasta pode não ser diretório, ignorar */ }
  }
  // Filtrar os já enviados
  const chave = chaveUsuario+termo;
  if (!simuladosEnviadosUsuario[chave]) simuladosEnviadosUsuario[chave] = [];
  const enviados = simuladosEnviadosUsuario[chave];
  const naoEnviados = simuladosDisponiveis.filter(s => !enviados.includes(s.path));
  if (naoEnviados.length === 0) return null;
  // Escolher aleatório
  const escolhido = naoEnviados[Math.floor(Math.random() * naoEnviados.length)];
  simuladosEnviadosUsuario[chave].push(escolhido.path);
  return escolhido;
}

module.exports = {
  buscarSimuladoAleatorioSemRepetir
}; 