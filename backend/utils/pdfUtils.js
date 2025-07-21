const path = require('path');
const fs = require('fs').promises;
const puppeteer = require('puppeteer');
const pdfParse = require('pdf-parse');
const { removeAcentos, removeAcentosLower } = require('./stringUtils');

async function criarApostilaPDF(tema, conteudoHTML) {
  const nomeArquivo = `apostila_de_${removeAcentos(tema).toLowerCase().replace(/ /g, '_')}.pdf`;
  const pastaTema = removeAcentos(tema).toLowerCase().replace(/ /g, '_');
  const pastaDestino = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'apostilas', pastaTema);
  await fs.mkdir(pastaDestino, { recursive: true });
  const caminhoPDF = path.join(pastaDestino, nomeArquivo);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(conteudoHTML, { waitUntil: 'networkidle0' });
  await page.pdf({ path: caminhoPDF, format: 'A4', printBackground: true });
  await browser.close();
  return `/pdfs/apostilas/${pastaTema}/${nomeArquivo}`;
}

async function gerarConteudoApostila(tema, openai) {
  const prompt = `Você é um especialista em educação. Gere um conteúdo didático, resumido e organizado para uma apostila sobre o tema "${tema}" voltada para concursos de professores temporários de Florianópolis. Estruture em tópicos, explique de forma clara e inclua exemplos práticos. Não cite fontes externas, apenas explique o conteúdo. Use títulos, subtítulos e listas quando necessário.`;
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: prompt }
    ]
  });
  const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Apostila de ${tema}</title><style>body{font-family:sans-serif;padding:32px;}h1{color:#1e293b;}h2{color:#2563eb;}ul,ol{margin-left:24px;}p{margin:12px 0;}</style></head><body><h1>Apostila de ${tema}</h1>${completion.choices[0].message.content.replace(/\n/g,'<br>')}</body></html>`;
  return html;
}

async function criarNovaApostilaBaseadaEmPDF(tema, openai) {
  const basePath = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'apostilas');
  const caminhoPDF = path.join(basePath, 'apostila_completa.pdf');
  let textoBase = '';
  try {
    const dataBuffer = await fs.readFile(caminhoPDF);
    const data = await pdfParse(dataBuffer);
    textoBase = data.text;
  } catch (err) {
    textoBase = 'Conteúdo não encontrado.';
  }
  const prompt = `Você é um especialista em educação. Reescreva e reorganize o conteúdo abaixo, criando uma nova apostila didática, resumida e com layout diferente, voltada para concursos de professores temporários de Florianópolis. Use títulos, subtítulos, listas e exemplos práticos. Não copie literalmente, mas mantenha os principais tópicos e informações.\n\nCONTEÚDO BASE:\n${textoBase}`;
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: prompt }
    ]
  });
  const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Apostila de ${tema} (Nova Versão)</title><style>body{font-family:sans-serif;padding:32px;}h1{color:#1e293b;}h2{color:#2563eb;}ul,ol{margin-left:24px;}p{margin:12px 0;}</style></head><body><h1>Apostila de ${tema} (Nova Versão)</h1>${completion.choices[0].message.content.replace(/\n/g,'<br>')}</body></html>`;
  const nomeArquivo = `apostila_de_${removeAcentos(tema).toLowerCase().replace(/ /g, '_')}_nova.pdf`;
  const caminhoNovoPDF = path.join(basePath, nomeArquivo);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: caminhoNovoPDF, format: 'A4', printBackground: true });
  await browser.close();
  return `/pdfs/apostilas/${nomeArquivo}`;
}

module.exports = {
  criarApostilaPDF,
  gerarConteudoApostila,
  criarNovaApostilaBaseadaEmPDF
}; 