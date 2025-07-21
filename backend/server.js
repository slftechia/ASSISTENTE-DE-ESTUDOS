const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const axios = require('axios');
const OpenAI = require('openai');
const puppeteer = require('puppeteer');
const pdfParse = require('pdf-parse');
const editalEmbeddings = require('./editalEmbeddings');
const { getYoutubeVideos } = require('./controllers/openaiController');
const { searchWeb, extractWebContent, searchEducationalContent } = require('./controllers/webSearchController');
const { regexVideoaula, regexDica } = require('./utils/interceptors');
const { PROMPT_ASSISTENTE_ESTUDOS, MSG_DICA } = require('./utils/prompts');
const authController = require('./controllers/authController');
require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const ChatMessage = require('./models/ChatMessage');
const authMiddleware = require('./middleware/auth');
connectDB();

const SECRET_KEY = process.env.JWT_SECRET || 'sua-chave-secreta-muito-segura';

console.log('>>> Backend correto está rodando!');

// Configuração do CORS (deve ser o PRIMEIRO middleware)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware para servir arquivos estáticos
app.use('/assets', express.static(path.join(__dirname, '..', 'frontend', 'public', 'assets')));

// Configuração da OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Armazenar o último plano de estudos HTML por usuário (em memória)
const planosHTML = {};

let editalTexto = '';
let temasEdital = [];
let editalEmbeddingsMem = [];

// Estado de cargo pretendido por usuário (em memória)
const cargoUsuario = {};

// NOVO: Estado de solicitação de apostila por usuário (em memória)
const estadoApostilaUsuario = {};

// NOVO: Estado de simulados enviados por usuário (em memória)
const simuladosEnviadosUsuario = {};

// NOVO: Estado de simulado por usuário (em memória)
const global = {};

// Estado de último pedido de videoaula por usuário
const ultimoPedidoVideoaula = {};

// NOVO: Estado de vídeos já enviados por usuário
global.linksEnviadosPorUsuario = {};

// Contexto do último envio de links por usuário
const ultimoEnvioLinks = {};

// Função correta para remover acentos
const removeAcentos = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Função utilitária para busca inteligente de apostilas
const removeAcentosLower = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Função utilitária para embaralhar array
function embaralharArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

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

// Função para extrair temas/conteúdos do edital (com subtemas)
function extrairTemasEdital(texto) {
  // Busca por seção de conteúdo programático
  const match = texto.match(/CONTE[ÚU]DO[S]? PROGRAM[ÁA]TICO[S]?[\s\S]{0,3000}/i);
  if (match) {
    const linhas = match[0].split('\n').map(l => l.trim()).filter(l => l.length > 2);
    let temas = [];
    let temaAtual = null;
    linhas.forEach(linha => {
      if (/^[-–•\u2022]/.test(linha)) {
        // Subtema
        if (temaAtual) {
          temaAtual.subtemas.push(linha.replace(/^[-–•\u2022]\s*/, ''));
        }
      } else if (/^[A-ZÁÉÍÓÚÇ ]{4,}$/.test(linha) || /^\d+\./.test(linha)) {
        // Título de seção ou tema numerado
        temaAtual = { tema: linha, subtemas: [] };
        temas.push(temaAtual);
      } else if (/^[\wÀ-ÿ ]{3,}$/.test(linha)) {
        // Tema principal
        temaAtual = { tema: linha, subtemas: [] };
        temas.push(temaAtual);
      }
    });
    return temas;
  }
  // Fallback: lista simples
  return texto.split('\n').filter(l => l.trim().startsWith('- ')).map(l => ({ tema: l.trim().replace(/^- /, ''), subtemas: [] }));
}

// Função para buscar trecho do edital por palavra-chave
function buscarNoEdital(palavra) {
  if (!editalTexto) return '';
  const regex = new RegExp(`.{0,200}${palavra}.{0,200}`, 'gi');
  const resultados = editalTexto.match(regex);
  if (resultados && resultados.length > 0) {
    return resultados.join('\n...\n');
  }
  return 'Nenhum trecho encontrado no edital para: ' + palavra;
}

// Função para ler o edital PDF ao iniciar o backend
(async () => {
  try {
    const editalPath = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'edital florianópolis 2024', 'edital 2024 florianópolis.pdf');
    const dataBuffer = await fs.readFile(editalPath);
    const data = await pdfParse(dataBuffer);
    editalTexto = data.text;
    temasEdital = extrairTemasEdital(editalTexto);
    // NOVO: gerar embeddings dos blocos do edital
    console.log('Gerando embeddings dos blocos do edital...');
    editalEmbeddingsMem = await editalEmbeddings.processarEdital(editalTexto);
    console.log('Embeddings do edital gerados:', editalEmbeddingsMem.length);
    console.log('Edital carregado com sucesso. Tamanho do texto extraído:', editalTexto.length);
    console.log('Temas extraídos do edital:', temasEdital.length);
  } catch (err) {
    console.error('Erro ao carregar o edital:', err);
    editalTexto = '';
    temasEdital = [];
    editalEmbeddingsMem = [];
  }
})();

// Limitar o texto do edital para não exceder o contexto do modelo
const editalTextoLimitado = editalTexto ? editalTexto.slice(0, 20000) : '';

