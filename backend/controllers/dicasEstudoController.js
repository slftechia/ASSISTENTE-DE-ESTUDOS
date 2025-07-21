const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const dicasEstudo = [
  {
    title: 'Como Organizar seus Estudos',
    file: 'organizacao-estudos.pdf'
  },
  {
    title: 'Técnicas de Memorização',
    file: 'tecnicas-memorizacao.pdf'
  },
  {
    title: 'Como Fazer um Cronograma Eficiente',
    file: 'cronograma-estudos.pdf'
  },
  {
    title: 'Dicas para Redação',
    file: 'dicas-redacao.pdf'
  }
];

// Função para extrair resumo do PDF
async function extrairResumoPDF(pdfFile) {
  const pdfPath = path.join(__dirname, '..', 'uploads', 'dicas', pdfFile);
  const dataBuffer = await fs.promises.readFile(pdfPath);
  const data = await pdfParse(dataBuffer);
  let texto = data.text.trim().split('\n').filter(Boolean).join(' ');
  if (texto.length > 1000) texto = texto.slice(0, 1000) + '...';
  return texto;
}

// Endpoint para retornar resumo e link de download
exports.getDicasEstudo = async (req, res) => {
  try {
    const dicasComResumo = await Promise.all(
      dicasEstudo.map(async (dica) => {
        let resumo = '';
        try {
          resumo = await extrairResumoPDF(dica.file);
        } catch (e) {
          resumo = 'Resumo indisponível no momento.';
        }
        return {
          title: dica.title,
          resumo,
          mensagem: 'Para mais dicas de estudos, pegadinhas, plano de estudos e muito mais, faça o download do PDF.',
          path: `/uploads/dicas/${dica.file}`
        };
      })
    );
    res.json(dicasComResumo);
  } catch (error) {
    console.error('Erro ao buscar dicas de estudo:', error);
    res.status(500).json({ message: 'Erro ao buscar dicas de estudo' });
  }
};

// Mantém o endpoint de download
exports.getDicaEstudo = async (req, res) => {
  try {
    const { id } = req.params;
    const dica = dicasEstudo[id];
    
    if (!dica) {
      return res.status(404).json({ message: 'Dica não encontrada' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'dicas', dica.file);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Erro ao baixar dica de estudo:', error);
    res.status(500).json({ message: 'Erro ao baixar dica de estudo' });
  }
}; 