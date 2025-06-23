import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { saveAs } from 'file-saver';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ pdfUrl, fileName }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Tentando carregar PDF:', pdfUrl);
    setLoading(true);
    setError(null);
    setPageNumber(1);

    // Verificar se o arquivo existe
    fetch(pdfUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('PDF encontrado:', pdfUrl);
      })
      .catch(error => {
        console.error('Erro ao verificar PDF:', error);
        setError(`Erro ao acessar o PDF: ${error.message}`);
        setLoading(false);
      });
  }, [pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log('PDF carregado com sucesso. Páginas:', numPages);
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('Erro detalhado ao carregar PDF:', error);
    setError(`Não foi possível carregar o PDF. Erro: ${error.message}`);
    setLoading(false);
  };

  const handleDownload = async () => {
    try {
      console.log('Iniciando download do PDF:', pdfUrl);
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      saveAs(blob, fileName || 'documento.pdf');
      console.log('Download concluído com sucesso');
    } catch (error) {
      console.error('Erro detalhado ao baixar PDF:', error);
      setError(`Erro ao baixar o documento: ${error.message}`);
    }
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(newPageNumber, numPages));
    });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      {loading && (
        <div className="w-full text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Carregando PDF...</p>
        </div>
      )}

      {error && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="w-full bg-white rounded-lg shadow-lg p-4 relative">
        <button
          onClick={handleDownload}
          className="mb-4 w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Baixar PDF
        </button>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div>Carregando documento...</div>}
          error={<div>Erro ao carregar o PDF. Por favor, tente novamente.</div>}
        >
          {!error && numPages && (
            <div>
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="mx-auto my-4"
                  error={<div>Erro ao renderizar a página.</div>}
                />
              ))}
            </div>
          )}
        </Document>
        {/* Botão flutuante para retornar ao topo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            zIndex: 1000,
            background: '#2563eb',
            color: 'white',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: '1.5rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Retornar ao topo"
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default PDFViewer; 