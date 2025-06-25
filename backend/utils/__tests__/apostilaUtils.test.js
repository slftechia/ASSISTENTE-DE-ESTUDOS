const path = require('path');
const fs = require('fs').promises;
const { buscarApostilaInteligente } = require('../apostilaUtils');

jest.mock('fs', () => ({ promises: { readdir: jest.fn() } }));

describe('apostilaUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('busca apostila por nome exato na raiz', async () => {
    fs.readdir.mockImplementationOnce(async (dir) => [
      'apostila_completa.pdf',
      'apostila_portugues.pdf',
      'apostila_temas_educacao.pdf'
    ]);
    const result = await buscarApostilaInteligente('completa');
    expect(result).toBeTruthy();
    expect(result.filename).toBe('apostila_completa.pdf');
  });

  test('busca apostila por nome parcial em subpasta', async () => {
    fs.readdir
      .mockImplementationOnce(async (dir) => ['portugues', 'temas_educacao']) // subpastas
      .mockImplementationOnce(async (dir) => ['apostila_portugues.pdf']) // arquivos em portugues
      .mockImplementationOnce(async (dir) => ['apostila_temas_educacao.pdf']); // arquivos em temas_educacao
    const result = await buscarApostilaInteligente('portugues');
    expect(result).toBeTruthy();
    expect(result.filename).toBe('apostila_portugues.pdf');
  });

  test('retorna null se não encontrar apostila', async () => {
    fs.readdir.mockImplementation(async (dir) => []);
    const result = await buscarApostilaInteligente('inexistente');
    expect(result).toBeNull();
  });
}); 