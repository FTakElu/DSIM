# ✅ CHECKLIST DEPLOY - WebSocket + SNS

## 🎯 Status Atual

### ✅ Concluído Localmente:
- [x] Tópico SNS criado: `arn:aws:sns:us-east-1:565757789330:DSIM-Alertas`
- [x] Código commitado e enviado ao GitHub
- [x] Backend compilando sem erros
- [x] Frontend com WebSocket integrado
- [x] Documentação completa criada

### ⏳ Pendente no EC2:
- [ ] Atualizar código do GitHub
- [ ] Instalar dependências (socket.io, @aws-sdk/client-sns)
- [ ] Compilar TypeScript
- [ ] Adicionar SNS_TOPIC_ARN ao .env
- [ ] Reiniciar PM2

---

## 🚀 DEPLOY NO EC2 - PASSO A PASSO

### 📋 Pré-requisitos
- Instância EC2 rodando
- Chave SSH (dsim_keypair.pem)
- Git configurado
- PM2 instalado

---

## 🔧 Opção 1: Conexão Manual (Recomendado)

### 1. Abrir Terminal

**Windows CMD:**
```cmd
cd "c:\Users\flavi\OneDrive\Área de Trabalho\DSIM\Desenvolvimento\3.Implementação\CERTIFICADOS"
```

### 2. Conectar ao EC2

```cmd
ssh -i dsim_keypair.pem ubuntu@98.95.251.71
```

**Se der erro de permissão:**
- Botão direito em `dsim_keypair.pem` → Propriedades
- Segurança → Avançado → Desabilitar herança
- Remover todos os usuários exceto você
- Adicionar apenas permissão de Leitura

### 3. Atualizar Código

```bash
cd DSIM-COD/backend
git pull origin main
```

**Esperado:** `Already up to date.` ou lista de arquivos atualizados

### 4. Instalar Dependências

```bash
npm install
```

**Novos pacotes instalados:**
- socket.io (WebSocket server)
- @aws-sdk/client-sns (Notificações)

### 5. Compilar TypeScript

```bash
npm run build
```

**Deve compilar sem erros!**

### 6. Configurar SNS

```bash
nano .env
```

**Adicione ao final do arquivo:**
```
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:565757789330:DSIM-Alertas
```

**Salvar:**
- `Ctrl + O` (salvar)
- `Enter` (confirmar)
- `Ctrl + X` (sair)

### 7. Reiniciar Backend

```bash
pm2 restart dsim-backend
```

### 8. Verificar Status

```bash
pm2 status
```

**Esperado: status = online**

```bash
pm2 logs dsim-backend --lines 30
```

**Deve mostrar:**
```
🚀 Servidor rodando na porta 9999
✅ Conectado ao DynamoDB
🔌 WebSocket Server inicializado
```

---

## 🧪 TESTES

### Teste 1: API REST

```bash
curl http://98.95.251.71:9999/health
```

**Esperado:** `{"status":"ok",...}`

### Teste 2: WebSocket (no navegador)

Acesse o frontend e veja no console:
```
🔌 WebSocket conectado
📡 Cliente inscrito em todos os pacientes
```

### Teste 3: SNS (opcional)

No EC2:
```bash
cd DSIM-COD/backend
node -e "
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
require('dotenv').config();
const sns = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
});
sns.send(new PublishCommand({
  TopicArn: process.env.SNS_TOPIC_ARN,
  Subject: 'Teste DSIM',
  Message: 'Sistema funcionando!'
})).then(() => console.log('✅ Enviado!')).catch(console.error);
"
```

---

## 📊 Comandos Úteis PM2

```bash
# Ver status
pm2 status

# Logs em tempo real
pm2 logs dsim-backend

# Reiniciar
pm2 restart dsim-backend

# Parar
pm2 stop dsim-backend

# Deletar e recriar
pm2 delete dsim-backend
pm2 start dist/server.js --name dsim-backend

# Monitoramento
pm2 monit
```

---

## 🔍 Troubleshooting

### ❌ Problema: SSH não conecta

