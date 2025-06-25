const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const pdfPath = path.join(__dirname, '../frontend/public/pdfs/video aulas/links de video aulas.pdf');
const txtPath = path.join(__dirname, '../frontend/public/pdfs/video aulas/links.txt');

async function extrairLinksDoPDF() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const linhas = data.text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const pares = [];
    for (let i = 0; i < linhas.length - 1; i++) {
      if (linhas[i+1].startsWith('https://www.youtube.com/')) {
        pares.push(linhas[i]); // título
        pares.push(linhas[i+1]); // link
        i++; // pular o link na próxima iteração
      }
    }
    fs.writeFileSync(txtPath, pares.join('\n'), 'utf-8');
    console.log(`Foram extraídos ${pares.length/2} pares de título+link e salvos em links.txt`);
  } catch (error) {
    console.error('Erro ao extrair links do PDF:', error);
  }
}

extrairLinksDoPDF(); 