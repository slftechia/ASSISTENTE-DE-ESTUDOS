# Assistente de Estudos - Professor Auxiliar

Sistema de assistência para candidatos à vaga de professor auxiliar em Florianópolis.

## Funcionalidades

- Interface inicial com login profissional
- Dashboard principal com 7 botões funcionais
- Visualização e organização de PDFs por temas
- Sistema de cache para melhor performance
- Integração com GPT e YouTube
- Interface responsiva e moderna

## Estrutura de Pastas

```
├── Conhecimentos_Especificos/
├── Portugues/
├── Temas_de_Educacao/
├── Apostilas_Simulados/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── pages/
├── backend/
└── scripts/
```

## Requisitos

- Node.js 16+
- PowerShell 5.1+
- Navegador moderno (Chrome, Firefox, Edge)

## Instalação

1. Clone o repositório
2. Execute o script de inicialização:
```powershell
.\start.ps1
```

O script irá:
- Criar as pastas necessárias
- Instalar as dependências
- Iniciar a aplicação

## Organização de PDFs

Para organizar PDFs nas pastas corretas:

1. Use a interface do sistema através do PDFOrganizer
2. Ou use o script PowerShell:
```powershell
.\move-pdfs.ps1 -sourceFile "caminho/do/arquivo.pdf" -targetFolder "pasta_destino"
```

## Funcionalidades do Visualizador de PDF

- Navegação por páginas
- Download de documentos
- Cache automático
- Normalização de nomes de arquivos
- Compressão automática

## Desenvolvimento

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commit das alterações
4. Envie um pull request

## Suporte

Em caso de problemas:

1. Verifique se todas as dependências estão instaladas
2. Confira se as pastas necessárias foram criadas
3. Verifique os logs de erro
4. Abra uma issue no repositório

## Licença

MIT