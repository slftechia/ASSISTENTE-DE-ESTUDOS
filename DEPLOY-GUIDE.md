# Guia de Deploy - Assistente de Estudos para Azure

## 📋 Pré-requisitos

1. **Conta Azure ativa**
2. **Azure DevOps configurado**
3. **Repositório Git configurado**

## 🚀 Passos para Deploy

### 1. Preparar o Repositório

```bash
# Verificar se está no branch main
git checkout main

# Adicionar todas as alterações
git add .

# Commit das alterações
git commit -m "Deploy: Versão atualizada para produção"

# Push para o Azure DevOps
git push origin main
```

### 2. Configurar Azure DevOps

1. **Acesse o Azure DevOps**
2. **Vá em Pipelines > Pipelines**
3. **Crie um novo pipeline**
4. **Selecione "Azure Repos Git"**
5. **Escolha o repositório**
6. **Selecione "Existing Azure Pipelines YAML file"**
7. **Escolha o arquivo: `/azure-pipelines.yml`**

### 3. Configurar Variáveis de Ambiente

No Azure DevOps, configure as seguintes variáveis:

#### Backend (Azure Web App)
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_MODEL`
- `AZURE_OPENAI_API_VERSION`
- `MONGODB_URI`
- `JWT_SECRET`
- `YOUTUBE_API_KEY`
- `GOOGLE_SEARCH_ENGINE_ID`
- `MP_ACCESS_TOKEN`
- `CACHE_TTL`
- `PORT`

#### Frontend (Azure Static Web App)
- `VITE_API_URL` (URL do backend)

### 4. Configurar Azure Resources

#### Backend - Azure Web App
1. **Criar Web App no Azure**
   - Nome: `portal-api-assistente-estudos`
   - Runtime: Node.js 18
   - OS: Linux

#### Frontend - Azure Static Web App
1. **Criar Static Web App no Azure**
   - Nome: `portal-web-assistente-estudos`
   - Build Preset: React

### 5. Configurar Domínios

#### URLs de Produção:
- **Backend**: `https://portal-api-assistente-estudos.azurewebsites.net`
- **Frontend**: `https://portal-web-assistente-estudos.azurewebsites.net`

### 6. Executar Deploy

1. **No Azure DevOps, execute o pipeline**
2. **Aguarde o build e deploy**
3. **Verifique os logs se houver erros**

## 🔧 Configurações Específicas

### Backend (server.js)
- Porta: Configurada via variável de ambiente
- CORS: Já configurado para domínios de produção
- MongoDB: Conecta via URI do Atlas

### Frontend (vite.config.js)
- Build: Otimizado para produção
- API Proxy: Configurado para backend de produção

## 📊 Monitoramento

### Logs do Backend
- Azure Web App > Logs > Log stream
- Azure Web App > Diagnose and solve problems

### Logs do Frontend
- Azure Static Web App > Monitoring > Logs

## 🧪 Testes Pós-Deploy

1. **Testar login admin:**
   - Email: `admin@admin.com`
   - Senha: `admin123`

2. **Testar funcionalidades:**
   - Cadastro de usuário
   - Chat com IA
   - Acesso a apostilas
   - Simulados

## 🔄 Deploy Automático

O pipeline está configurado para:
- Trigger automático no push para `main`
- Build e deploy automático
- Rollback automático em caso de erro

## 📞 Suporte

Em caso de problemas:
1. Verificar logs no Azure DevOps
2. Verificar logs no Azure Portal
3. Testar endpoints individualmente
4. Verificar variáveis de ambiente
