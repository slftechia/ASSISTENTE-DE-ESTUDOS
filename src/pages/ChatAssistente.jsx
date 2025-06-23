import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { pdfService } from '../services/pdfService';
import '../styles/tabelaPlano.css';
import { FaRegClipboard } from 'react-icons/fa';
import PDFViewer from '../components/PDFViewer';
import SuggestedQuestions from '../components/Chat/SuggestedQuestions';

// Função para transformar URLs em links clicáveis
function transformLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return `<a href="${part}" target="_blank" rel="noopener noreferrer" style="color: #1a0dab; text-decoration: underline;">${part}</a>`;
    }
    return part;
  }).join('');
}

// Função para detectar se a mensagem é uma saudação
const isSaudacao = (texto) => {
  const saudacoes = [
    'olá', 'bem-vindo', 'bem vinda', 'seja bem-vindo', 'seja bem-vinda', 'como posso te ajudar', 'posso te ajudar hoje', 'assistente de estudos para concursos de florianópolis'
  ];
  const lower = texto.toLowerCase();
  return saudacoes.some(s => lower.includes(s));
};

// Função para detectar se a mensagem é curta e adequada para contexto
const isContextoCurto = (texto) => {
  if (!texto) return false;
  // Considera curto se tiver menos de 120 caracteres, não tiver http, <br>, <a, <b, lista ou \n em excesso
  if (texto.length > 120) return false;
  if (/https?:\/\//i.test(texto)) return false;
  if (/<br|<a|<b|<ul|<li|<div|<span|<p|<h\d/i.test(texto)) return false;
  if (/\n{2,}/.test(texto)) return false;
  if (/\*/.test(texto)) return false;
  if (/\d+\./.test(texto)) return false;
  return true;
};

const ChatAssistente = ({ onClose }) => {
  const [mensagem, setMensagem] = useState('');
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [aguardandoNome, setAguardandoNome] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [fluxoPlano, setFluxoPlano] = useState(false);
  const [dadosPlano, setDadosPlano] = useState({});
  const [confirmarEncerrarPlano, setConfirmarEncerrarPlano] = useState(false);
  const [pdfDica, setPdfDica] = useState(null);
  const [aguardandoCargoDica, setAguardandoCargoDica] = useState(false);
  const [aguardandoTemaApostila, setAguardandoTemaApostila] = useState(false);
  const [aguardandoTemaSimulado, setAguardandoTemaSimulado] = useState(false);
  const [interacoesHoje, setInteracoesHoje] = useState(() => {
    const data = localStorage.getItem('chat_interacoes_data');
    const hoje = new Date().toISOString().slice(0, 10);
    if (data !== hoje) {
      localStorage.setItem('chat_interacoes_data', hoje);
      localStorage.setItem('chat_interacoes_count', '0');
      return 0;
    }
    return parseInt(localStorage.getItem('chat_interacoes_count') || '0', 10);
  });
  const LIMITE_FREE = 5;
  const isFree = user && user.plano === 'Free';
  const atingiuLimite = isFree && interacoesHoje >= LIMITE_FREE;
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Saudação inicial
  useEffect(() => {
    setHistorico([
      {
        tipo: 'assistente',
        texto: '👋 Olá! Seja bem-vindo(a) ao Assistente de Estudos para concursos de Florianópolis! Sou especialista em concursos da Prefeitura e estou aqui para te ajudar a se preparar. Como posso te ajudar hoje?'
      }
    ]);
  }, []);

  // Rola o chat para baixo quando novas mensagens são adicionadas
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [historico]);

  // Garante foco no input sempre que loading mudar para false
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  // Ajuste do início do fluxo do plano de estudos
  useEffect(() => {
    if (location.state?.iniciarPlano) {
      setFluxoPlano(true);
      setDadosPlano({});
      setNomeUsuario('');
      setAguardandoNome(true);
      setHistorico([
        {
          tipo: 'assistente',
          texto: 'Vamos iniciar seu plano de estudos! Para começar, como você gostaria de ser chamado(a)?'
        }
      ]);
    }
  }, [location.state]);

  // Detectar se o usuário digita 'plano' ou 'plano de estudos' para iniciar o fluxo
  useEffect(() => {
    if (historico.length > 0 && historico[historico.length-1].tipo === 'usuario') {
      const texto = historico[historico.length-1].texto.trim().toLowerCase();
      if ((texto === 'plano' || texto === 'plano de estudos') && !fluxoPlano) {
        setFluxoPlano(true);
        setDadosPlano({});
        setNomeUsuario('');
        setAguardandoNome(true);
        setHistorico(prev => [
          ...prev,
          { tipo: 'assistente', texto: 'Vamos iniciar seu plano de estudos! Para começar, como você gostaria de ser chamado(a)?' }
        ]);
      }
    }
  }, [historico]);

  // Função para gerar sugestões de perguntas baseadas no contexto
  const generateSuggestedQuestions = (context) => {
    const commonQuestions = [
      'Como posso melhorar meus estudos?',
      'Quais são os principais temas do edital?',
      'Pode me ajudar com um plano de estudos?',
      'Quais são as melhores técnicas de memorização?',
      'Como organizar meu tempo de estudo?'
    ];

    // Se houver contexto específico, adiciona perguntas relacionadas
    if (context) {
      const contextQuestions = [
        `Me explique mais sobre ${context}`,
        `Quais são os pontos principais de ${context}?`,
        `Como estudar ${context} de forma eficiente?`
      ];
      return [...contextQuestions, ...commonQuestions];
    }

    return commonQuestions;
  };

  // Atualiza sugestões quando o histórico muda
  useEffect(() => {
    if (historico.length > 0) {
      const lastMessage = historico[historico.length - 1];
      if (lastMessage.tipo === 'assistente' && !isSaudacao(lastMessage.texto) && isContextoCurto(lastMessage.texto)) {
        // Extrai o contexto da última mensagem do assistente
        const context = lastMessage.texto.split('\n')[0];
        setSuggestedQuestions(generateSuggestedQuestions(context));
      } else {
        setSuggestedQuestions(generateSuggestedQuestions(null));
      }
    }
  }, [historico]);

  // Função para lidar com clique em sugestão
  const handleSuggestedQuestionClick = (question) => {
    setMensagem(question);
    // Simula o envio da mensagem
    handleSubmit({ preventDefault: () => {} });
  };

  // Função para processar mensagem do usuário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mensagem.trim()) return;
    if (atingiuLimite) return;

    const novaMensagem = mensagem.trim();
    setMensagem('');
    setLoading(true);

    // Adiciona mensagem do usuário ao histórico
    setHistorico(prev => [...prev, { tipo: 'usuario', texto: novaMensagem }]);

    // Fluxo de plano de estudos
    if (fluxoPlano) {
      // Se ainda não sabemos o nome do usuário e estamos aguardando o nome
      if (aguardandoNome && !nomeUsuario) {
        setNomeUsuario(novaMensagem);
        setAguardandoNome(false);
        setHistorico(prev => [
          ...prev,
          { tipo: 'assistente', texto: `👋 Prazer, ${novaMensagem}! Para criar seu plano de estudos personalizado, preciso saber:\n\n1️⃣ Quantas horas por dia você pode estudar?\n2️⃣ Quais dias da semana você tem disponível?\n3️⃣ Quais são seus principais objetivos?` }
        ]);
        setLoading(false);
        return;
      }

      // Detectar se o usuário mudou de assunto
      const msgLower = novaMensagem.toLowerCase();
      if (!confirmarEncerrarPlano && (
        msgLower.includes('apostila') || 
        msgLower.includes('simulado') || 
        msgLower.includes('vaga') || 
        msgLower.includes('prova') || 
        msgLower.includes('conteúdo') ||
        msgLower.includes('legislação') ||
        msgLower.includes('bncc') ||
        msgLower.includes('ldb')
      )) {
        setConfirmarEncerrarPlano(true);
        setHistorico(prev => [
          ...prev,
          { tipo: 'assistente', texto: '⚠️ Você deseja encerrar a criação do plano de estudos e seguir para outro assunto? (Responda "sim" para encerrar ou "não" para continuar o plano de estudos.)' }
        ]);
        setLoading(false);
        return;
      }
      if (confirmarEncerrarPlano) {
        if (msgLower === 'sim') {
          setFluxoPlano(false);
          setConfirmarEncerrarPlano(false);
          setHistorico(prev => [
            ...prev,
            { tipo: 'assistente', texto: 'Plano de estudos encerrado! Agora posso te ajudar com qualquer outra dúvida sobre o concurso.' }
          ]);
          setLoading(false);
          return;
        } else if (msgLower === 'não') {
          setConfirmarEncerrarPlano(false);
          setHistorico(prev => [
            ...prev,
            { tipo: 'assistente', texto: 'Vamos continuar com seu plano de estudos! Me diga, quantas horas por dia você pode estudar?' }
          ]);
          setLoading(false);
          return;
        }
      }
      // Fluxo normal do plano
      if (!dadosPlano.horas) {
        setDadosPlano({ ...dadosPlano, horas: novaMensagem });
        setHistorico(prev => [
          ...prev,
          { tipo: 'assistente', texto: 'Ótimo! Em quais dias da semana você pretende estudar?' }
        ]);
        setLoading(false);
        return;
      }
      if (!dadosPlano.dias) {
        setDadosPlano({ ...dadosPlano, dias: novaMensagem });
        setHistorico(prev => [
          ...prev,
          { tipo: 'assistente', texto: 'Tem alguma preferência de matéria ou foco?' }
        ]);
        setLoading(false);
        return;
      }
      if (!dadosPlano.preferencia) {
        const novosDados = { ...dadosPlano, preferencia: novaMensagem };
        setDadosPlano(novosDados);
        // Agora envia tudo para a IA montar o plano
        try {
          setLoading(true);
          const response = await axios.post('/api/chat', {
            mensagem: 'Monte um plano de estudos personalizado com base nessas informações.',
            contexto: historico.slice(-5),
            nomeUsuario: nomeUsuario || user?.nome || '',
            planoEstudos: novosDados,
            aguardandoCargoDica,
            aguardandoTemaApostila,
            aguardandoTemaSimulado
          });
          setHistorico(prev => [
            ...prev,
            { tipo: 'assistente', texto: response.data.resposta }
          ]);
        } catch (error) {
          setHistorico(prev => [
            ...prev,
            { tipo: 'erro', texto: 'Erro ao montar o plano. Tente novamente.' }
          ]);
        } finally {
          setFluxoPlano(false);
          setLoading(false);
        }
        return;
      }
      // Durante o fluxo do plano, não responder perguntas de outros temas
      setLoading(false);
      return;
    }

    try {
      const apostilas = [
        { nome: 'Apostila Completa', url: '/pdfs/apostilas/apostila_completa.pdf' },
        { nome: 'Legislação Educacional', url: '/pdfs/apostilas/Legislacao/apostila_legislacao.pdf' },
        { nome: 'Conhecimentos Específicos', url: '/pdfs/apostilas/Conhecimentos_Especificos/apostila_conhecimentos.pdf' },
        { nome: 'Português', url: '/pdfs/apostilas/Portugues/apostila_portugues.pdf' },
        { nome: 'Temas de Educação', url: '/pdfs/apostilas/Temas_de_Educacao/apostila_temas.pdf' },
        { nome: 'Inclusão e Diversidade', url: '/pdfs/apostilas/Inclusao/apostila_inclusao.pdf' }
      ];

      const response = await axios.post('/api/chat', {
        mensagem: novaMensagem,
        contexto: historico.slice(-5),
        nomeUsuario: nomeUsuario || user?.nome || '',
        apostilas,
        aguardandoCargoDica,
        aguardandoTemaApostila,
        aguardandoTemaSimulado
      });

      // Se vier PDF de dica de estudo, exibir PDFViewer
      if (response.data.pdf && response.data.nome && response.data.texto) {
        setHistorico(prev => [
          ...prev,
          { tipo: 'assistente', texto: response.data.resposta },
          { tipo: 'arquivo', texto: response.data.texto, pdf: response.data.pdf, nome: response.data.nome }
        ]);
        setPdfDica(null);
        setAguardandoCargoDica(false);
        setAguardandoTemaApostila(false);
        setAguardandoTemaSimulado(false);
      } else if (response.data.pdf && response.data.nome) {
        setHistorico(prev => [
          ...prev,
          { tipo: 'assistente', texto: response.data.resposta },
        ]);
        setPdfDica({ url: response.data.pdf, nome: response.data.nome });
        setAguardandoCargoDica(false);
      } else if (response.data.resposta && response.data.resposta.includes('Sobre qual tema você deseja o simulado?')) {
        setHistorico(prev => [...prev, { tipo: 'assistente', texto: response.data.resposta }]);
        setAguardandoTemaSimulado(true);
      } else {
        setHistorico(prev => [...prev, { tipo: 'assistente', texto: response.data.resposta }]);
        setPdfDica(null);
        if (response.data.resposta && response.data.resposta.includes('Para qual cargo você deseja a dica de estudo?')) {
          setAguardandoCargoDica(true);
        } else {
          setAguardandoCargoDica(false);
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setHistorico(prev => [...prev, {
        tipo: 'erro',
        texto: '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
      }]);
    } finally {
      setLoading(false);
    }

    // Ao enviar mensagem, se for Free, incrementa contador
    if (isFree) {
      const hoje = new Date().toISOString().slice(0, 10);
      localStorage.setItem('chat_interacoes_data', hoje);
      const novoCount = interacoesHoje + 1;
      localStorage.setItem('chat_interacoes_count', String(novoCount));
      setInteracoesHoje(novoCount);
    }
  };

  const handleDownloadPlano = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        alert('Token de autenticação não encontrado. Faça login novamente.');
        return;
      }
      const response = await fetch('/api/download-plano', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Erro ao baixar o PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plano_de_estudos.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao baixar o PDF do plano de estudos. Gere um plano e tente novamente.');
      console.error('Erro no download do plano:', err);
    }
  };

  const handleVisualizarPlano = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        alert('Token de autenticação não encontrado. Faça login novamente.');
        return;
      }
      const response = await fetch('/api/view-plano', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Erro ao visualizar o PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      // Opcional: liberar a URL depois de um tempo
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err) {
      alert('Erro ao visualizar o PDF do plano de estudos. Gere um plano e tente novamente.');
      console.error('Erro ao visualizar o plano:', err);
    }
  };

  // Função para processar links na resposta
  const processarResposta = (texto) => {
    return { __html: transformLinks(texto) };
  };

  const handleClose = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  const handleLogout = async () => {
    await axios.post('/api/auth/logout');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    if (onClose) onClose();
    else navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header mais simples e clean */}
      <nav className="bg-blue-500 flex-shrink-0 px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleClose}
          className="text-white hover:bg-blue-600 rounded-full p-1 transition-colors"
          aria-label="Voltar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-white flex-1 text-center">Chatbot Assistente</h1>
      </nav>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-2 pt-2 pb-1">
          <div className="space-y-4">
            {historico.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.tipo !== 'usuario' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.tipo === 'usuario'
                      ? 'bg-blue-500 text-white'
                      : msg.tipo === 'erro'
                      ? 'bg-red-100 text-red-700'
                      : msg.tipo === 'resumoDica'
                      ? 'bg-green-50 border border-green-300 text-green-900'
                      : 'bg-white shadow-sm border border-gray-200'
                  }`}
                >
                  {msg.tipo === 'assistente' ? (
                    <div 
                      className="whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={processarResposta(msg.texto)}
                    />
                  ) : msg.tipo === 'resumoDica' ? (
                    <div>
                      <div className="whitespace-pre-wrap break-words mb-2">{msg.texto}</div>
                      <a
                        href={msg.pdf}
                        download={msg.nome + '.pdf'}
                        className="inline-block bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition"
                      >
                        Baixar PDF
                      </a>
                    </div>
                  ) : msg.tipo === 'arquivo' ? (
                    <div>
                      <a
                        href={msg.pdf}
                        download={msg.nome + '.pdf'}
                        className="inline-block bg-yellow-600 text-white px-4 py-2 rounded font-bold hover:bg-yellow-700 transition mb-2"
                      >
                        Baixar PDF
                      </a>
                      <div className="whitespace-pre-wrap break-words text-sm text-gray-700">{msg.texto}</div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.texto}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 pl-10 mt-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 flex-shrink-0">
                  <span className="text-white text-sm">🤖</span>
                </div>
                <div className="bg-gray-200 rounded-full px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            {pdfDica && (
              <div className="my-6">
                <PDFViewer pdfUrl={pdfDica.url} fileName={pdfDica.nome} />
              </div>
            )}
          </div>
        </div>
        <div className="px-2 pb-2">
          <SuggestedQuestions 
            questions={suggestedQuestions}
            onQuestionClick={handleSuggestedQuestionClick}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-2 bg-white flex items-center gap-2">
        <input
          type="text"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-none text-sm"
          disabled={loading || atingiuLimite}
          ref={inputRef}
          style={{ minHeight: 38 }}
        />
        <button
          type="submit"
          disabled={loading || !mensagem.trim() || atingiuLimite}
          className={`rounded-full p-2 transition-colors ${
            loading || !mensagem.trim() || atingiuLimite
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          aria-label="Enviar mensagem"
          style={{ minWidth: 38, minHeight: 38 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
      {isFree && (
        <div className="text-xs text-gray-500 mb-1 text-right px-2">
          {atingiuLimite
            ? 'Limite diário de perguntas atingido para o plano gratuito.'
            : `Perguntas restantes hoje: ${LIMITE_FREE - interacoesHoje}`}
        </div>
      )}
    </div>
  );
};

export default ChatAssistente; 