const path = require('path');
const fs = require('fs').promises;
const { removeAcentos, removeAcentosLower } = require('./stringUtils');

async function buscarApostilaInteligente(termoBusca, opcoes = {}) {
  const basePath = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'apostilas');
  let resultado = null;
  let temaEncontrado = null;
  let arquivoEncontrado = null;
  let termo = removeAcentosLower(termoBusca.trim());
  let palavras = termo.split(' ').filter(Boolean);
  // 1. Busca na raiz de apostilas (ex: apostila_completa.pdf)
  const arquivosRaiz = await fs.readdir(basePath);
  for (const arquivo of arquivosRaiz) {
    if (!arquivo.endsWith('.pdf')) continue;
    const nomeArquivo = removeAcentosLower(arquivo.replace('.pdf', ''));
    if (
      (termo === 'completa' && nomeArquivo === 'apostila_completa') ||
      nomeArquivo.includes(termo) ||
      termo.includes(nomeArquivo) ||
      palavras.some(palavra => nomeArquivo.includes(palavra))
    ) {
      if (!opcoes.forcarNova) {
        resultado = {
          filename: arquivo,
          title: arquivo.replace('.pdf', '').split('-').join(' '),
          subject: 'Completa',
          path: `/pdfs/apostilas/${arquivo}`
        };
        return resultado;
      }
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
          resultado = {
            filename: arquivo,
            title: arquivo.replace('.pdf', '').split('-').join(' '),
            subject: tema.charAt(0).toUpperCase() + tema.slice(1).split('-').join(' '),
            path: `/pdfs/apostilas/${tema}/${arquivo}`
          };
          temaEncontrado = tema;
          arquivoEncontrado = arquivo;
          break;
        }
      }
      if (resultado) break;
    } catch (err) { /* Pasta pode não ser diretório, ignorar */ }
  }
  return resultado;
}

module.exports = {
  buscarApostilaInteligente
}; 