// Interceptadores e padrões regex para o chat do assistente

const regexVideoaula = /(vídeo|videoaula|aula|assistir|ver vídeo|ver aula|um vídeo|uma videoaula|me mostre|mostrar vídeo|mostrar aula)/i;

const regexApostilaGenerica = /\b(apostila|pdf|material de estudo|material para estudar|baixar material|baixar apostila|apostilas)\b/i;
const regexSimuladoGenerico = /\b(simulado|prova simulada|prova teste|teste simulado|simulados|provas simuladas|provas testes|testes simulados)\b/i;
const regexApostilaComTema = /apostila(?: de)? ([\wÀ-ÿ ]+)/i;
const regexSimuladoComTema = /simulado(?: de)? ([\wÀ-ÿ ]+)/i;
const regexSimuladoOutro = /^(outro|mais um|diferente|quero outro|me envie outro|me mostre outro|outro, por favor)$/i;
const regexSaudacao = /^(ol[áa]|oi|boa tarde|bom dia|boa noite)[!,. ]*$/i;
const regexDica = /dica/i;
const regexSimuladoPedidoTema = /(\bsimulado\b|prova simulada|prova teste|teste simulado|um simulado|me mostre um simulado|quero um simulado|simulado para)/i;

module.exports = {
  regexVideoaula,
  regexApostilaGenerica,
  regexSimuladoGenerico,
  regexApostilaComTema,
  regexSimuladoComTema,
  regexSimuladoOutro,
  regexSaudacao,
  regexDica,
  regexSimuladoPedidoTema
}; 