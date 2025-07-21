const fs = require('fs').promises;
const { buscarSimuladoAleatorioSemRepetir } = require('../simuladoUtils');
const state = require('../state');

jest.mock('fs', () => ({ promises: { readdir: jest.fn() } }));

describe('simuladoUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Limpa o estado global de simulados enviados
    Object.keys(state.simuladosEnviadosUsuario).forEach(k => delete state.simuladosEnviadosUsuario[k]);
  });

  test('busca simulado por nome na raiz', async () => {
    fs.readdir.mockImplementationOnce(async (dir) => [
      'simulado_portugues.pdf',
      'simulado_educacao.pdf'
    ]);
    const result = await buscarSimuladoAleatorioSemRepetir('portugues', 'user1');
    expect(result).toBeTruthy();
    expect(result.filename).toBe('simulado_portugues.pdf');
  });

  test('não repete simulado já enviado', async () => {
    fs.readdir.mockImplementationOnce(async (dir) => [
      'simulado_portugues.pdf',
      'simulado_educacao.pdf'
    ]);
    // Envia o primeiro simulado
    const sim1 = await buscarSimuladoAleatorioSemRepetir('portugues', 'user1');
    // Marca como enviado
    state.simuladosEnviadosUsuario['user1portugues'] = [sim1.path];
    // Só resta um simulado disponível
    const sim2 = await buscarSimuladoAleatorioSemRepetir('portugues', 'user1');
    expect(sim2).toBeTruthy();
    expect(sim2.filename).not.toBe(sim1.filename);
    // Agora todos enviados
    state.simuladosEnviadosUsuario['user1portugues'].push(sim2.path);
    const sim3 = await buscarSimuladoAleatorioSemRepetir('portugues', 'user1');
    expect(sim3).toBeNull();
  });

  test('retorna null se não encontrar simulado', async () => {
    fs.readdir.mockImplementation(async (dir) => []);
    const result = await buscarSimuladoAleatorioSemRepetir('inexistente', 'user1');
    expect(result).toBeNull();
  });
}); 