**Solução:**
1. Verificar instância EC2 está rodando no AWS Console
2. Verificar Security Group permite porta 22 (SSH)
3. Corrigir permissões da chave:
   ```bash
   # Linux/Mac
   chmod 400 dsim_keypair.pem
   
   # Windows: usar interface gráfica (Propriedades > Segurança)
   ```

### ❌ Problema: "Cannot find module 'socket.io'"

**Solução:**
```bash
cd DSIM-COD/backend
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart dsim-backend
```

### ❌ Problema: Backend status "errored"

**Solução:**
```bash
pm2 logs dsim-backend --lines 50
# Ler o erro específico
```

### ❌ Problema: WebSocket não conecta (CORS)

**Verificar em `src/server.ts`:**
```typescript
cors: {
  origin: [
    'http://localhost:5173',
    'https://main.d2cq9un5umdfmy.amplifyapp.com'  // SEU DOMÍNIO
  ]
}
```

### ❌ Problema: SNS não envia

**Verificar:**
1. `SNS_TOPIC_ARN` está no `.env`?
2. Credenciais AWS válidas?
3. Emails confirmaram a inscrição?

---

## ✅ CHECKLIST FINAL

Após seguir todos os passos:

- [ ] SSH conectou ao EC2
- [ ] Código atualizado com `git pull`
- [ ] `npm install` executado
- [ ] `npm run build` sem erros
- [ ] `SNS_TOPIC_ARN` adicionado ao `.env`
- [ ] `pm2 restart dsim-backend` executado
- [ ] `pm2 status` mostra "online"
- [ ] `pm2 logs` sem erros
- [ ] API REST funciona: `curl http://98.95.251.71:9999/health`
- [ ] Frontend mostra "🔌 Tempo real ativo" (verde)
- [ ] Console do navegador sem erros de WebSocket
- [ ] (Opcional) SNS envia email de teste

---

## 📝 Resumo dos Arquivos Importantes

```
backend/
├── src/
│   ├── server.ts              ✅ Socket.io integrado
│   ├── websocket.ts           ✅ Novo (Socket.io rooms)
│   ├── services/
│   │   └── sns-service.ts     ✅ Novo (SNS alerts)
│   └── routes/
│       └── pacientes.ts       ✅ Endpoint /iot/data
├── scripts/
│   └── setup-sns.js           ✅ Novo (criar tópico SNS)
├── .env                       ⚠️  Adicionar SNS_TOPIC_ARN
└── package.json               ✅ socket.io, @aws-sdk/client-sns

frontend/
├── src/
│   ├── hooks/
│   │   └── useWebSocket.ts    ✅ Novo (WebSocket hook)
│   └── pages/
│       └── PainelListaPacientes.tsx  ✅ WebSocket integrado
└── package.json               ✅ socket.io-client
```

---

## 🎯 Após Deploy Bem-Sucedido

### Funcionalidades Ativas:

1. **📊 Dashboard em Tempo Real:**
   - Cards de pacientes atualizam automaticamente
   - Sem refresh necessário
   - Latência < 100ms

2. **🚨 Alertas Instantâneos:**
   - Pânico: Toast vermelho + Email/SMS
   - Queda: Toast amarelo + Email/SMS
   - Offline: Badge "Offline" no card

3. **🔔 Notificações SNS:**
   - Email para contatos de emergência
   - SMS (se configurado)
   - Mensagens customizadas por tipo de alerta

4. **📟 Status da Pulseira:**
   - Ligada/Desligada/Offline
   - Nível de bateria
   - Atualização em tempo real

---

## 📚 Documentação Completa

- **DEPLOY_EC2_GUIDE.md** - Guia detalhado de deploy
- **WEBSOCKET_SNS_GUIDE.md** - Arquitetura e uso das features
- **deploy-ec2.bat** - Script Windows (CMD)
- **deploy-ec2.ps1** - Script Windows (PowerShell)

---

**Criado em:** 24/11/2025  
**Versão:** 2.0.0  
**Status:** ⏳ Pendente deploy no EC2
