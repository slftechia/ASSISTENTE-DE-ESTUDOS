# Guia de Configuração Local - Assistente de Estudos

## 1. Configuração do Backend

### 1.1 Instalar dependências
```bash
cd backend
npm install
```

### 1.2 Configurar variáveis de ambiente
Copie o arquivo `env.example` para `.env` e configure:

```bash
# No Windows PowerShell:
copy env.example .env
```

### 1.3 Configurações necessárias no .env:

**OBRIGATÓRIO:**
- `AZURE_OPENAI_API_KEY`: Sua chave do Azure OpenAI
- `MONGODB_URI`: URI do MongoDB (Atlas ou local)

**OPCIONAL:**
- `YOUTUBE_API_KEY`: Para funcionalidades de vídeo
- `GOOGLE_API_KEY`: Para busca web
- `MP_ACCESS_TOKEN`: Para pagamentos

### 1.4 Banco de dados
**Opção 1 - MongoDB Atlas (Recomendado):**
1. Acesse: https://cloud.mongodb.com
2. Crie uma conta gratuita
3. Crie um cluster
4. Copie a URI de conexão
5. Cole no `MONGODB_URI`

**Opção 2 - MongoDB Local:**
1. Instale MongoDB Community Server
2. Use: `mongodb://localhost:27017/assistente-estudos`

## 2. Configuração do Frontend

### 2.1 Instalar dependências
```bash
npm install
```

### 2.2 Configurar URL do backend
No arquivo `vite.config.js`, verifique se a URL do backend está correta.

## 3. Executar o Projeto

### 3.1 Backend (Terminal 1)
```bash
cd backend
npm run dev
```

### 3.2 Frontend (Terminal 2)
```bash
npm run dev
```

## 4. Acessar a aplicação
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

## 5. Testar funcionalidades
1. Cadastre um usuário
2. Teste o chat com IA
3. Teste as funcionalidades de apostilas e simulados
