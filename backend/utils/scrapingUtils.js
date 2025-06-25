const puppeteer = require('puppeteer');
const pdfParse = require('pdf-parse');
const axios = require('axios');

// Scraping de questões da FEPESE
async function buscarQuestoesFepese(tema) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://fepese.org.br/', { waitUntil: 'networkidle2' });
  // Pega links de PDFs de provas ou que contenham 'prova'
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => a.href).filter(href =>
      href.endsWith('.pdf') || href.toLowerCase().includes('prova')
    );
  });
  let questoes = [];
  for (const link of links.slice(0, 3)) {
    try {
      const response = await axios.get(link, { responseType: 'arraybuffer' });
      const data = await pdfParse(response.data);
      // Filtra questões do tema pedido
      const regex = new RegExp(`(quest[aã]o[\s\S]{0,200}${tema})`, 'gi');
      const matches = data.text.match(regex);
      if (matches) questoes.push(...matches);
      if (questoes.length >= 5) break;
    } catch (err) {
      // Ignora erros de download/parse de PDF
      continue;
    }
  }
  await browser.close();
  return questoes.slice(0, 5);
}

// Scraping de questões da IBADE (exemplo, ajustar URL conforme site real)
async function buscarQuestoesIbade(tema) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.ibade.org.br/', { waitUntil: 'networkidle2' });
  // Pega links de PDFs de provas
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => a.href).filter(href => href.endsWith('.pdf'));
  });
  let questoes = [];
  for (const link of links.slice(0, 3)) {
    const response = await axios.get(link, { responseType: 'arraybuffer' });
    const data = await pdfParse(response.data);
    const regex = new RegExp(`(quest[aã]o[\s\S]{0,200}${tema})`, 'gi');
    const matches = data.text.match(regex);
    if (matches) questoes.push(...matches);
    if (questoes.length >= 5) break;
  }
  await browser.close();
  return questoes.slice(0, 5);
}

// Scraping de vídeos de um canal do YouTube
async function buscarVideosCanalYoutube(canal, tema) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`https://www.youtube.com/@${canal}/videos`, { waitUntil: 'networkidle2' });

  // Espera por um componente de vídeo
  await page.waitForSelector('ytd-grid-video-renderer', { timeout: 20000 });

  // Rola a página para baixo para garantir que mais vídeos carreguem
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(2000);

  const videos = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytd-grid-video-renderer')).map(el => {
      const a = el.querySelector('a#video-title');
      return a && a.href
        ? {
            titulo: a.textContent.trim(),
            url: a.href
          }
        : null;
    }).filter(Boolean);
  });

  // Log para depuração
  console.log('Vídeos extraídos:', videos);

  const filtrados = videos.filter(v => v.titulo.toLowerCase().includes(tema.toLowerCase())).slice(0, 5);
  await browser.close();
  return filtrados;
}

module.exports = {
  buscarQuestoesFepese,
  buscarQuestoesIbade,
  buscarVideosCanalYoutube
}; 