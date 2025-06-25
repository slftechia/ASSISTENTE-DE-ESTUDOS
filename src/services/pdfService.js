import { PDFDocument } from 'pdf-lib';
import axios from 'axios';

class PDFService {
  constructor() {
    this.cache = new Map();
    this.baseURL = '/api'; // URL base do backend
  }

  async loadPDF(url, forceRefresh = false) {
    if (!forceRefresh && this.cache.has(url)) {
      console.log('Retornando PDF do cache:', url);
      return this.cache.get(url);
    }

    try {
      console.log('Carregando PDF do servidor:', url);
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });

      const arrayBuffer = response.data;
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      this.cache.set(url, {
        document: pdfDoc,
        buffer: arrayBuffer,
        timestamp: Date.now()
      });

      console.log('PDF carregado e armazenado em cache:', url);
      return this.cache.get(url);
    } catch (error) {
      console.error('Erro detalhado ao carregar PDF:', error);
      if (error.response) {
        throw new Error(`Erro do servidor: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('Não foi possível conectar ao servidor');
      } else {
        throw new Error(`Erro ao processar PDF: ${error.message}`);
      }
    }
  }

  async normalizePDFName(fileName) {
    try {
      return fileName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_\.]/g, '_')
        .toLowerCase();
    } catch (error) {
      console.error('Erro ao normalizar nome do arquivo:', error);
      return fileName.replace(/[^a-zA-Z0-9-_\.]/g, '_');
    }
  }

  clearCache() {
    console.log('Limpando cache de PDFs');
    this.cache.clear();
  }

  removeFromCache(url) {
    console.log('Removendo PDF do cache:', url);
    this.cache.delete(url);
  }

  async compressPDF(arrayBuffer) {
    try {
      console.log('Comprimindo PDF...');
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const compressedPDF = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      console.log('PDF comprimido com sucesso');
      return compressedPDF;
    } catch (error) {
      console.error('Erro ao comprimir PDF:', error);
      return arrayBuffer;
    }
  }

  isExpired(cacheEntry) {
    const CACHE_DURATION = 1000 * 60 * 60; // 1 hora
    return Date.now() - cacheEntry.timestamp > CACHE_DURATION;
  }

  async cleanExpiredCache() {
    console.log('Limpando cache expirado...');
    for (const [url, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        console.log('Removendo PDF expirado do cache:', url);
        this.cache.delete(url);
      }
    }
  }

  // Novo método para verificar se um PDF existe
  async checkPDFExists(url) {
    try {
      // Garante que a URL seja sempre relativa ao frontend
      let relativeUrl = url;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const parser = document.createElement('a');
        parser.href = url;
        relativeUrl = parser.pathname + parser.search + parser.hash;
      }
      // Força o uso do mesmo host do frontend
      if (!relativeUrl.startsWith('/')) {
        relativeUrl = '/' + relativeUrl;
      }
      console.log('Verificando existência do PDF:', relativeUrl);
      const response = await axios.head(relativeUrl, { baseURL: '' });
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao verificar PDF:', error);
      return false;
    }
  }
}

export const pdfService = new PDFService(); 