// Função para buscar temas/subtemas para qualquer cargo (sempre retorna o conteúdo programático geral)
function buscarTemasParaQualquerCargo() {
  if (!editalTexto) return [];
  // Busca a seção de conteúdo programático geral
  const match = editalTexto.match(/CONTE[ÚU]DO[S]? PROGRAM[ÁA]TICO[S]?[\s\S]{0,3000}/i);
  if (match) {
    return extrairTemasEdital(match[0]);
  }
  return [];
}

// Função para buscar conteúdos comuns a todos os cargos
function buscarTemasComuns() {
  if (!editalTexto) return [];
  const regex = /CONTE[ÚU]DO[S]? COMUM[\s\S]{0,1500}/i;
  const match = editalTexto.match(regex);
  if (match) {
    return extrairTemasEdital(match[0]);
  }
  return [];
}

// Endpoint para consultar os temas extraídos do edital
app.get('/api/edital/temas', authenticateToken, (req, res) => {
  res.json({ temas: temasEdital });
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Assistente de Estudos funcionando!' });
});

// Rota para listar apostilas por tema
app.get('/api/apostilas/:tema', authenticateToken, async (req, res) => {
  try {
    const tema = req.params.tema;
    // Corrigir o caminho para a pasta correta
    const apostilasPath = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'apostilas', tema);
    // Verifica se o diretório existe
    try {
      await fs.access(apostilasPath);
    } catch (error) {
      return res.json([]); // Retorna array vazio se o diretório não existir
    }
    const files = await fs.readdir(apostilasPath);
    const apostilas = files
      .filter(file => file.endsWith('.pdf'))
      .map(file => ({
        filename: file,
        title: file.replace('.pdf', '').split('-').join(' '),
        subject: tema.charAt(0).toUpperCase() + tema.slice(1).split('-').join(' '),
        path: `/pdfs/apostilas/${tema}/${file}`
      }));
    res.json(apostilas);
  } catch (error) {
    console.error('Erro ao listar apostilas:', error);
    res.status(500).json({ error: 'Erro ao listar apostilas' });
  }
});

// Rota para download de apostila específica
app.get('/api/apostilas/:tema/:filename', authenticateToken, async (req, res) => {
  try {
    const { tema, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'frontend', 'public', 'assets', 'apostilas', tema, filename);
    
    // Verifica se o arquivo existe
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Erro ao baixar apostila:', error);
    res.status(500).json({ error: 'Erro ao baixar apostila' });
  }
});

// Rota para listar simulados por tema
app.get('/api/simulados/:tema', authenticateToken, async (req, res) => {
  try {
    const tema = req.params.tema;
    // Corrigir o caminho para a pasta correta
    const simuladosPath = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'simulados', tema);
    // Verifica se o diretório existe
    try {
      await fs.access(simuladosPath);
    } catch (error) {
      return res.json([]); // Retorna array vazio se o diretório não existir
    }
    const files = await fs.readdir(simuladosPath);
    const simulados = files
      .filter(file => file.endsWith('.pdf'))
      .map(file => ({
        filename: file,
        title: file.replace('.pdf', '').split('-').join(' '),
        subject: tema.charAt(0).toUpperCase() + tema.slice(1).split('-').join(' '),
        path: `/pdfs/simulados/${tema}/${file}`
      }));
    res.json(simulados);
  } catch (error) {
    console.error('Erro ao listar simulados:', error);
    res.status(500).json({ error: 'Erro ao listar simulados' });
  }
});

// Rota para download de simulado específico
app.get('/api/simulados/:tema/:filename', authenticateToken, async (req, res) => {
  try {
    const { tema, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'frontend', 'public', 'assets', 'simulados', tema, filename);
    
    // Verifica se o arquivo existe
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Erro ao baixar simulado:', error);
    res.status(500).json({ error: 'Erro ao baixar simulado' });
  }
});

// Rota para gerar plano de estudos
app.post('/api/plano-estudos', authenticateToken, async (req, res) => {
  try {
    const { disponibilidade, temas } = req.body;
    // Aqui você implementaria a lógica de geração do plano de estudos
    // usando a API do GPT ou outro sistema
    res.json({
      plano: {
        cronograma: [],
        materiais: [],
        objetivos: []
      }
    });
  } catch (error) {
    console.error('Erro ao gerar plano de estudos:', error);
    res.status(500).json({ error: 'Erro ao gerar plano de estudos' });
  }
});

// Rota para obter dicas de estudo
app.get('/api/dicas', authenticateToken, async (req, res) => {
  try {
    // Aqui você implementaria a lógica para retornar dicas de estudo
    res.json({
      dicas: [
        {
          titulo: 'Técnica Pomodoro',
          descricao: 'Estude por 25 minutos e descanse 5 minutos...'
        }
      ]
    });
  } catch (error) {
    console.error('Erro ao buscar dicas:', error);
    res.status(500).json({ error: 'Erro ao buscar dicas' });
  }
});

// Rota para a comunidade de estudo
app.get('/api/comunidade/posts', authenticateToken, async (req, res) => {
  try {
    // Aqui você implementaria a lógica para listar posts da comunidade
    res.json({
      posts: []
    });
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({ error: 'Erro ao buscar posts' });
  }
});

