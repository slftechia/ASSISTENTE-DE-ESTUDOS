const { OpenAI } = require('openai');
const azureConfig = require('../config/azure');
const CacheService = require('./cache');
const crypto = require('crypto');

class AzureOpenAIService {
    constructor() {
        this.client = new OpenAI({
            apiKey: azureConfig.subscriptionKey,
            baseURL: `${azureConfig.endpoint}/openai/deployments/${azureConfig.deployment}`,
            defaultQuery: { 'api-version': azureConfig.apiVersion },
            defaultHeaders: { 'api-key': azureConfig.subscriptionKey },
        });
    }

    generateCacheKey(content) {
        return crypto.createHash('md5').update(content).digest('hex');
    }

    async generateResponse(messages, options = {}) {
        try {
            const cacheKey = this.generateCacheKey(JSON.stringify(messages));
            
            return await CacheService.getOrSet(cacheKey, async () => {
                const response = await this.client.chat.completions.create({
                    messages: messages,
                    max_tokens: options.maxTokens || 800,
                    temperature: options.temperature || 1.0,
                    top_p: options.topP || 1.0,
                    frequency_penalty: options.frequencyPenalty || 0.0,
                    presence_penalty: options.presencePenalty || 0.0,
                });

                return response.choices[0].message.content;
            });
        } catch (error) {
            console.error('Erro ao gerar resposta do Azure OpenAI:', error);
            throw error;
        }
    }

    async analyzeCode(code, context) {
        const messages = [
            {
                role: "system",
                content: "Você é um assistente especializado em análise e otimização de código."
            },
            {
                role: "user",
                content: `Analise o seguinte código e contexto:\n\nCódigo:\n${code}\n\nContexto:\n${context}`
            }
        ];

        return this.generateResponse(messages);
    }

    async generateDocumentation(code, language) {
        const messages = [
            {
                role: "system",
                content: `Você é um especialista em documentação de código ${language}.`
            },
            {
                role: "user",
                content: `Gere documentação detalhada para o seguinte código ${language}:\n\n${code}`
            }
        ];

        return this.generateResponse(messages);
    }

    async suggestImprovements(code, context) {
        const messages = [
            {
                role: "system",
                content: "Você é um especialista em otimização e boas práticas de código."
            },
            {
                role: "user",
                content: `Sugira melhorias para o seguinte código, considerando o contexto:\n\nCódigo:\n${code}\n\nContexto:\n${context}`
            }
        ];

        return this.generateResponse(messages);
    }

    async explainCode(code, language) {
        const messages = [
            {
                role: "system",
                content: `Você é um professor especializado em explicar código ${language} de forma didática.`
            },
            {
                role: "user",
                content: `Explique detalhadamente como funciona o seguinte código ${language}:\n\n${code}`
            }
        ];

        return this.generateResponse(messages);
    }
}

module.exports = new AzureOpenAIService(); 