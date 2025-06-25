import React, { useState, useEffect } from 'react';
import { pdfService } from '../services/pdfService';

const PDFOrganizer = ({ onFileMove }) => {
  const [folders, setFolders] = useState([
    'Conhecimentos_Especificos',
    'Portugues',
    'Temas_de_Educacao',
    'Apostilas_Simulados'
  ]);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [targetFolder, setTargetFolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleFolderSelect = (event) => {
    setTargetFolder(event.target.value);
  };

  const moveFiles = async () => {
    if (!targetFolder || selectedFiles.length === 0) {
      setMessage('Selecione arquivos e uma pasta destino');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const movedFiles = [];
      
      for (const file of selectedFiles) {
        const normalizedName = await pdfService.normalizePDFName(file.name);
        movedFiles.push({
          originalName: file.name,
          normalizedName,
          targetFolder
        });
      }

      onFileMove(movedFiles);
      setMessage('Arquivos movidos com sucesso!');
      setSelectedFiles([]);
      setTargetFolder('');
    } catch (error) {
      console.error('Erro ao mover arquivos:', error);
      setMessage('Erro ao mover os arquivos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Organizador de PDFs</h2>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Selecionar PDFs
        </label>
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Pasta Destino
        </label>
        <select
          value={targetFolder}
          onChange={handleFolderSelect}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione uma pasta</option>
          {folders.map((folder) => (
            <option key={folder} value={folder}>
              {folder.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold mb-2">Arquivos Selecionados:</h3>
          <ul className="list-disc pl-5">
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={moveFiles}
        disabled={loading || !targetFolder || selectedFiles.length === 0}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300"
      >
        {loading ? 'Movendo arquivos...' : 'Mover Arquivos'}
      </button>

      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('Erro') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default PDFOrganizer; 