// Função para criar PDF de apostila automaticamente
async function criarApostilaPDF(tema, conteudoHTML) {
  // Normalizar nome do arquivo
  const nomeArquivo = `apostila_de_${removeAcentos(tema).toLowerCase().replace(/ /g, '_')}.pdf`;
  const pastaTema = removeAcentos(tema).toLowerCase().replace(/ /g, '_');
  const pastaDestino = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'apostilas', pastaTema);
  await fs.mkdir(pastaDestino, { recursive: true });
  const caminhoPDF = path.join(pastaDestino, nomeArquivo);

  // Gerar PDF com Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(conteudoHTML, { waitUntil: 'networkidle0' });
  await page.pdf({ path: caminhoPDF, format: 'A4', printBackground: true });
  await browser.close();
  return `/pdfs/apostilas/${pastaTema}/${nomeArquivo}`;
}

// Função para gerar conteúdo da apostila (usando OpenAI)
async function gerarConteudoApostila(tema) {
  const prompt = `Você é um especialista em educação. Gere um conteúdo didático, resumido e organizado para uma apostila sobre o tema "${tema}" voltada para concursos de professores temporários de Florianópolis. Estruture em tópicos, explique de forma clara e inclua exemplos práticos. Não cite fontes externas, apenas explique o conteúdo. Use títulos, subtítulos e listas quando necessário.`;
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: prompt }
    ]
  });
  // Gerar HTML simples para a apostila
  const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Apostila de ${tema}</title><style>body{font-family:sans-serif;padding:32px;}h1{color:#1e293b;}h2{color:#2563eb;}ul,ol{margin-left:24px;}p{margin:12px 0;}</style></head><body><h1>Apostila de ${tema}</h1>${completion.choices[0].message.content.replace(/\n/g,'<br>')}</body></html>`;
  return html;
}

