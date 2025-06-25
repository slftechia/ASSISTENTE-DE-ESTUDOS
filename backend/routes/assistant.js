const express = require('express');
const router = express.Router();
const { getYoutubeVideos } = require('../controllers/openaiController');

// Rota do assistente
router.post('/chat', async (req, res) => {
  try {
    const { mensagem, nomeUsuario } = req.body;
    
    // Inicializa o objeto global se não existir
    if (!global.linksEnviadosPorUsuario) {
      global.linksEnviadosPorUsuario = {};
    }
    if (!global.temaVideoaulaUsuario) {
      global.temaVideoaulaUsuario = {};
    }
    const chaveUsuario = nomeUsuario || 'anonimo';
    // Lista de temas disponíveis (igual à página de videoaulas)
    const temasDisponiveis = [
      'Legislação Educacional',
      'Conhecimentos Pedagógicos',
      'Português',
      'Tendências Pedagógicas'
    ];
    
    // Detecta mudança de contexto
    const isDica = /dica/i.test(mensagem);
    const isSimulado = /simulado|prova simulada|teste/i.test(mensagem);
    const isApostila = /apostila|material de estudo|pdf/i.test(mensagem);
    const isVideo = /vídeo|videoaula|video aula|aula em vídeo|aula em video/i.test(mensagem);

    // Se o usuário pediu dica, simulado ou apostila, zera o estado de videoaula
    if (isDica || isSimulado || isApostila) {
      global.temaVideoaulaUsuario[chaveUsuario] = undefined;
      global.linksEnviadosPorUsuario[chaveUsuario] = [];
    }

    // Busca dinâmica no YouTube para pedidos específicos de vídeo
    const regexVideoEspecifico = /(vídeo|videoaula|aula)[^\w]*(sobre|de|do|da|acerca de|referente a)\s+(.+)/i;
    const matchEspecifico = mensagem.match(regexVideoEspecifico);
    if (matchEspecifico && matchEspecifico[3]) {
      const termoBusca = matchEspecifico[3].trim();
      if (termoBusca.length > 2) {
        const resultados = await getYoutubeVideos(termoBusca);
        if (resultados && resultados.length > 0) {
          let resposta = `📺 Vídeos encontrados no YouTube para <b>${termoBusca}</b> :<br><br>`;
          resultados.forEach((video, idx) => {
            resposta += `<b>${idx + 1}. ${video.titulo}</b><br><a href='${video.url}' target='_blank'>${video.url}</a><br><br>`;
          });
          return res.json({ resposta });
        } else {
          return res.json({ resposta: `Nenhum vídeo encontrado no YouTube para <b>${termoBusca}</b>.` });
        }
      }
    }

    // Se está aguardando o tema do usuário, trata primeiro
    if (global.temaVideoaulaUsuario[chaveUsuario] === null) {
      const temaEscolhido = temasDisponiveis.find(t => t.toLowerCase() === mensagem.trim().toLowerCase());
      if (!temaEscolhido) {
        let opcoes = temasDisponiveis.map(t => `- ${t}`).join('<br>');
        return res.json({ resposta: `Tema não reconhecido. Por favor, escolha uma das opções abaixo, digitando o nome exato:<br><br>${opcoes}` });
      }
      global.temaVideoaulaUsuario[chaveUsuario] = temaEscolhido;
      // Agora busca os links do tema
      const { extrairLinksDoTXT } = global;
      const todosLinks = await extrairLinksDoTXT();
      const linksTema = todosLinks.filter(par => par.titulo && par.titulo.toLowerCase().includes(temaEscolhido.toLowerCase()));
      if (!global.linksEnviadosPorUsuario[chaveUsuario]) global.linksEnviadosPorUsuario[chaveUsuario] = [];
      const enviados = global.linksEnviadosPorUsuario[chaveUsuario];
      const novos = linksTema.filter(par => !enviados.includes(par.link));
      if (novos.length === 0) {
        return res.json({ resposta: `Não há links disponíveis para o tema <b>${temaEscolhido}</b>. Escolha outro tema digitando o nome.` });
      }
      const respostaLinks = novos.slice(0, 3);
      respostaLinks.forEach(par => enviados.push(par.link));
      let resposta = `🎥 Encontrei estas videoaulas de <b>${temaEscolhido}</b> para você:<br><br>`;
      respostaLinks.forEach((par, idx) => {
        resposta += `<b>${idx + 1}. ${par.titulo}</b><br><a href='${par.link}' target='_blank'>${par.link}</a><br><br>`;
      });
      resposta += 'Se quiser mais, é só pedir novamente! Ou digite outro tema.';
      return res.json({ resposta });
    }

    // Solicitação genérica de videoaula: perguntar o tema preferido
    if (/vídeo|videoaula|video aula|aula em vídeo|aula em video|ver vídeo|ver video|me mostre um vídeo|me mostre uma videoaula|quero um vídeo|quero uma videoaula|sugira um vídeo|sugira uma videoaula|indique um vídeo|indique uma videoaula|tem vídeo|tem video|tem videoaula|tem vídeo aula|tem aula em vídeo|tem aula em video|assistir|ver aula|quero assistir|quero ver|me mostre|sugira|indique/i.test(mensagem)) {
      if (!global.temaVideoaulaUsuario[chaveUsuario]) {
        let opcoes = temasDisponiveis.map(t => `- ${t}`).join('<br>');
        global.temaVideoaulaUsuario[chaveUsuario] = null; // Marca que está aguardando tema
        return res.json({ resposta: `Sobre qual tema você quer a videoaula?<br>Escolha uma das opções abaixo, digitando o nome exato:<br><br>${opcoes}` });
      }
      const tema = global.temaVideoaulaUsuario[chaveUsuario];
      const { extrairLinksDoTXT } = global;
      const todosLinks = await extrairLinksDoTXT();
      const linksTema = todosLinks.filter(par => par.titulo && par.titulo.toLowerCase().includes(tema.toLowerCase()));
      if (!global.linksEnviadosPorUsuario[chaveUsuario]) global.linksEnviadosPorUsuario[chaveUsuario] = [];
      const enviados = global.linksEnviadosPorUsuario[chaveUsuario];
      const novos = linksTema.filter(par => !enviados.includes(par.link));
      if (novos.length === 0) {
        return res.json({ resposta: `Você já recebeu todos os links disponíveis para o tema <b>${tema}</b>! Se quiser, escolha outro tema digitando o nome.` });
      }
      const respostaLinks = novos.slice(0, 3);
      respostaLinks.forEach(par => enviados.push(par.link));
      let resposta = `🎥 Encontrei estas videoaulas de <b>${tema}</b> para você:<br><br>`;
      respostaLinks.forEach((par, idx) => {
        resposta += `<b>${idx + 1}. ${par.titulo}</b><br><a href='${par.link}' target='_blank'>${par.link}</a><br><br>`;
      });
      resposta += 'Se quiser mais, é só pedir novamente! Ou digite outro tema.';
      return res.json({ resposta });
    }

    // Para outras mensagens, retorna uma resposta padrão
    return res.json({
      resposta: 'Desculpe, não entendi sua solicitação. Você pode pedir por videoaulas, apostilas, simulados ou fazer perguntas sobre o edital.'
    });
  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({ 
      error: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.' 
    });
  }
});

module.exports = router; 