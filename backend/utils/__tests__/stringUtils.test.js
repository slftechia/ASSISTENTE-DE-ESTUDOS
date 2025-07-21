const { removeAcentos, removeAcentosLower } = require('../stringUtils');

describe('stringUtils', () => {
  test('removeAcentos remove acentos corretamente', () => {
    expect(removeAcentos('ação')).toBe('acao');
    expect(removeAcentos('Educação')).toBe('Educacao');
    expect(removeAcentos('Órgão')).toBe('Orgao');
    expect(removeAcentos('criança')).toBe('crianca');
    expect(removeAcentos('São José')).toBe('Sao Jose');
  });

  test('removeAcentosLower remove acentos e deixa minúsculo', () => {
    expect(removeAcentosLower('AÇÃO')).toBe('acao');
    expect(removeAcentosLower('Educação')).toBe('educacao');
    expect(removeAcentosLower('Órgão')).toBe('orgao');
    expect(removeAcentosLower('criança')).toBe('crianca');
    expect(removeAcentosLower('São José')).toBe('sao jose');
  });
}); 