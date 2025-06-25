require('dotenv').config();
console.log('ENV DEBUG:', {
  ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
  DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT,
  API_KEY: process.env.AZURE_OPENAI_API_KEY ? 'OK' : 'FALTA',
  API_VERSION: process.env.AZURE_OPENAI_API_VERSION,
  MODEL: process.env.AZURE_OPENAI_MODEL
});

const azureConfig = {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    modelName: process.env.AZURE_OPENAI_MODEL,
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
    subscriptionKey: process.env.AZURE_OPENAI_API_KEY,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION
};

module.exports = azureConfig; 