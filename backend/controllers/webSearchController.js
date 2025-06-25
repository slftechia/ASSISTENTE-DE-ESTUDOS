const axios = require('axios');
const cheerio = require('cheerio');

// Função para buscar informações na web
async function searchWeb(query) {
  try {
    if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
      console.error('Chaves de API do Google não configuradas');
      return [];
    }

    // Busca em sites educacionais confiáveis
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: process.env.GOOGLE_API_KEY,
        cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
        q: query,
        num: 5
      }
    });

    if (response.data && response.data.items) {
      return response.data.items.map(item => ({
        title: item.title || '',
        snippet: item.snippet || '',
        url: item.link || '',
        source: item.displayLink || '',
        channelTitle: item.pagemap?.person?.[0]?.name || item.pagemap?.organization?.[0]?.name || ''
      }));
    }
    return [];
  } catch (error) {
    console.error('Erro na busca web:', error.response?.data || error.message);
    return [];
  }
}

// Função para extrair conteúdo de uma página web
async function extractWebContent(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Remove elementos indesejados
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('header').remove();
    $('footer').remove();
    $('iframe').remove();
    
    // Extrai o texto principal
    const mainContent = $('main, article, .content, .main-content, #content, #main-content').text() ||
                       $('body').text();
    
    return mainContent
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000); // Limita o tamanho do texto
  } catch (error) {
    console.error('Erro ao extrair conteúdo:', error);
    return null;
  }
}

// Função para buscar informações educacionais
async function searchEducationalContent(query) {
  try {
    // Adiciona sites educacionais confiáveis à busca
    const searchQuery = `${query} site:gov.br OR site:inep.gov.br OR site:mec.gov.br OR site:bncc.mec.gov.br OR site:educacao.sc.gov.br OR site:pmf.sc.gov.br`;
    
    const results = await searchWeb(searchQuery);
    
    // Extrai conteúdo detalhado dos resultados mais relevantes
    const detailedResults = await Promise.all(
      results.slice(0, 3).map(async (result) => {
        const content = await extractWebContent(result.url);
        return {
          ...result,
          detailedContent: content || result.snippet
        };
      })
    );
    
    return detailedResults;
  } catch (error) {
    console.error('Erro na busca educacional:', error);
    return [];
  }
}

module.exports = {
  searchWeb,
  extractWebContent,
  searchEducationalContent
}; 