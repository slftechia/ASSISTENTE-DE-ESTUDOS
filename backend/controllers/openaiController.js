const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Função utilitária para detectar pedido de videoaula
function isVideoaulaRequest(message) {
  const keywords = [
    'videoaula', 'vídeo aula', 'vídeo', 'aula em vídeo', 'video aula', 'video aulas', 'vídeo aulas',
    'assistir vídeo', 'assistir video', 'ver vídeo', 'ver video', 'me mostre um vídeo', 'me mostre uma videoaula',
    'link de vídeo', 'link de video', 'link de videoaula', 'link de vídeo aula', 'quero um vídeo', 'quero uma videoaula',
    'sugira um vídeo', 'sugira uma videoaula', 'indique um vídeo', 'indique uma videoaula', 'tem vídeo', 'tem video',
    'tem videoaula', 'tem vídeo aula', 'tem aula em vídeo', 'tem aula em video'
  ];
  return keywords.some(k => message.toLowerCase().includes(k));
}

// Função para buscar videoaulas na base fixa
async function getFixedVideosByTema(tema) {
  const filePath = path.join(__dirname, '../data/videoaulas.json');
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const videoaulas = JSON.parse(data);
    // Busca por tema exato ou aproximação
    const temas = Object.keys(videoaulas);
    const removeAcentosLower = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const termo = removeAcentosLower(tema.trim());
    const palavras = termo.split(' ').filter(Boolean);
    let found = temas.find(t => removeAcentosLower(t).includes(termo));
    if (!found) found = temas.find(t => termo.includes(removeAcentosLower(t)));
    if (!found) found = temas.find(t => palavras.some(palavra => removeAcentosLower(t).includes(palavra)));
    if (found) {
      return videoaulas[found].slice(0, 3);
    }
    return [];
  } catch {
    return [];
  }
}

// Função para buscar videoaulas no YouTube
async function getYoutubeVideos(tema) {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: 'snippet',
          maxResults: 10,
          q: `${tema} videoaula`,
          type: 'video',
          key: process.env.YOUTUBE_API_KEY,
          relevanceLanguage: 'pt',
          regionCode: 'BR',
          channelId: canaisPrioritarios.map(canal => canal.id).join('|')
        }
      }
    );

    // Filtra os resultados para pegar 5 vídeos de canais diferentes
    const videos = response.data.items;
    const canaisUsados = new Set();
    const resultadosFiltrados = [];

    for (const video of videos) {
      if (!canaisUsados.has(video.snippet.channelTitle) && resultadosFiltrados.length < 5) {
        canaisUsados.add(video.snippet.channelTitle);
        resultadosFiltrados.push({
          titulo: video.snippet.title,
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          canal: video.snippet.channelTitle
        });
      }
    }

    return resultadosFiltrados;
  } catch (error) {
    console.error('Erro ao buscar vídeos no YouTube:', error);
    return [];
  }
}

// Função para buscar vídeos do YouTube com paginação e quantidade customizável
async function getYoutubeVideosRaw(tema, pageToken = null, maxResults = 5) {
  try {
    const params = {
      part: 'snippet',
      maxResults,
      q: tema,
      type: 'video',
      key: process.env.YOUTUBE_API_KEY,
      relevanceLanguage: 'pt',
      regionCode: 'BR'
    };
    if (pageToken) params.pageToken = pageToken;
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      { params }
    );
    return response.data;
  } catch {
    return null;
  }
}

