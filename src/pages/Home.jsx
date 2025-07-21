import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ReactPlayer from 'react-player';
import axios from 'axios';

const ofertas = [
  { 
    img: '/img/ofertas/desconto.jpg', 
    titulo: '50% de Desconto', 
    desc: 'Na primeira mensalidade para novos alunos!',
    link: '/register'
  },
  { 
    img: '/img/ofertas/simulados.jpg', 
    titulo: 'Mais de 100 Provas Simuladas', 
    desc: 'Pratique com questões reais e atualizadas.',
    link: '/simulados'
  },
  { 
    img: '/img/ofertas/apostilas.jpg', 
    titulo: 'Apostilas por Tema', 
    desc: 'Material completo e organizado por disciplina.',
    link: '/apostilas'
  }
];

const apostilas = [
  // Todos os grupos e títulos removidos pois estão vazios
];

const categorias = [
  { nome: 'Professores', img: '/img/categorias/professores.jpg', link: '/apostilas' },
  { nome: 'Fiscais', img: '/img/categorias/fiscais.jpg', link: '/apostilas' },
  { nome: 'Tribunais', img: '/img/categorias/tribunais.jpg', link: '/apostilas' }
];

const depoimentos = [
  {
    nome: 'Maria Oliveira',
    texto: 'Fui aprovada no concurso de Florianópolis! O material é completo, atualizado e as videoaulas são excelentes. Recomendo a todos que querem aprovação.',
    cargo: 'Professora',
    foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=128&h=128&facepad=2'
  },
  {
    nome: 'João Silva',
    texto: 'Os simulados e mapas mentais foram essenciais para minha organização nos estudos. A plataforma é intuitiva e o suporte sempre me ajudou.',
    cargo: 'Fiscal',
    foto: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=128&h=128&facepad=2'
  },
  {
    nome: 'Ana Paula',
    texto: 'Nunca vi um conteúdo tão direcionado para o concurso de professores! Fui aprovada e indico para todos os colegas.',
    cargo: 'Orientadora',
    foto: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=128&h=128&facepad=2'
  },
  {
    nome: 'Carlos Mendes',
    texto: 'Apostilas bem organizadas, videoaulas claras e muitos exercícios. O teste grátis me convenceu a assinar!',
    cargo: 'Professor',
    foto: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=128&h=128&facepad=2'
  },
  {
    nome: 'Fernanda Souza',
    texto: 'O chatbot inteligente tirou todas as minhas dúvidas rapidamente. Fui aprovada e agradeço à equipe!',
    cargo: 'Supervisora',
    foto: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=facearea&w=128&h=128&facepad=2'
  }
];

const planos = [
  { 
    nome: 'Free', 
    desc: 'Teste grátis por 5 dias', 
    preco: 'R$ 0,00', 
    destaque: true,
    recursos: ['Acesso às 3 apostilas', '1 simulado básico', 'Suporte por e-mail']
  },
  { 
    nome: 'Mensal', 
    desc: 'Acesso ilimitado por mês. 1ª mensalidade R$ 47,92 (20% OFF), depois R$ 59,90/mês', 
    preco: 'R$ 47,92', 
    destaque: false,
    recursos: [
      'Todas as apostilas',
      'Simulados ilimitados',
      'Suporte prioritário',
      'Mapas mentais',
      '20% de desconto na primeira mensalidade!'
    ]
  },
  {
    nome: 'Semestral',
    desc: '6 meses de acesso. 1ª parcela R$ 35,69 (35% OFF), depois 5x R$ 54,90',
    preco: 'R$ 35,69 + 5x R$ 54,90',
    destaque: false,
    recursos: [
      'Todas as apostilas',
      'Simulados ilimitados',
      'Suporte prioritário',
      'Mapas mentais',
      'Promoção: 1ª parcela com 35% de desconto!'
    ]
  },
  { 
    nome: 'Anual', 
    desc: '12 meses de acesso. 1ª parcela R$ 24,95 (50% OFF), depois 11x R$ 49,90',
    preco: 'R$ 24,95 + 11x R$ 49,90',
    destaque: false,
    recursos: [
      'Todas as apostilas',
      'Simulados ilimitados',
      'Suporte prioritário',
      'Mapas mentais',
      'Promoção: 1ª parcela com 50% de desconto!'
    ]
  }
];

