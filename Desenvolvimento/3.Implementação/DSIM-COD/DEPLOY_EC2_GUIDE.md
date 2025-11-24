# 🚀 Deploy Rápido - EC2 Backend

## ⚡ Opção 1: Script Automático (Recomendado)

Execute o arquivo `deploy-ec2.bat`:

```bash
cd "c:\Users\flavi\OneDrive\Área de Trabalho\DSIM\Desenvolvimento\3.Implementação\DSIM-COD"
deploy-ec2.bat
```

---

## 🔧 Opção 2: Deploy Manual

### 1️⃣ Conectar ao EC2

**No Windows CMD:**

```cmd
cd "c:\Users\flavi\OneDrive\Área de Trabalho\DSIM\Desenvolvimento\3.Implementação\CERTIFICADOS"

ssh -i dsim_keypair.pem ubuntu@98.95.251.71
```

**Se der erro "Permission denied":**
- Clique direito em `dsim_keypair.pem` → Propriedades → Segurança
- Clique em "Avançado"
- Desabilite herança
- Remova todos os usuários exceto você
- Dê apenas permissão de leitura

---

### 2️⃣ Atualizar Código no EC2

```bash
cd DSIM-COD/backend
git pull origin main
```

---

### 3️⃣ Instalar Dependências

```bash
npm install
```

**Pacotes novos instalados:**
- `socket.io` (WebSocket real-time)
- `@aws-sdk/client-sns` (Alertas SMS/Email)

---

### 4️⃣ Compilar TypeScript

```bash
npm run build
```

**Deve compilar sem erros:**
```
> dsim-backend@1.0.0 build
> tsc
```

---

### 5️⃣ Configurar SNS_TOPIC_ARN

```bash
nano .env
```

**Adicione esta linha ao final do arquivo:**

```bash
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:565757789330:DSIM-Alertas
```

**Salvar:** `Ctrl + O` → `Enter` → `Ctrl + X`

---

### 6️⃣ Reiniciar Backend com PM2

```bash
pm2 restart dsim-backend
```

---

### 7️⃣ Verificar Status

```bash
pm2 status
```

**Esperado:**
```
┌─────┬──────────────────┬─────────┬─────────┐
│ id  │ name             │ status  │ restart │
├─────┼──────────────────┼─────────┼─────────┤
│ 0   │ dsim-backend     │ online  │ 5       │
└─────┴──────────────────┴─────────┴─────────┘
```

---

### 8️⃣ Verificar Logs

```bash
pm2 logs dsim-backend --lines 50
```

**Deve mostrar:**
```
🚀 Servidor rodando na porta 9999
✅ Conectado ao DynamoDB
🔌 WebSocket Server inicializado
```

**Para logs em tempo real:**
```bash
pm2 logs dsim-backend
```

**Para sair dos logs:** `Ctrl + C`

---

## 🧪 Testar Funcionalidades

### Testar API REST

```bash
curl http://98.95.251.71:9999/health
```

**Resposta esperada:**
```json
{"status":"ok","timestamp":1234567890}
```

---

### Testar WebSocket

**No navegador (Console do DevTools):**

```javascript
const socket = io('http://98.95.251.71:9999');

socket.on('connect', () => {
  console.log('✅ WebSocket conectado!');
  socket.emit('subscribe-all-patients');
});

socket.on('vital-update', (data) => {
  console.log('📊 Atualização:', data);
});

socket.on('alert', (alert) => {
  console.log('🚨 Alerta:', alert);
});
```

---

### Testar SNS Alerts

**Criar arquivo de teste no EC2:**

```bash
nano test-sns.js
```

**Cole este código:**

```javascript
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
require('dotenv').config();

const snsClient = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

async function testSNS() {
  const command = new PublishCommand({
    TopicArn: process.env.SNS_TOPIC_ARN,
    Subject: '🧪 Teste DSIM - SNS',
    Message: 'Esta é uma mensagem de teste do sistema DSIM!',
  });

  try {
    const response = await snsClient.send(command);
    console.log('✅ Mensagem enviada!', response.MessageId);
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testSNS();
```

**Executar:**

```bash
node test-sns.js
```

**Se funcionar:** Você receberá email com a mensagem de teste!

---

## 📊 Comandos PM2 Úteis

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs dsim-backend

# Ver logs das últimas linhas
pm2 logs dsim-backend --lines 100

# Reiniciar
pm2 restart dsim-backend

# Parar
pm2 stop dsim-backend

# Iniciar
pm2 start dsim-backend

# Recarregar (zero downtime)
pm2 reload dsim-backend

# Monitoramento em tempo real
pm2 monit

# Deletar processo
pm2 delete dsim-backend

# Ver informações detalhadas
pm2 show dsim-backend
```

---

## 🔍 Troubleshooting

### ❌ Erro: "Cannot find module 'socket.io'"

```bash
cd DSIM-COD/backend
npm install
pm2 restart dsim-backend
```

---

### ❌ Erro: "SNS_TOPIC_ARN não configurado"

```bash
nano .env
# Adicionar: SNS_TOPIC_ARN=arn:aws:sns:us-east-1:565757789330:DSIM-Alertas
pm2 restart dsim-backend
```

---

### ❌ Backend não inicia (status: errored)

```bash
pm2 logs dsim-backend --lines 50
```

Ver o erro específico e corrigir.

---

### ❌ WebSocket não conecta (CORS)

Verificar se o domínio do frontend está no CORS do server.ts:

```bash
nano src/server.ts
```

Procure por:
```typescript
cors: {
  origin: [
    'http://localhost:5173',
    'https://main.d2cq9un5umdfmy.amplifyapp.com'  // ← Seu domínio
  ],
```

---

### ❌ SNS não envia mensagens

**1. Verificar ARN:**
```bash
echo $SNS_TOPIC_ARN
```

**2. Verificar credenciais AWS:**
```bash
aws sns list-topics --region us-east-1
```

**3. Inscrever email manualmente:**
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:565757789330:DSIM-Alertas \
  --protocol email \
  --notification-endpoint seu-email@exemplo.com
```

---

## 📝 Checklist Final

- [ ] Código atualizado: `git pull`
- [ ] Dependências instaladas: `npm install`
- [ ] Compilação OK: `npm run build`
- [ ] SNS_TOPIC_ARN configurado no `.env`
- [ ] PM2 reiniciado: `pm2 restart dsim-backend`
- [ ] Status online: `pm2 status`
- [ ] Logs sem erro: `pm2 logs dsim-backend`
- [ ] API REST funcionando: `curl http://98.95.251.71:9999/health`
- [ ] WebSocket conecta no frontend
- [ ] SNS envia emails (verificar spam)

---

## 🎯 Endpoints Novos

```
POST /api/pacientes/iot/data
```

**Recebe dados do IoT Core e:**
1. Emite atualização via WebSocket
2. Envia alerta SNS se `panico_ativo: true`
3. Envia alerta SNS se `queda_detectada: true`

**Body:**
```json
{
  "deviceId": "Pulseira_001",
  "temperatura": 37.2,
  "frequencia_cardiaca": 120,
  "saturacao_oxigenio": 94,
  "bateria": 75,
  "status": "ligado",
  "panico_ativo": true,
  "queda_detectada": false
}
```

---

**Sucesso!** 🎉 Backend atualizado e rodando com WebSocket + SNS!