// Função para criar nova apostila baseada em PDF existente
async function criarNovaApostilaBaseadaEmPDF(tema) {
  // Caminho do PDF oficial
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
  // Pedir para a OpenAI reescrever e reorganizar
  const prompt = `Você é um especialista em educação. Reescreva e reorganize o conteúdo abaixo, criando uma nova apostila didática, resumida e com layout diferente, voltada para concursos de professores temporários de Florianópolis. Use títulos, subtítulos, listas e exemplos práticos. Não copie literalmente, mas mantenha os principais tópicos e informações.\n\nCONTEÚDO BASE:\n${textoBase}`;
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: prompt }
    ]
  });
  const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Apostila de ${tema} (Nova Versão)</title><style>body{font-family:sans-serif;padding:32px;}h1{color:#1e293b;}h2{color:#2563eb;}ul,ol{margin-left:24px;}p{margin:12px 0;}</style></head><body><h1>Apostila de ${tema} (Nova Versão)</h1>${completion.choices[0].message.content.replace(/\n/g,'<br>')}</body></html>`;
  // Salvar PDF
  const nomeArquivo = `apostila_de_${removeAcentos(tema).toLowerCase().replace(/ /g, '_')}_nova.pdf`;
  const caminhoNovoPDF = path.join(basePath, nomeArquivo);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: caminhoNovoPDF, format: 'A4', printBackground: true });
  await browser.close();
  return `/pdfs/apostilas/${nomeArquivo}`;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🤖 Servidor rodando na porta ${PORT}`);
});

// Função para buscar conteúdo de leis e documentos educacionais
async function buscarConteudoEducacional(termo) {
  const conteudos = {
    'bncc': {
      titulo: 'Base Nacional Comum Curricular (BNCC)',
      descricao: 'A Base Nacional Comum Curricular é um documento normativo que define o conjunto de aprendizagens essenciais que todos os alunos devem desenvolver ao longo da Educação Básica.',
      principais_pontos: [
        '🎯 10 Competências Gerais da Educação Básica',
        '📚 Campos de Experiências da Educação Infantil:',
        '   - O eu, o outro e o nós',
        '   - Corpo, gestos e movimentos',
        '   - Traços, sons, cores e formas',
        '   - Escuta, fala, pensamento e imaginação',
        '   - Espaços, tempos, quantidades, relações e transformações',
        '📖 Áreas do Conhecimento:',
        '   - Linguagens',
        '   - Matemática',
        '   - Ciências da Natureza',
        '   - Ciências Humanas',
        '   - Ensino Religioso',
        '🎓 Competências Específicas por Área',
        '📝 Habilidades e Objetivos de Aprendizagem'
      ],
      competencias: [
        '1. Conhecimento: Valorizar e utilizar conhecimentos historicamente construídos sobre o mundo físico, social, cultural e digital.',
        '2. Pensamento científico e criativo: Exercitar a curiosidade intelectual e utilizar as ciências com criticidade e criatividade.',
        '3. Repertório cultural: Valorizar as diversas manifestações artísticas e culturais, das locais às mundiais.',
        '4. Comunicação: Utilizar diferentes linguagens – verbal, corporal, visual, sonora e digital.',
        '5. Cultura digital: Compreender, utilizar e criar tecnologias digitais de forma crítica, significativa e ética.',
        '6. Trabalho e projeto de vida: Valorizar e apropriar-se de experiências e conhecimentos para entender o mundo do trabalho.',
        '7. Argumentação: Argumentar com base em fatos, dados e informações confiáveis.',
        '8. Autoconhecimento: Conhecer-se, compreender-se na diversidade humana e apreciar-se.',
        '9. Empatia e cooperação: Exercitar a empatia, o diálogo, a resolução de conflitos e a cooperação.',
        '10. Responsabilidade e cidadania: Agir pessoal e coletivamente com autonomia, responsabilidade, flexibilidade, resiliência e determinação.'
      ],
      campos_experiencia: {
        'o eu, o outro e o nós': 'Construção da identidade e da subjetividade, aprendizagem das relações sociais e respeito à diversidade.',
        'corpo, gestos e movimentos': 'Desenvolvimento corporal, expressão e comunicação não-verbal, brincadeiras e práticas esportivas.',
        'traços, sons, cores e formas': 'Expressão artística, sensibilidade estética, criatividade e manifestações culturais.',
        'escuta, fala, pensamento e imaginação': 'Desenvolvimento da linguagem oral e escrita, ampliação do vocabulário e práticas de letramento.',
        'espaços, tempos, quantidades, relações e transformações': 'Noções matemáticas, científicas e relações com o mundo físico e natural.'
      }
    },
    'ldb': {
      titulo: 'Lei de Diretrizes e Bases da Educação (LDB)',
      descricao: 'A Lei nº 9.394/96 estabelece as diretrizes e bases da educação nacional, definindo os princípios, fins, direitos, organização e funcionamento da educação brasileira.',
      principais_pontos: [
        '📚 Princípios e Fins da Educação Nacional:',
        '   - Igualdade de condições para acesso e permanência',
        '   - Liberdade de aprender, ensinar, pesquisar e divulgar',
        '   - Pluralismo de ideias e concepções pedagógicas',
        '   - Gratuidade do ensino público',
        '   - Valorização dos profissionais da educação',
        '🏫 Organização da Educação Nacional:',
        '   - Educação Básica (Infantil, Fundamental e Médio)',
        '   - Educação Superior',
        '   - Educação Especial',
        '   - Educação de Jovens e Adultos',
        '👨‍🏫 Profissionais da Educação:',
        '   - Formação e qualificação',
        '   - Valorização profissional',
        '   - Plano de carreira',
        '📖 Níveis e Modalidades de Ensino',
        '💰 Recursos Financeiros e Financiamento'
      ],
      artigos_importantes: [
        'Art. 1º: Abrangência da educação',
        'Art. 2º: Princípios e fins da educação nacional',
        'Art. 3º: Princípios do ensino',
        'Art. 4º: Dever do Estado com a educação',
        'Art. 13º: Incumbências dos docentes',
        'Art. 61º: Profissionais da educação',
        'Art. 67º: Valorização dos profissionais da educação'
      ]
    }
  };

  const termoNormalizado = termo.toLowerCase().trim();
  const conteudo = conteudos[termoNormalizado];
  
  if (!conteudo) {
    return null;
  }

  return conteudo;
}

// Função para extrair links do PDF
async function extrairLinksDoPDF() {
  try {
    const pdfPath = path.join(__dirname, '../frontend/public/pdfs/video aulas/links de video aulas.pdf');
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);
    
    // Extrair links do YouTube do texto do PDF
    const youtubeLinks = data.text.match(/https:\/\/www\.youtube\.com\/watch\?v=[\w-]+/g) || [];
    
    // Criar pares de título e link
    const pares = [];
    for (let i = 0; i < youtubeLinks.length; i++) {
      const link = youtubeLinks[i];
      // Usar um título genérico se não encontrar um específico
      const titulo = `Videoaula ${i + 1} - Conteúdo Relevante`;
      pares.push({ titulo, link });
    }
    
    return pares;
  } catch (error) {
    console.error('Erro ao extrair links do PDF:', error);
    return [];
  }
}

// Função para extrair links do TXT
global.extrairLinksDoTXT = async function() {
  try {
    const txtPath = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'video aulas', 'links.txt');
    const data = await fs.readFile(txtPath, 'utf-8');
    const linhas = data.split('\n').map(l => l.trim()).filter(Boolean);
    const pares = [];
    for (let i = 0; i < linhas.length - 1; i += 2) {
      const titulo = linhas[i];
      const link = linhas[i + 1];
      if (titulo && link && link.startsWith('https://www.youtube.com/')) {
        pares.push({ titulo, link });
      }
    }
    return pares;
  } catch (error) {
    console.error('Erro ao ler arquivo de links:', error);
    return [];
  }
};

// Handler do chat
app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { mensagem, nomeUsuario } = req.body;
    const chaveUsuario = nomeUsuario || req.user?.email || 'anonimo';
    const userId = req.user && req.user.id ? req.user.id : null;
    // Salvar mensagem do usuário
    if (userId) {
      await ChatMessage.create({ user: userId, texto: mensagem, remetente: 'usuario' });
    }
    console.log('Mensagem recebida:', mensagem);
    // NOVO: Reconhecimento de pedidos de dica de estudo (PRIORITÁRIO)
    if (
      (/dica(s)? de estudo|como estudar|o que estudar|me dê uma dica|me de uma dica|quero uma dica|dica de preparação|dicas para estudar|dicas de preparação|dicas para prova|dicas de concurso|dicas para o concurso|dicas para o cargo|dicas para a prova|dicas para estudar|dicas de estudo|como me preparar|como devo estudar|como estudar para|como estudar para o cargo|como estudar para a prova|como estudar para o concurso/i.test(mensagem))
      || req.body.aguardandoCargoDica
    ) {
      // Se aguardandoCargoDica, trata a mensagem como cargo
      if (req.body.aguardandoCargoDica) {
        const cargo = mensagem.trim();
        const basePath = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'dicas de estudos');
        let files = [];
        try {
          files = await fs.readdir(basePath);
        } catch (error) {
          return res.json({ resposta: 'Nenhuma dica de estudo encontrada para este cargo.' });
        }
        const pdf = files.find(f => f.toLowerCase().includes(cargo.toLowerCase()) && f.endsWith('.pdf'));
        if (pdf) {
          // Extrair resumo do PDF
          try {
            const pdfPath = path.join(basePath, pdf);
            const dataBuffer = await fs.readFile(pdfPath);
            const data = await pdfParse(dataBuffer);
            let resumo = data.text.trim().split('\n').filter(Boolean).slice(0, 10).join('\n'); // Primeiros 10 parágrafos/linhas
            if (resumo.length > 1000) resumo = resumo.slice(0, 1000) + '...';
            resumo += '\n\nPara mais dicas de estudos, pegadinhas, plano de estudos e muito mais, faça o download do PDF.';
            if (userId) await ChatMessage.create({ user: userId, texto: resposta, remetente: 'assistente' });
            return res.json({
              resposta: `Aqui está um resumo das dicas de estudo para o cargo de <b>${cargo}</b>:`,
              resumo,
              pdf: `/pdfs/dicas de estudos/${pdf}`,
              nome: pdf.replace('.pdf', '')
            });
          } catch (err) {
            return res.json({ resposta: 'Erro ao extrair resumo do PDF. Baixe o PDF completo para ver as dicas.', pdf: `/pdfs/dicas de estudos/${pdf}`, nome: pdf.replace('.pdf', '') });
          }
        } else {
          return res.json({ resposta: 'Nenhuma dica de estudo encontrada para este cargo.' });
        }
      } else {
        return res.json({ resposta: 'Para qual cargo você deseja a dica de estudo? (Ex: Auxiliar de Sala, Administrador Escolar, Professor dos Anos Iniciais do Ensino Fundamental, etc)' });
      }
    }
    // NOVO: Busca dinâmica no YouTube para pedidos específicos de vídeo (sem impactar pedidos genéricos)
    if (/\b(vídeo de|video de|aula de|vídeo sobre|video sobre|aula sobre)\b.+/i.test(mensagem)) {
      try {
        const termoBusca = mensagem.replace(/.*\b(vídeo de|video de|aula de|vídeo sobre|video sobre|aula sobre)\b/i, '').trim();
        if (!termoBusca || termoBusca.length < 3) return res.json({ resposta: 'Por favor, especifique o tema ou professor do vídeo que deseja.' });
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) return res.json({ resposta: 'A busca dinâmica no YouTube não está configurada. Fale com o suporte.' });
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${encodeURIComponent(termoBusca + ' concurso professor florianópolis')}&key=${apiKey}`;
        const ytRes = await axios.get(url);
        if (!ytRes.data.items || ytRes.data.items.length === 0) {
          return res.json({ resposta: 'Nenhum vídeo encontrado no YouTube para esse tema/professor.' });
        }
        let resposta = '🎬 Vídeos encontrados no YouTube para <b>'+termoBusca+'</b>:<br><br>';
        ytRes.data.items.forEach((item, idx) => {
          resposta += `<b>${idx + 1}. ${item.snippet.title}</b><br>https://www.youtube.com/watch?v=${item.id.videoId}<br><br>`;
        });
        if (userId) await ChatMessage.create({ user: userId, texto: resposta, remetente: 'assistente' });
        return res.json({ resposta });
      } catch (err) {
        return res.json({ resposta: 'Erro ao buscar vídeos no YouTube. Tente novamente mais tarde.' });
      }
    }
    // Regex flexível para pedidos de videoaula
    const regexVideo = /\b(videoaula|video aula|vídeo aula|aula em vídeo|aula em video|aula|vídeo|video|ver|assistir|mostrar|me dê|me da|quero|sugira|indique|me mostre|me mande|me envie|manda|envia|ver aula|ver video|ver vídeo|ver uma aula|ver um video|ver um vídeo|ver videoaula|ver video aula|ver uma videoaula|ver uma video aula|ver vídeo aula|ver uma vídeo aula|ver uma video|ver uma vídeo|ver aula em vídeo|ver aula em video|ver uma aula em vídeo|ver uma aula em video|ver|assistir|ver|aula)\b/i;
    if (regexVideo.test(mensagem)) {
      console.log('Solicitação de videoaula detectada');
      if (!global.linksEnviadosPorUsuario[chaveUsuario]) {
        global.linksEnviadosPorUsuario[chaveUsuario] = [];
      }
      const enviados = global.linksEnviadosPorUsuario[chaveUsuario];
      console.log('Links já enviados para o usuário:', enviados);
      const todosLinks = await global.extrairLinksDoTXT();
      console.log('Links extraídos do TXT:', todosLinks);
      const novos = todosLinks.filter(par => !enviados.includes(par.link));
      console.log('Novos links para enviar:', novos);
      if (novos.length === 0) {
        console.log('Nenhum novo link para enviar.');
        return res.json({ 
          resposta: 'Você já recebeu todos os links disponíveis! Se quiser, baixe o PDF completo: <a href="/pdfs/video aulas/links de video aulas.pdf" target="_blank">Baixar PDF de Videoaulas</a>' 
        });
      }
      const respostaLinks = novos.slice(0, 3);
      respostaLinks.forEach(par => enviados.push(par.link));
      let resposta = '🎥 Encontrei estas videoaulas para você:<br><br>';
      respostaLinks.forEach((par, idx) => {
        resposta += `<b>${idx + 1}. ${par.titulo}</b><br>${par.link}<br><br>`;
      });
      resposta += 'Se quiser mais, é só pedir novamente!';
      console.log('Resposta enviada:', resposta);
      if (userId) await ChatMessage.create({ user: userId, texto: resposta, remetente: 'assistente' });
      return res.json({ resposta });
    }
    // Lista de palavras-chave para perguntas sobre regras do concurso (expandida para datas de prova)
    const regexEdital = /(remuneraç|sal[áa]rio|carga hor[áa]ria|inscriç|local( da)? prova|data(s)?( da)? prova|quando é a prova|qual o dia da prova|quando será a prova|vagas?|banca|atribuiç|requisito|etapa(s)?|resultado|recurso(s)?|cronograma|isencao|taxa|documentos?|homologaç|classificaç|desempate|validade|convocaç|posse|nomeaç|lotaç|jornada|funç|escolaridade|experi[êe]ncia|t[íi]tulo(s)?|avaliaç|crit[ée]rios?|pontuaç|nota|corte|publicaç|edital|retificaç|anulaç|cancelamento|interposiç|prazo|per[íi]odo|deferimento|indeferimento|pagamento|boleto|comprovante|cadastro|sistema|site|endereç|atendimento|especial|defici[êe]ncia|cotas?|pcd|autodeclaraç|autismo|laudo|m[ée]dico|per[íi]cia|junta|comiss[ãa]o)/i;
    if (regexEdital.test(mensagem)) {
      // Resposta especial para data da prova
      if (/data(s)?( da)? prova|quando é a prova|qual o dia da prova|quando será a prova/i.test(mensagem)) {
        return res.json({
          resposta: `A prova do concurso para professores temporários de Florianópolis em 2024 foi realizada no dia <b>24 de novembro de 2024</b>, conforme o edital vigente. Assim que o edital de 2025 for divulgado, você receberá a data prevista para este ano.<br><br> <a href="/pdfs/edital florianópolis 2024/edital 2024 florianópolis.pdf" target="_blank">Clique aqui para acessar o edital completo de 2024</a>`
        });
      }
      const trechoEdital = buscarNoEdital(mensagem);
      if (trechoEdital && !trechoEdital.includes('Nenhum trecho encontrado')) {
        // Usa o GPT para explicar o trecho do edital
        const prompt = `${PROMPT_ASSISTENTE_ESTUDOS}\n\nO usuário fez a seguinte pergunta: "${mensagem}".\n\nAqui está um trecho do edital relacionado ao tema:\n${trechoEdital}\n\nExplique para o usuário de forma didática, acolhedora e motivadora, contextualizando, resumindo, dando dicas de estudo e orientações práticas. Não copie o texto literal, mas use como base para uma resposta clara e útil.`;
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: prompt }
          ]
        });
        const resposta = completion.choices[0].message.content;
        const termoPergunta = removeAcentosLower(mensagem.trim());
        if (userId) await ChatMessage.create({ user: userId, texto: resposta, remetente: 'assistente' });
        return res.json({ resposta });
      }
    }
    // NOVO: Reconhecimento de pedidos de mapa mental
    if (/mapa mental|mapas mentais/i.test(mensagem)) {
      if (!req.session?.temaMapaMental) {
        req.session = req.session || {};
        req.session.temaMapaMental = true;
        return res.json({ resposta: 'Sobre qual tema você deseja o mapa mental? Por exemplo: LDB, BNCC, Didática, etc.' });
      } else {
        req.session.temaMapaMental = false;
        const tema = mensagem.replace(/mapa mental|mapas mentais/gi, '').trim() || mensagem.trim();
        const basePath = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'apostilas', 'Mapas_Mentais');
        const arquivos = await fs.readdir(basePath);
        const arquivo = arquivos.find(a => removeAcentosLower(a).includes(removeAcentosLower(tema)) && a.endsWith('.pdf'));
        if (arquivo) {
          return res.json({ resposta: `Aqui está o mapa mental sobre <b>${tema}</b>: <a href="/pdfs/apostilas/Mapas_Mentais/${arquivo}" target="_blank">Baixar PDF</a>` });
        } else {
          return res.json({ resposta: 'Desculpe, não encontrei um mapa mental para esse tema. Tente outro tema ou confira todos os mapas mentais disponíveis na página de apostilas.' });
        }
      }
    }
    // NOVO: Reconhecimento de pedidos de apostila (PRIORITÁRIO)
    if (
      (/apostila(s)?|quero uma apostila|me envie uma apostila|me mande uma apostila|me mostre uma apostila|baixar apostila|apostila completa|apostila de conhecimentos específicos|apostila de português|apostila de temas de educação|apostila de mapas mentais/i.test(mensagem))
      || req.body.aguardandoTemaApostila
    ) {
      if (req.body.aguardandoTemaApostila) {
        const tema = mensagem.trim();
        // Busca inteligente de apostila
        const resultado = await buscarApostilaInteligente(tema);
        if (resultado) {
          return res.json({
            resposta: `Aqui está a apostila sobre <b>${tema}</b> para download:`,
            pdf: resultado.path,
            nome: resultado.title,
            texto: 'Se preferir apenas ler a apostila, vá para a página "Apostilas" no Assistente de Estudos e escolha pelo tema desejado.'
          });
        } else {
          return res.json({ resposta: 'Nenhuma apostila encontrada para este tema.' });
        }
      } else {
        return res.json({ resposta: 'Sobre qual tema você deseja a apostila? (Ex: Conhecimentos Específicos, Português, Temas de Educação, Apostila Completa, Mapas Mentais...)' });
      }
    }
    // NOVO: Reconhecimento de pedidos de simulado (PRIORITÁRIO)
    if (
      (/simulado(s)?|quero um simulado|me envie um simulado|me mande um simulado|me mostre um simulado|baixar simulado|simulado completo|simulado de conhecimentos específicos|simulado de português|simulado de temas de educação/i.test(mensagem))
      || req.body.aguardandoTemaSimulado
    ) {
      if (req.body.aguardandoTemaSimulado) {
        const tema = removeAcentosLower(mensagem.trim());
        const basePath = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'simulados');
        let temas = [];
        try {
          temas = await fs.readdir(basePath);
        } catch (error) {
          return res.json({ resposta: 'Nenhum simulado encontrado para este tema.' });
        }
        // Procurar subpasta que mais se aproxima do tema
        const pastaTema = temas.find(t => removeAcentosLower(t).includes(tema) || tema.includes(removeAcentosLower(t)));
        if (!pastaTema) {
          return res.json({ resposta: 'Nenhum simulado encontrado para este tema.' });
        }
        const pastaSimulados = path.join(basePath, pastaTema);
        let arquivos = [];
        try {
          arquivos = await fs.readdir(pastaSimulados);
        } catch (error) {
          return res.json({ resposta: 'Nenhum simulado encontrado para este tema.' });
        }
        // Filtrar apenas PDFs
        const simulados = arquivos.filter(f => f.endsWith('.pdf'));
        if (simulados.length === 0) {
          return res.json({ resposta: 'Nenhum simulado encontrado para este tema.' });
        }
        // Controle de simulados enviados por usuário
        if (!global.simuladosEnviadosUsuario) global.simuladosEnviadosUsuario = {};
        const chaveUsuario = req.user?.email || req.body.nomeUsuario || 'anonimo';
        if (!global.simuladosEnviadosUsuario[chaveUsuario]) global.simuladosEnviadosUsuario[chaveUsuario] = {};
        if (!global.simuladosEnviadosUsuario[chaveUsuario][pastaTema]) global.simuladosEnviadosUsuario[chaveUsuario][pastaTema] = [];
        const enviados = global.simuladosEnviadosUsuario[chaveUsuario][pastaTema];
        // Encontrar o próximo simulado não enviado
        const proximo = simulados.find(s => !enviados.includes(s));
        if (!proximo) {
          return res.json({ resposta: 'Você já recebeu todos os simulados disponíveis deste tema! Se quiser, acesse a página de simulados para refazer.' });
        }
        enviados.push(proximo);
        return res.json({
          resposta: `Aqui está o simulado sobre <b>${mensagem.trim()}</b> para download:`,
          pdf: `/pdfs/simulados/${pastaTema}/${proximo}`,
          nome: proximo.replace('.pdf', ''),
          texto: 'Se preferir apenas resolver o simulado online, vá para a página "Simulados" no Assistente de Estudos e escolha pelo tema desejado.'
        });
      } else {
        return res.json({ resposta: 'Sobre qual tema você deseja o simulado? (Ex: Conhecimentos Específicos, Português, Temas de Educação, Simulado Completo...)' });
      }
    }
    // Para qualquer outro tipo de pergunta, responder sempre com o GPT
    const prompt = PROMPT_ASSISTENTE_ESTUDOS + `\n\nPergunta do usuário: "${mensagem}"`;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt }
      ]
    });
    const resposta = completion.choices[0].message.content;
    const termoPergunta = removeAcentosLower(mensagem.trim());
    if (userId) await ChatMessage.create({ user: userId, texto: resposta, remetente: 'assistente' });
    return res.json({ resposta });
  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({ 
      error: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.' 
    });
  }
});