const capasAnuncios = [
  {
    img: '/img/capa_apostila_completa.png',
    titulo: 'Apostila Completa'
  },
  {
    img: '/img/capa_mapa_mental_pedagogia.png',
    titulo: 'Mapa Mental de Pedagogia'
  },
  {
    img: '/img/capa_conhecimentos_especificos.png',
    titulo: 'Conhecimentos Específicos'
  },
  {
    img: '/img/capa_portugues.png',
    titulo: 'Português'
  },
  {
    img: '/img/capa_temas_educacao.png',
    titulo: 'Temas de Educação'
  }
];

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000
};

export default function Home() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ email, senha });
      const token = user.token || (user.user && user.user.token);
      if (token) {
        localStorage.setItem('token', token);
      }
      // Redireciona para o ambiente geral se for admin
      if (user.email === 'admin@admin.com') {
        navigate('/ambiente/geral');
      } else {
        navigate('/assistente');
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const handleAmostraGratis = () => {
    navigate('/register');
  };

  const handleOpenVideo = (src) => {
    setVideoSrc(src);
    setShowVideoModal(true);
  };

  // Função para assinar plano
  const handleAssinarPlano = (plano) => {
    if (plano.nome === 'Free') {
      alert('Acesso liberado ao plano gratuito!');
      return;
    }
    // Redireciona para o cadastro, passando o plano escolhido
    navigate(`/register?plano=${plano.nome.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-x-hidden">
      {/* Fundo decorativo para toda a página (exceto hero) */}
      <img 
        src="/img/florianopolis.png" 
        alt="Fundo Florianópolis" 
        className="fixed top-0 left-0 w-full h-full object-cover opacity-10 pointer-events-none z-0 select-none hidden md:block" 
        style={{zIndex: 0}}
      />
      {/* Header com Login */}
      <div className="bg-white shadow z-10 relative">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Assistente de Estudos</h1>
            <div className="flex items-center gap-4">
              <form onSubmit={handleLogin} className="flex gap-2 items-center">
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  disabled={loading}
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            </div>
          </div>
          {error && (
            <div className="text-red-600 font-semibold mt-2 text-center">{error}</div>
          )}
        </div>
      </div>

      {/* Hero Section (agora no início) */}
      <div className="relative h-[500px] bg-gray-900 overflow-hidden animate-fade-in">
        <img 
          src="/img/av-beira-mar-florianopolis.jpg" 
          alt="Florianópolis" 
          className="w-full h-full object-cover opacity-60 blur-[1px] scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-blue-900/70 flex flex-col justify-center items-center">
          <div className="max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg animate-fade-in-up">
              Assistente de Estudos para <span className="text-yellow-300">Professores de Florianópolis</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mb-8 animate-fade-in-up delay-100">
              Prepare-se para o Processo Seletivo de Professores e auxiliares da Prefeitura de Florianópolis "EDIÇÃO 2025"<br/>
              Nossa plataforma oferece tudo o que você precisa para conquistar sua vaga na educação municipal.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
              <button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full text-xl shadow-xl transition-transform duration-300 hover:scale-105 animate-fade-in-up delay-200"
              >
                QUERO ME INSCREVER
              </button>
              <div className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-extrabold px-8 py-4 rounded-full shadow-lg text-lg md:text-xl border-2 border-white/30 animate-bounce min-w-[320px] text-center flex items-center justify-center gap-2">
                <span className="text-2xl">🎉</span> <span>30% de desconto para novos alunos!</span>
              </div>
            </div>
            <button
              onClick={handleAmostraGratis}
              className="mt-4 bg-white text-blue-600 font-bold py-4 px-10 rounded-full text-xl shadow-xl border-2 border-blue-500 hover:bg-blue-50 transition-transform duration-300 hover:scale-105 animate-fade-in-up delay-200"
            >
              TESTE GRÁTIS POR 7 DIAS SEM CADASTRAR CARTÃO
            </button>
            {/* Destaques rápidos */}
            <div className="flex flex-wrap gap-4 justify-center mt-8 animate-fade-in-up delay-300">
              <span className="bg-white/20 text-white px-4 py-2 rounded-full font-semibold shadow border border-white/30 flex items-center gap-2">
                <span role="img" aria-label="video">🎥</span> Videoaulas
              </span>
              <span className="bg-white/20 text-white px-4 py-2 rounded-full font-semibold shadow border border-white/30 flex items-center gap-2">
                <span role="img" aria-label="simulado">📝</span> Simulados
              </span>
              <span className="bg-white/20 text-white px-4 py-2 rounded-full font-semibold shadow border border-white/30 flex items-center gap-2">
                <span role="img" aria-label="material">📚</span> Material Exclusivo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Apostilas e Mapas Mentais */}
      <div className="max-w-7xl mx-auto my-12 px-4 z-10 relative">
        <h2 className="text-2xl font-bold mb-8 text-center">Materiais de Estudo</h2>
        {/* Carrossel dinâmico de cards de recursos com ícones */}
        <div className="max-w-5xl mx-auto mb-12">
          <Slider {...settings}>
            {/* Videoaulas */}
            <div className="flex flex-col items-center justify-between h-72 px-4 text-center">
              <div className="w-32 h-32 flex items-center justify-center bg-blue-100 rounded-full shadow mb-4 mx-auto overflow-hidden">
                <img src="/img/ILUSTRAÇÃO DE VIDEO AULA.jpg" alt="Capa Videoaulas" className="object-cover w-full h-full" />
              </div>
              <h4 className="font-bold text-lg text-blue-700 mb-2 w-full text-center">Videoaulas</h4>
              <p className="text-gray-600 text-center">Aulas em vídeo focadas no seu concurso, com professores experientes.</p>
              <button
                onClick={() => handleOpenVideo('/videos/videoaulas-demo.mp4')}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow transition"
              >
                Ver vídeo demonstrativo
              </button>
            </div>
            {/* Apostilas */}
            <div className="flex flex-col items-center justify-between h-72 px-4 text-center">
              <div className="w-32 h-32 flex items-center justify-center bg-yellow-100 rounded-full shadow mb-4 mx-auto">
                <span className="text-7xl text-yellow-600 flex items-center justify-center">📚</span>
              </div>
              <h4 className="font-bold text-lg text-yellow-700 mb-2 w-full text-center">Apostilas</h4>
              <p className="text-gray-600 text-center">Material completo, atualizado e organizado por disciplina e tema.</p>
              <button
                onClick={() => handleOpenVideo('/videos/apostilas-demo.mp4')}
                className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-full shadow transition"
              >
                Ver vídeo demonstrativo
              </button>
            </div>
            {/* Chatbot Inteligente */}
            <div className="flex flex-col items-center justify-between h-72 px-4 text-center">
              <div className="w-32 h-32 flex items-center justify-center bg-purple-100 rounded-full shadow mb-4 mx-auto">
                <span className="text-7xl text-purple-600 flex items-center justify-center">🤖</span>
              </div>
              <h4 className="font-bold text-lg text-purple-700 mb-2 w-full text-center">Chatbot Inteligente</h4>
              <p className="text-gray-600 text-center">Tire dúvidas e receba orientações de estudo com IA especializada.</p>
              <button
                onClick={() => handleOpenVideo('/videos/chatbot_demo.mp4')}
                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full shadow transition"
              >
                Ver vídeo demonstrativo
              </button>
            </div>
            {/* Provas Simuladas */}
            <div className="flex flex-col items-center justify-between h-72 px-4 text-center">
              <div className="w-32 h-32 flex items-center justify-center bg-pink-100 rounded-full shadow mb-4 mx-auto">
                <span className="text-7xl text-pink-600 flex items-center justify-center">📝</span>
              </div>
              <h4 className="font-bold text-lg text-pink-700 mb-2 w-full text-center">Provas Simuladas</h4>
              <p className="text-gray-600 text-center mb-2">Pratique com simulados reais e acompanhe seu desempenho.</p>
              <button
                onClick={() => handleOpenVideo('/videos/simulados-demo.mp4')}
                className="mt-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-full shadow transition"
              >
                Ver vídeo demonstrativo
              </button>
            </div>
          </Slider>
        </div>
      </div>

      {/* Depoimentos Profissionais e Informações Relevantes */}
      <div className="max-w-5xl mx-auto my-8 px-2 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch z-10 relative">
        {/* Depoimentos */}
        <div className="bg-white rounded shadow p-6 flex flex-col gap-4 justify-center">
          <h3 className="text-xl font-bold mb-2">Depoimentos de Alunos</h3>
          <div className="space-y-4">
            {depoimentos.map((dep, idx) => (
              <div key={idx} className="flex items-start gap-4 border-l-4 border-blue-500 pl-3 py-2">
                <img src={dep.foto} alt={dep.nome} className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 shadow" />
                <div>
                  <p className="text-gray-700 italic mb-1 text-sm">"{dep.texto}"</p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-semibold text-gray-800">{dep.nome}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{dep.cargo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Informações Relevantes */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded shadow p-6 flex flex-col justify-center gap-6">
          <h3 className="text-xl font-bold text-blue-800 mb-2">Resultados e Confiança</h3>
          <ul className="space-y-5">
            <li className="flex items-center gap-4">
              <span className="text-3xl">🏆</span>
              <span><b>Mais de 500 aprovações</b> em concursos</span>
            </li>
            <li className="flex items-center gap-4">
              <span className="text-3xl">📈</span>
              <span><b>Altíssimo índice</b> de usuários aprovados</span>
            </li>
            <li className="flex items-center gap-4">
              <span className="text-3xl">🕒</span>
              <span><b>Materiais atualizados</b> todo mês</span>
            </li>
            <li className="flex items-center gap-4">
              <span className="text-3xl">🤝</span>
              <span><b>Suporte rápido</b> e humanizado</span>
            </li>
            <li className="flex items-center gap-4">
              <span className="text-3xl">📍</span>
              <span><b>Conteúdo personalizado</b> para Florianópolis</span>
            </li>
            <li className="flex items-center gap-4">
              <span className="text-3xl">💡</span>
              <span>Somos muito mais que um curso, <b>somos seu assistente de estudos</b></span>
            </li>
            <li className="flex items-center gap-4 bg-white/60 rounded-lg px-3 py-2 shadow border-l-4 border-purple-400">
              <span className="text-3xl">🤖</span>
              <span><b>O único com um chatbot inteligente e humanizado</b></span>
            </li>
          </ul>
        </div>
      </div>

      {/* Planos de Assinatura */}
      <div className="max-w-7xl mx-auto my-12 px-4 z-10 relative">
        <h2 className="text-2xl font-bold mb-8 text-center">Planos de Assinatura</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {planos.map((plano, idx) => (
            <div 
              key={idx} 
              className={`bg-white rounded-lg shadow-md p-4 text-center border-2 flex flex-col h-full ${
                plano.destaque ? 'border-blue-600 transform scale-105' : 'border-gray-200'
              }`}
            >
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2">{plano.nome}</h3>
                <p className="text-gray-600 mb-4">{plano.desc}</p>
                <div className="text-3xl font-bold mb-6">{plano.preco}</div>
                <ul className="text-left mb-6 space-y-2 flex-1">
                  {plano.recursos.map((recurso, rIdx) => (
                    <li key={rIdx} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{recurso}</span>
                    </li>
                  ))}
                  {/* Preencher com itens invisíveis para igualar a altura dos cards */}
                  {plano.nome === 'Free' && Array(5 - plano.recursos.length).fill(0).map((_, idx) => (
                    <li key={`invisible-${idx}`} className="invisible">placeholder</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => {
                  if (plano.nome === 'Free') {
                    navigate('/register?plano=free');
                  } else {
                    handleAssinarPlano(plano);
                  }
                }}
                className="w-full px-6 py-3 rounded-lg font-bold transition bg-blue-600 text-white hover:bg-blue-700 mt-auto"
              >
                {plano.nome === 'Free' ? 'Testar Grátis' : 'Assinar Agora'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Banner de Promoção */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-12 mt-12 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Promoção Especial para Novos Alunos!</h2>
          <p className="text-xl mb-8">Descontos de 20%, 35% e 50% na primeira mensalidade</p>
          <div className="text-2xl font-extrabold tracking-wide mt-4">ASSINE JÁ</div>
        </div>
      </div>

      {/* Selo de desconto fora do hero, alinhado à esquerda */}
      <div className="w-full flex justify-start mt-4 mb-8 pl-8 z-10 relative">
        <div className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-extrabold px-4 py-1 rounded-full shadow-lg text-base border-2 border-white/30 animate-bounce max-w-xs text-center">
          🎉 de 20% a 50% de desconto para novas assinaturas!
        </div>
      </div>

      {/* Missão - agora ao final da página, incrementada */}
      <div className="max-w-4xl mx-auto my-16 text-center px-4 z-10 relative">
        <h2 className="text-3xl font-bold mb-4 text-blue-800">Nossa Missão</h2>
        <p className="text-gray-700 text-lg mb-4">
          Nossa missão é transformar a preparação para concursos públicos da Prefeitura de Florianópolis, oferecendo <b>educação acessível, personalizada e de alta qualidade</b> para todos os candidatos a professores e auxiliares.
        </p>
        <p className="text-gray-700 text-lg mb-2">
          <b>Unimos tecnologia e didática</b> para criar uma plataforma completa, com materiais exclusivos, simulados atualizados, videoaulas, mapas mentais e um <b>chatbot inteligente</b> que acompanha o aluno em cada etapa da jornada.
        </p>
        <p className="text-gray-700 text-lg mb-2">
          Nosso compromisso é com a <b>aprovação</b> e o <b>crescimento profissional</b> dos nossos usuários, promovendo suporte humanizado, atualização constante dos conteúdos e foco total nas necessidades do concurso de Florianópolis.
        </p>
        <p className="text-gray-700 text-lg">
          Somos mais que um curso: <b>somos seu assistente de estudos</b>, prontos para ajudar você a conquistar sua vaga na educação municipal!
        </p>
      </div>

      {/* Modal de vídeo demonstrativo */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full relative">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold"
              aria-label="Fechar"
            >
              ×
            </button>
            <ReactPlayer
              url={videoSrc}
              controls
              width="100%"
              height="320px"
              light="/img/ILUSTRAÇÃO DE VIDEO AULA.jpg"
              playing={showVideoModal}
              playIcon={
                <button style={{
                  background: 'rgba(255,0,0,0.92)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 64,
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}>
                  <svg width="32" height="32" viewBox="0 0 32 32"><polygon fill="#fff" points="6,4 26,16 6,28"/></svg>
                </button>
              }
            />
            <div className="mt-2 text-center text-gray-700 text-sm">Demonstração rápida dos principais recursos da plataforma.</div>
          </div>
        </div>
      )}

      {/* Novo card 'Mapas Mentais' */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12 mb-16">
        <div onClick={() => navigate('/apostilas')} className="cursor-pointer bg-pink-400 hover:bg-pink-500 transition text-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center">
          <span className="text-6xl mb-4">📚</span>
          <h2 className="text-2xl font-bold mb-2">Apostilas</h2>
          <p className="text-lg">Acesse apostilas organizadas por tema</p>
        </div>
        <div onClick={() => navigate('/simulados')} className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 transition text-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center">
          <span className="text-6xl mb-4">📝</span>
          <h2 className="text-2xl font-bold mb-2">Simulados</h2>
          <p className="text-lg">Prática com simulados específicos</p>
        </div>
        <div onClick={() => navigate('/dicas/professor_iniciais')} className="cursor-pointer bg-green-400 hover:bg-green-500 transition text-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center">
          <span className="text-6xl mb-4">💡</span>
          <h2 className="text-2xl font-bold mb-2">Dicas de Estudo</h2>
          <p className="text-lg">Aprenda técnicas eficientes</p>
        </div>
        <div onClick={() => navigate('/videoaulas')} className="cursor-pointer bg-blue-400 hover:bg-blue-500 transition text-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center">
          <span className="text-6xl mb-4">🎥</span>
          <h2 className="text-2xl font-bold mb-2">Videoaulas</h2>
          <p className="text-lg">Assista aulas selecionadas</p>
        </div>
        <div onClick={() => navigate('/mapas-mentais')} className="cursor-pointer bg-purple-500 hover:bg-purple-600 transition text-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center">
          <span className="text-6xl mb-4">🧠</span>
          <h2 className="text-2xl font-bold mb-2">Mapas Mentais</h2>
          <p className="text-lg">Visualize mapas mentais dos principais temas</p>
        </div>
      </div>

      {/* Link discreto para o painel administrativo */}
      <div className="text-center mt-8 mb-4">
        <Link 
          to="/admin" 
          className="text-gray-400 hover:text-gray-600 text-sm underline"
        >
          Painel Administrativo
        </Link>
      </div>
    </div>
  );
}