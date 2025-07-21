# Backend do Assistente de Estudos para Concursos de Florianópolis

## Visão Geral

Este backend foi projetado para ser modular, escalável e fácil de manter, atendendo a um assistente de estudos especializado em concursos de professores temporários de Florianópolis. Ele utiliza Node.js/Express e integra IA para respostas humanizadas, além de gerenciar PDFs, simulados, videoaulas e planos de estudo personalizados.

---

## Estrutura de Pastas

```
backend/
├── controllers/
│   └── assistantController.js   # Lógica principal do chat e orquestração dos fluxos
├── utils/
│   ├── apostilaUtils.js         # Busca inteligente de apostilas
│   ├── simuladoUtils.js         # Busca inteligente de simulados sem repetição
│   ├── pdfUtils.js              # Geração e manipulação de PDFs
│   ├── stringUtils.js           # Funções auxiliares para manipulação de strings
│   ├── state.js                 # Estados globais centralizados (em memória)
│   ├── interceptors.js          # Regex e interceptadores de intenção do chat
│   └── prompts.js               # Mensagens fixas e prompts do sistema
├── routes/
│   └── ...                      # Rotas Express (ex: /api/apostilas, /api/simulados)
├── editalEmbeddings.js          # Busca semântica no edital
└── ...
```

---

## Principais Módulos Utilitários

### `apostilaUtils.js`
- Busca apostilas por tema, nome parcial ou variações, tolerando erros e acentos.
- Exemplo de uso:
```js
const { buscarApostilaInteligente } = require('./utils/apostilaUtils');
const apostila = await buscarApostilaInteligente('português');
```

### `simuladoUtils.js`
- Busca simulados por tema, garantindo que não sejam repetidos para o mesmo usuário.
- Exemplo de uso:
```js
const { buscarSimuladoAleatorioSemRepetir } = require('./utils/simuladoUtils');
const simulado = await buscarSimuladoAleatorioSemRepetir('temas de educação', 'usuario@email.com');
```

### `pdfUtils.js`
- Gera PDFs a partir de HTML, cria apostilas personalizadas e novas versões baseadas em PDFs existentes.

### `stringUtils.js`
- Funções para normalizar, remover acentos e facilitar buscas tolerantes.

### `state.js`
- Centraliza todos os estados globais do sistema (em memória), facilitando futura migração para banco de dados.

### `interceptors.js`
- Regex e padrões para identificar intenções do usuário (ex: pedidos de videoaula, simulado, saudação, etc).

### `prompts.js`
- Centraliza todas as mensagens fixas e prompts do sistema, facilitando ajustes e padronização.

---

## Fluxo do Chat (Resumo)
- O controller recebe a mensagem do usuário e verifica, via interceptors, se é um pedido direto (ex: videoaula, simulado, apostila, saudação, dica).
- Se for, responde imediatamente usando as mensagens de `prompts.js`.
- Caso contrário, aciona a IA com o prompt adequado, usando contexto do edital e do usuário.
- Busca e envia PDFs, simulados ou planos de estudo conforme o fluxo e contexto.

---

## Expansão e Manutenção
- **Para adicionar novos fluxos**: crie um novo utilitário em `utils/` e adicione o interceptador correspondente.
- **Para alterar mensagens**: edite apenas o `prompts.js`.
- **Para integrar banco de dados**: adapte o `state.js` para persistência.
- **Para novos tipos de materiais**: siga o padrão dos utilitários existentes.

---

## Boas Práticas
- Sempre centralize lógica repetitiva em utilitários.
- Use os interceptadores para manter o controller limpo.
- Documente funções e fluxos especiais.
- Implemente testes unitários para utilitários críticos.

---

## Contato
Dúvidas ou sugestões? Fale com o desenvolvedor responsável. 