// @desc    Gerar resposta do assistente virtual
// @route   POST /api/assistant/chat
// @access  Private
const chatWithAssistant = async (req, res) => {
  try {
    const { message, history } = req.body;
    const { user } = req;

    // Se for pedido de videoaula, encaminhar para o painel
    if (isVideoaulaRequest(message)) {
      return res.json({
        response: 'Ótima escolha! Para acessar videoaulas, clique no botão "Video Aulas" no painel do Assistente de Estudos. Lá você encontrará diversos vídeos organizados por tema para escolher e acessar os links diretamente.'
      });
    }

    // Prompt do sistema com suporte a markdown
    const systemPrompt = {
      role: 'system',
      content: `Você é um assistente de estudos especializado em concursos da Prefeitura de Florianópolis, com foco nas bancas Fepese e IBAD. Você é um professor experiente, didático e motivador, com profundo conhecimento sobre:

1. Legislação Educacional:
- LDB (Lei de Diretrizes e Bases da Educação)
- BNCC (Base Nacional Comum Curricular)
- PEA (Proposta Educacional de Aprendizagem)
- EJA (Educação de Jovens e Adultos)
- Diretrizes Curriculares Nacionais
- Estatuto da Criança e do Adolescente (ECA)

2. Conhecimentos Específicos:
- Metodologias de ensino
- Avaliação da aprendizagem
- Planejamento pedagógico
- Gestão escolar
- Inclusão e diversidade
- Tecnologias educacionais

3. Editais e Provas:
- Análise detalhada do edital atual
- Provas anteriores da Fepese e IBAD
- Padrões de questões
- Temas mais recorrentes
- Estrutura das provas

4. Dicas de Estudo:
- Técnicas de memorização
- Gestão do tempo
- Resolução de questões
- Simulados e exercícios
- Material didático

Regras de Interação:
- Seja sempre acolhedor e use o nome do usuário
- Responda de forma clara, objetiva e didática
- Use exemplos práticos e casos reais
- Ofereça dicas personalizadas
- Mantenha o foco no tema solicitado
- Confirme mudanças de assunto
- Seja honesto quando não souber algo
- Use emojis moderadamente para tornar a conversa mais leve
- Priorize a experiência do usuário
- Use markdown para formatar suas respostas:
  * Use **negrito** para ênfase
  * Use *itálico* para termos técnicos
  * Use listas com - ou 1. para organizar informações
  * Use > para citações importantes
  * Use \`código\` para exemplos
  * Use links com [texto](url) quando relevante

Lembre-se: Você é um professor experiente orientando outros professores para concursos em Florianópolis. Sua missão é ajudar no sucesso dos candidatos através de orientações claras, materiais relevantes e motivação constante.`
    };

    let messages = [systemPrompt, ...(history || [{ role: 'user', content: message }])];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 700
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Processa a resposta para garantir formatação markdown adequada
    let processedResponse = response.data.choices[0].message.content;
    
    // Adiciona quebras de linha antes de listas
    processedResponse = processedResponse.replace(/([^\n])(\n?)([*-]\s)/g, '$1\n\n$3');
    
    // Adiciona quebras de linha antes de citações
    processedResponse = processedResponse.replace(/([^\n])(\n?)(>\s)/g, '$1\n\n$3');
    
    // Adiciona quebras de linha antes de blocos de código
    processedResponse = processedResponse.replace(/([^\n])(\n?)(```)/g, '$1\n\n$3');

    res.json({
      response: processedResponse
    });
  } catch (error) {
    console.error('Erro ao comunicar com o assistente:', error);
    res.status(500).json({ message: 'Erro ao processar sua solicitação' });
  }
};

// @desc    Gerar plano de estudos personalizado
// @route   POST /api/assistant/study-plan
// @access  Private
const generateStudyPlan = async (req, res) => {
  try {
    const { topic, timeAvailable } = req.body;
    const { user } = req;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em criar planos de estudo para concursos públicos.
            Crie um plano detalhado e estruturado para o tópico fornecido, considerando o tempo disponível.
            Inclua sugestões de materiais, exercícios e técnicas de estudo.`
          },
          {
            role: 'user',
            content: `Crie um plano de estudo para o tópico "${topic}" com ${timeAvailable} horas disponíveis por semana.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      studyPlan: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error('Erro ao gerar plano de estudos:', error);
    res.status(500).json({ message: 'Erro ao gerar plano de estudos' });
  }
};

module.exports = {
  chatWithAssistant,
  generateStudyPlan,
  getYoutubeVideos,
  getYoutubeVideosRaw
}; 