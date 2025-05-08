const axios = require('axios');

// @desc    Gerar resposta do assistente virtual
// @route   POST /api/assistant/chat
// @access  Private
const chatWithAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    const { user } = req;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente de estudos especializado em ajudar professores a se prepararem para concursos da Prefeitura de Florianópolis. 
            Seu foco é em conteúdos das bancas Fepese e IBAD. 
            Forneça respostas claras, objetivas e baseadas em fatos.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      response: response.data.choices[0].message.content
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
  generateStudyPlan
}; 