// Configuração do assistente

async function chatAssistenteHandler(req, res) {
  try {
    console.log('>>> Handler chatAssistenteHandler foi chamado');
    console.log('🤖 Iniciando processamento do chat');
    console.log('🔑 YOUTUBE_API_KEY configurada:', !!process.env.YOUTUBE_API_KEY);
    
    let { mensagem, nomeUsuario, apostilas, planoEstudos } = req.body;
    console.log('📨 Mensagem recebida:', mensagem);
    
    let userEmail = req.user?.email || '';
    if (!nomeUsuario && req.user && req.user.nome) {
      nomeUsuario = req.user.nome;
    }
    console.log('👤 Usuário:', nomeUsuario || userEmail);
    
    let listaPDFs = '';
    if (apostilas && apostilas.length > 0) {
      listaPDFs = '\nApostilas disponíveis:\n' + apostilas.map(a => `- ${a.nome}: ${a.url}`).join('\n');
      console.log('📚 Apostilas disponíveis:', apostilas.length);
    }
    const chaveUsuario = userEmail || nomeUsuario;

    if (!mensagem) {
      console.warn('⚠️ Mensagem vazia recebida');
      return res.status(400).json({ 
        error: 'Por favor, envie uma mensagem para o assistente.' 
      });
    }

    // LOG para depuração
    console.log('Mensagem recebida:', mensagem);

    // Se a mensagem pede vídeo/videoaula
    if (/vídeo|videoaula|video aula|aula em vídeo|aula em video|ver vídeo|ver video|me mostre um vídeo|me mostre uma videoaula|quero um vídeo|quero uma videoaula|sugira um vídeo|sugira uma videoaula|indique um vídeo|indique uma videoaula|tem vídeo|tem video|tem videoaula|tem vídeo aula|tem aula em vídeo|tem aula em video|assistir|ver aula|quero assistir|quero ver|me mostre|sugira|indique/i.test(mensagem)) {
      const chaveUsuario = userEmail || nomeUsuario || req.user?.email || 'anonimo';
      if (!global.linksEnviadosPorUsuario[chaveUsuario]) global.linksEnviadosPorUsuario[chaveUsuario] = [];
      const enviados = global.linksEnviadosPorUsuario[chaveUsuario];
      const todosLinks = await global.extrairLinksDoTXT();
      const novos = todosLinks.filter(par => !enviados.includes(par.link));
      if (novos.length === 0) {
        return res.json({ resposta: 'Você já recebeu todos os links disponíveis! Se quiser, baixe o PDF completo: <a href="/pdfs/video aulas/links de video aulas.pdf" target="_blank">Baixar PDF de Videoaulas</a>' });
      }
      const respostaLinks = novos.slice(0, 3);
      respostaLinks.forEach(par => enviados.push(par.link));
      let resposta = '🎥 Encontrei estas videoaulas para você:<br><br>';
      respostaLinks.forEach((par, idx) => {
        resposta += `<b>${idx + 1}. ${par.titulo}</b><br>${par.link}<br><br>`;
      });
      resposta += 'Se quiser mais, é só pedir novamente!';
      return res.json({ resposta });
    }

    // Para demais fluxos, use sempre o PROMPT_ASSISTENTE_ESTUDOS como base do system prompt
    const prompt = PROMPT_ASSISTENTE_ESTUDOS + `\n\nPergunta do usuário: "${mensagem}"`;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt }
      ]
    });
    const resposta = completion.choices[0].message.content;
    const termoPergunta = removeAcentosLower(mensagem.trim());
    if (userId) await ChatMessage.create({ user: userId, texto: resposta, remetente: 'assistente' });
    return res.json({ resposta });
  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({ 
      error: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.' 
    });
  }
}

