const path = require('path');
const fs = require('fs').promises;

// Middleware para cache de PDFs
const pdfCache = (req, res, next) => {
  // Cache por 1 hora
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
};

// Middleware para validação de PDFs
const validatePDF = async (req, res, next) => {
  try {
    const filePath = req.file?.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const fileExtension = path.extname(filePath).toLowerCase();
    if (fileExtension !== '.pdf') {
      await fs.unlink(filePath);
      return res.status(400).json({ error: 'Apenas arquivos PDF são permitidos' });
    }

    // Verificar se o arquivo existe
    await fs.access(filePath);
    next();
  } catch (error) {
    console.error('Erro na validação do PDF:', error);
    return res.status(500).json({ error: 'Erro ao processar o arquivo' });
  }
};

// Middleware para verificar existência do arquivo
const checkFileExists = async (req, res, next) => {
  try {
    const { tema, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'public', 'assets', tema, filename);

    await fs.access(filePath);
    req.filePath = filePath;
    next();
  } catch (error) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }
};

module.exports = {
  pdfCache,
  validatePDF,
  checkFileExists
}; 