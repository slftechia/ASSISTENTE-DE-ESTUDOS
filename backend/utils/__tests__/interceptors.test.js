const interceptors = require('../interceptors');

describe('interceptors', () => {
  test('regexVideoaula detecta pedidos de videoaula', () => {
    expect(interceptors.regexVideoaula.test('Quero uma videoaula de português')).toBe(true);
    expect(interceptors.regexVideoaula.test('Tem vídeo de didática?')).toBe(true);
    expect(interceptors.regexVideoaula.test('Me mostre um vídeo')).toBe(true);
    expect(interceptors.regexVideoaula.test('Quero assistir video aulas')).toBe(true);
    expect(interceptors.regexVideoaula.test('Apostila de português')).toBe(false);
  });

  test('regexApostilaGenerica detecta pedidos de apostila', () => {
    expect(interceptors.regexApostilaGenerica.test('Quero uma apostila de português')).toBe(true);
    expect(interceptors.regexApostilaGenerica.test('Tem material de estudo?')).toBe(true);
    expect(interceptors.regexApostilaGenerica.test('Baixar apostila')).toBe(true);
    expect(interceptors.regexApostilaGenerica.test('Simulado de português')).toBe(false);
  });

  test('regexSimuladoGenerico detecta pedidos de simulado', () => {
    expect(interceptors.regexSimuladoGenerico.test('Quero um simulado de português')).toBe(true);
    expect(interceptors.regexSimuladoGenerico.test('Prova simulada de educação')).toBe(true);
    expect(interceptors.regexSimuladoGenerico.test('Teste simulado')).toBe(true);
    expect(interceptors.regexSimuladoGenerico.test('Apostila de português')).toBe(false);
  });

  test('regexSaudacao detecta saudações', () => {
    expect(interceptors.regexSaudacao.test('Olá')).toBe(true);
    expect(interceptors.regexSaudacao.test('Bom dia')).toBe(true);
    expect(interceptors.regexSaudacao.test('Oi!')).toBe(true);
    expect(interceptors.regexSaudacao.test('Boa noite.')).toBe(true);
    expect(interceptors.regexSaudacao.test('Quero uma apostila')).toBe(false);
  });
}); 