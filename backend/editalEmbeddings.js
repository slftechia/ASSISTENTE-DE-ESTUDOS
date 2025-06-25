const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Função para dividir texto em parágrafos (ou blocos de até 500 caracteres)
function dividirEmParagrafos(texto, tamanhoMax = 500) {
  const paragrafos = texto.split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 0);
  // Se algum parágrafo for muito grande, divide em blocos menores
  let blocos = [];
  paragrafos.forEach(p => {
    if (p.length > tamanhoMax) {
      for (let i = 0; i < p.length; i += tamanhoMax) {
        blocos.push(p.slice(i, i + tamanhoMax));
      }
    } else {
      blocos.push(p);
    }
  });
  return blocos;
}

// Função para gerar embedding de um texto
async function gerarEmbedding(texto) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: texto
  });
  return response.data[0].embedding;
}

// Função para calcular similaridade de cosseno entre dois vetores
function similaridadeCosseno(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

// Função principal para processar o edital
async function processarEdital(editalTexto) {
  const blocos = dividirEmParagrafos(editalTexto);
  const embeddings = [];
  for (let i = 0; i < blocos.length; i++) {
    const embedding = await gerarEmbedding(blocos[i]);
    embeddings.push({ texto: blocos[i], embedding });
  }
  return embeddings;
}

// Função para buscar o(s) parágrafo(s) mais relevante(s) para uma pergunta
async function buscarNoEditalSemantico(pergunta, embeddings, topK = 3) {
  const embeddingPergunta = await gerarEmbedding(pergunta);
  // Calcula similaridade para cada bloco
  const resultados = embeddings.map(e => ({
    texto: e.texto,
    score: similaridadeCosseno(embeddingPergunta, e.embedding)
  }));
  // Ordena por score decrescente
  resultados.sort((a, b) => b.score - a.score);
  return resultados.slice(0, topK);
}

module.exports = {
  dividirEmParagrafos,
  gerarEmbedding,
  processarEdital,
  buscarNoEditalSemantico
}; 