const express = require('express');
const router = express.Router();
const azureOpenAI = require('../services/azureOpenAI');
const authMiddleware = require('../middleware/auth');

// Protege todas as rotas de AI
router.use(authMiddleware);

// Análise de código
router.post('/analyze', async (req, res) => {
    try {
        const { code, context } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Código é obrigatório' });
        }

        const analysis = await azureOpenAI.analyzeCode(code, context || '');
        res.json({ analysis });
    } catch (error) {
        console.error('Erro na análise:', error);
        res.status(500).json({ error: 'Erro ao processar a análise' });
    }
});

// Geração de documentação
router.post('/documentation', async (req, res) => {
    try {
        const { code, language } = req.body;
        
        if (!code || !language) {
            return res.status(400).json({ error: 'Código e linguagem são obrigatórios' });
        }

        const documentation = await azureOpenAI.generateDocumentation(code, language);
        res.json({ documentation });
    } catch (error) {
        console.error('Erro na geração de documentação:', error);
        res.status(500).json({ error: 'Erro ao gerar documentação' });
    }
});

// Sugestões de melhorias
router.post('/improvements', async (req, res) => {
    try {
        const { code, context } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Código é obrigatório' });
        }

        const improvements = await azureOpenAI.suggestImprovements(code, context || '');
        res.json({ improvements });
    } catch (error) {
        console.error('Erro nas sugestões:', error);
        res.status(500).json({ error: 'Erro ao gerar sugestões' });
    }
});

// Explicação de código
router.post('/explain', async (req, res) => {
    try {
        const { code, language } = req.body;
        
        if (!code || !language) {
            return res.status(400).json({ error: 'Código e linguagem são obrigatórios' });
        }

        const explanation = await azureOpenAI.explainCode(code, language);
        res.json({ explanation });
    } catch (error) {
        console.error('Erro na explicação:', error);
        res.status(500).json({ error: 'Erro ao explicar código' });
    }
});

module.exports = router; 