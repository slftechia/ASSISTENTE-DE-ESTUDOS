const azureOpenAI = require('./services/azureOpenAI');

async function testAzureIntegration() {
    try {
        console.log('Iniciando teste de integração com Azure OpenAI...');
        
        const testCode = `
            function calcularMedia(notas) {
                const soma = notas.reduce((acc, nota) => acc + nota, 0);
                return soma / notas.length;
            }
        `;
        
        const testContext = 'Teste de integração com Azure OpenAI - Análise de função de cálculo de média';
        
        console.log('Enviando requisição para análise...');
        const analysis = await azureOpenAI.analyzeCode(testCode, testContext);
        
        console.log('\nResposta recebida:');
        console.log('-------------------');
        console.log(analysis);
        console.log('-------------------');
        
    } catch (error) {
        console.error('Erro no teste:', error);
    }
}

testAzureIntegration(); 