// Rota de logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// Rota para listar mapas mentais
app.get('/api/mapas-mentais', authenticateToken, async (req, res) => {
  try {
    // Tentar encontrar a pasta, independente de maiúsculas/minúsculas/underline/espaço
    const baseDir = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'apostilas');
    let mapasPath = path.join(baseDir, 'Mapas_Mentais');
    let files = [];
    try {
      files = await fs.readdir(mapasPath);
    } catch (error1) {
      // Tenta com nome alternativo
      mapasPath = path.join(baseDir, 'mapas mentais');
      try {
        files = await fs.readdir(mapasPath);
      } catch (error2) {
        return res.json([]); // Retorna array vazio se o diretório não existir
      }
    }
    const mapas = files
      .filter(file => file.endsWith('.pdf') || file.endsWith('.jpeg') || file.endsWith('.jpg'))
      .map(file => ({
        filename: file,
        title: file.replace(/\.(pdf|jpeg|jpg)$/, '').split('-').join(' '),
        path: `/pdfs/apostilas/${path.basename(mapasPath)}/${file}`,
        type: file.endsWith('.pdf') ? 'pdf' : 'image'
      }));
    res.json(mapas);
  } catch (error) {
    console.error('Erro ao listar mapas mentais:', error);
    res.status(500).json({ error: 'Erro ao listar mapas mentais' });
  }
});

// Rota de registro
app.post('/api/auth/register', authController.registerUser);

// Rota de login
app.post('/api/auth/login', authController.loginUser);

// Adicionar uso das rotas organizadas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/apostilas', require('./routes/apostilas'));
app.use('/api/simulados', require('./routes/simulados'));
app.use('/api/dicas', require('./routes/dicasEstudoRoutes'));
app.use('/api/pagamento', require('./routes/pagamento'));

// Nova rota para retornar todas as videoaulas do links.txt
app.get('/api/videoaulas', async (req, res) => {
  try {
    const txtPath = path.join(__dirname, '..', 'frontend', 'public', 'pdfs', 'video aulas', 'links.txt');
    const data = await fs.readFile(txtPath, 'utf-8');
    const lines = data.split(/\r?\n/);
    let categorias = [];
    let categoriaAtual = { categoria: 'GERAL', videos: [] };
    let lastTitle = null;
    for (let line of lines) {
      if (line.trim().startsWith('#')) {
        if (categoriaAtual.videos.length > 0) {
          categorias.push(categoriaAtual);
        }
        categoriaAtual = { categoria: line.replace('#', '').trim(), videos: [] };
        lastTitle = null;
      } else if (line.trim() === '') {
        // ignora linhas em branco
        continue;
      } else if (/^https?:\/\//.test(line.trim())) {
        // linha de link
        if (lastTitle) {
          categoriaAtual.videos.push({ titulo: lastTitle, link: line.trim() });
          lastTitle = null;
        } else {
          // link sem título
          categoriaAtual.videos.push({ titulo: 'Videoaula', link: line.trim() });
        }
      } else {
        // linha de título
        lastTitle = line.trim();
      }
    }
    if (categoriaAtual.videos.length > 0) {
      categorias.push(categoriaAtual);
    }
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao ler videoaulas.' });
  }
});
