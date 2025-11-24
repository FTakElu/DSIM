# 🔔 WebSocket + SNS - Tempo Real & Alertas

## 📋 Visão Geral

Esta implementação adiciona duas funcionalidades críticas ao DSIM:

1. **WebSocket (Socket.io)**: Dashboard em tempo real com atualização instantânea de sinais vitais
2. **SNS (Simple Notification Service)**: Alertas por SMS/Email para situações de pânico e quedas

---

## 🔌 WebSocket - Tempo Real

### Arquitetura

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  ESP8266 (IoT)  │────────▶│   AWS IoT Core  │────────▶│ POST /api/      │
│   + Sensores    │  MQTT   │                 │         │ pacientes/iot/  │
└─────────────────┘         └─────────────────┘         │     data        │
                                                         └────────┬────────┘
                                                                  │
                                                                  ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │◀────────│   Socket.io     │◀────────│  emitVitalUpdate│
│  (React + Hook) │  WS     │    Server       │         │   emitAlert     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Backend - Socket.io Server

**Arquivo**: `backend/src/websocket.ts`

#### Funções Principais:

1. **`initializeWebSocket(io: Server)`**
   - Inicializa o servidor Socket.io
   - Configura event listeners (subscribe-patient, subscribe-all-patients)
   - Gerencia conexões e desconexões

2. **`emitVitalUpdate(patientId, data)`**
   - Emite atualização de sinais vitais para clientes inscritos
   - Envia para room específica: `patient-${patientId}`
   - Envia para room global: `all-patients`

3. **`emitAlert(patientId, alertType, data)`**
   - Emite alertas de pânico ou queda
   - Tipos: `'panic'` | `'fall'`

4. **`emitDeviceStatus(patientId, status)`**
   - Notifica mudança de status da pulseira
   - Status: `'ligado'` | `'desligado'` | `'offline'`

#### Eventos Socket.io:

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `subscribe-patient` | Cliente → Servidor | Inscrever em paciente específico |
| `unsubscribe-patient` | Cliente → Servidor | Desinscrever de paciente |
| `subscribe-all-patients` | Cliente → Servidor | Inscrever em todos os pacientes |
| `vital-update` | Servidor → Cliente | Atualização de sinais vitais |
| `alert` | Servidor → Cliente | Alerta de pânico ou queda |
| `device-status` | Servidor → Cliente | Mudança de status da pulseira |

### Frontend - Hook React

**Arquivo**: `frontend/src/hooks/useWebSocket.ts`

#### Uso Básico:

```typescript
import { useWebSocket } from '../hooks/useWebSocket';

const MyComponent = () => {
  const { isConnected, lastUpdate, lastAlert } = useWebSocket({
    autoConnect: true,
    subscribeToAllPatients: true,
    onVitalUpdate: (data) => {
      console.log('Nova atualização:', data);
      // Atualizar estado local
    },
    onAlert: (alert) => {
      if (alert.type === 'panic') {
        toast.error(`🚨 PÂNICO: ${alert.patientName}`);
      }
    },
    onDeviceStatus: (status) => {
      console.log('Status:', status);
    },
  });

  return (
    <div>
      {isConnected ? '🔌 Conectado' : '❌ Desconectado'}
    </div>
  );
};
```

#### Métodos Disponíveis:

```typescript
const {
  isConnected,           // boolean: Status da conexão
  lastUpdate,           // VitalUpdate | null: Última atualização
  lastAlert,            // Alert | null: Último alerta
  subscribeToPatient,   // (id: string) => void
  unsubscribeFromPatient, // (id: string) => void
  subscribeToAll,       // () => void
  disconnect,           // () => void
  reconnect,            // () => void
  socket,               // Socket | null: Instância do socket
} = useWebSocket();
```

### Integração no PainelListaPacientes

O componente `PainelListaPacientes.tsx` já está integrado:

- ✅ Conecta automaticamente ao WebSocket
- ✅ Inscreve em todos os pacientes
- ✅ Atualiza cards em tempo real
- ✅ Exibe alertas com toast notifications
- ✅ Mostra indicador de conexão

---

## 📧 SNS - Alertas SMS/Email

### Arquitetura

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Botão Pânico   │────────▶│  POST /api/     │────────▶│  sendPanicAlert │
│  ou Queda       │         │  pacientes/iot/ │         │     (SNS)       │
└─────────────────┘         │      data       │         └────────┬────────┘
                            └─────────────────┘                  │
                                                                  ▼
                                                         ┌─────────────────┐
                                                         │   AWS SNS       │
                                                         │   Topic:        │
                                                         │  DSIM-Alertas   │
                                                         └────────┬────────┘
                                                                  │
                                       ┌──────────────────────────┴──────────────────────┐
                                       ▼                                                  ▼
                                ┌─────────────┐                                   ┌─────────────┐
                                │ 📧 Email    │                                   │ 📱 SMS      │
                                │ Responsável │                                   │ Responsável │
                                └─────────────┘                                   └─────────────┘
```

### Backend - SNS Service

**Arquivo**: `backend/src/services/sns-service.ts`

#### Funções Principais:

1. **`createAlertTopic(): Promise<string>`**
   - Cria tópico SNS "DSIM-Alertas" (se não existir)
   - Retorna o ARN do tópico

2. **`subscribeEmail(topicArn, email): Promise<void>`**
   - Inscreve email no tópico
   - Requer confirmação na caixa de entrada

3. **`subscribeSMS(topicArn, phoneNumber): Promise<void>`**
   - Inscreve telefone no tópico
   - Formato: `+55DDDNÚMERO` (ex: `+5511999999999`)

4. **`sendPanicAlert(patient, data): Promise<void>`**
   - Envia SMS/Email para todos os inscritos
   - Inclui dados do paciente e sinais vitais

5. **`sendFallAlert(patient, data): Promise<void>`**
   - Similar ao pânico, mas para quedas detectadas

### Configuração do SNS

#### 1. Criar Tópico SNS

Execute o script de configuração:

```bash
cd backend
node scripts/setup-sns.js
```

O script irá:
- ✅ Criar tópico "DSIM-Alertas"
- ✅ Exibir o ARN do tópico
- ✅ Permitir inscrever emails/telefones de teste

#### 2. Adicionar ARN ao .env

Copie o ARN exibido e adicione ao `.env`:

```bash
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:565757789330:DSIM-Alertas
```

#### 3. Reiniciar Backend

```bash
pm2 restart dsim-backend
```

### Formato das Mensagens

#### Alerta de Pânico:

```
🚨 ALERTA DE PÂNICO - DSIM

Paciente: Maria Silva
ID: abc123
Data/Hora: 15/06/2024 14:30:00

O paciente acionou o botão de pânico!

Frequência Cardíaca: 120 bpm
Saturação de O2: 94%
Temperatura: 37.2°C

⚠️ AÇÃO IMEDIATA NECESSÁRIA!

Contato de emergência: +5511999999999
```

#### Alerta de Queda:

```
⚠️ ALERTA DE QUEDA DETECTADA - DSIM

Paciente: João Santos
ID: def456
Data/Hora: 15/06/2024 15:45:00

Uma possível queda foi detectada pela pulseira de monitoramento!

Frequência Cardíaca: 95 bpm
Saturação de O2: 97%
Temperatura: 36.8°C

⚠️ Verificação recomendada!

Contato de emergência: +5511988888888
```

### Inscrição Automática

Quando um paciente é criado ou editado, o sistema automaticamente tenta inscrever o contato de emergência:

```typescript
// Em backend/src/routes/pacientes.ts
if (newPatient.contatoEmergencia) {
  await subscribeResponsavelSNS({
    email: newPatient.contatoEmergencia.email,
    telefone: newPatient.contatoEmergencia.telefone
  });
}
```

---

## 🚀 Deploy

### Backend (EC2)

1. **Commit e Push das alterações:**

```bash
cd backend
git add .
git commit -m "feat: adiciona WebSocket (Socket.io) e SNS alerts"
git push origin main
```

2. **Conectar ao EC2 e atualizar:**

```bash
ssh -i "dsim_keypair.pem" ubuntu@98.95.251.71

cd DSIM-COD/backend
git pull
npm install
npm run build
```

3. **Configurar SNS_TOPIC_ARN:**

```bash
nano .env
# Adicione: SNS_TOPIC_ARN=arn:aws:sns:us-east-1:565757789330:DSIM-Alertas
```

4. **Reiniciar com PM2:**

```bash
pm2 restart dsim-backend
pm2 logs dsim-backend
```

### Frontend (Amplify)

1. **Commit e Push:**

```bash
cd frontend
git add .
git commit -m "feat: adiciona WebSocket real-time dashboard"
git push origin main
```

2. **Amplify irá detectar e fazer deploy automático**
   - Acesse: https://console.aws.amazon.com/amplify
   - Verifique o status do build
   - Deploy automático em ~3-5 minutos

---

## 🧪 Testes

### 1. Testar WebSocket Local

```bash
cd backend
npm start
```

Em outro terminal:

```bash
cd frontend
npm run dev
```

Acesse: `http://localhost:5173/painel-pacientes`

- Verifique o indicador "🔌 Tempo real ativo" (verde)
- Abra o console do navegador
- Veja logs de conexão WebSocket

### 2. Simular Dados do IoT

Crie um arquivo `test-websocket.js`:

```javascript
const axios = require('axios');

const API_URL = 'http://98.95.251.71:9999';
const TOKEN = 'seu-token-jwt-aqui';

async function simulateData() {
  const data = {
    deviceId: 'Pulseira_001',
    temperatura: 37.2,
    frequencia_cardiaca: 85,
    saturacao_oxigenio: 97,
    bateria: 75,
    status: 'ligado',
    panico_ativo: false,
    queda_detectada: false,
  };

  try {
    const response = await axios.post(
      `${API_URL}/api/pacientes/iot/data`,
      data,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ Dados enviados:', response.data);
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

// Simular atualização a cada 5 segundos
setInterval(simulateData, 5000);
```

Execute: `node test-websocket.js`

### 3. Testar Alerta de Pânico

```javascript
const data = {
  deviceId: 'Pulseira_001',
  temperatura: 37.5,
  frequencia_cardiaca: 120,
  saturacao_oxigenio: 92,
  bateria: 70,
  status: 'ligado',
  panico_ativo: true,  // ← PÂNICO!
  queda_detectada: false,
};

axios.post(`${API_URL}/api/pacientes/iot/data`, data, { headers });
```

**Esperado:**
- ✅ Toast vermelho no frontend: "🚨 ALERTA DE PÂNICO"
- ✅ Email enviado para inscritos
- ✅ SMS enviado (se configurado)

### 4. Testar Alerta de Queda

```javascript
const data = {
  deviceId: 'Pulseira_001',
  temperatura: 36.8,
  frequencia_cardiaca: 95,
  saturacao_oxigenio: 96,
  bateria: 65,
  status: 'ligado',
  panico_ativo: false,
  queda_detectada: true,  // ← QUEDA!
};

axios.post(`${API_URL}/api/pacientes/iot/data`, data, { headers });
```

**Esperado:**
- ✅ Toast amarelo no frontend: "⚠️ QUEDA DETECTADA"
- ✅ Email enviado para inscritos
- ✅ SMS enviado (se configurado)

---

## 📝 Variáveis de Ambiente

### Backend (.env)

```bash
PORT=9999
NODE_ENV=production
JWT_SECRET=dsim-secret-key-2024-very-secure-random-string
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=ASIAYHOOKYSJJ7RPL34N
AWS_SECRET_ACCESS_KEY=MLN96YiQ7RChUgSoXcKxD6p0CaiyYq7B361LovHP
AWS_SESSION_TOKEN=IQoJb3JpZ2luX2VjEJf...
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:565757789330:DSIM-Alertas
```

### Frontend (.env)

```bash
VITE_API_URL=http://98.95.251.71:9999/api
```

---

## 🔧 Troubleshooting

### WebSocket não conecta

**Problema:** Indicador mostra "❌ Tempo real desconectado"

**Solução:**
1. Verificar se backend está rodando: `pm2 status`
2. Verificar logs: `pm2 logs dsim-backend`
3. Testar conexão: `curl http://98.95.251.71:9999/health`
4. Verificar firewall: porta 9999 deve estar aberta

### SNS não envia mensagens

**Problema:** Alertas não chegam por email/SMS

**Solução:**
1. Verificar `SNS_TOPIC_ARN` no `.env`
2. Confirmar inscrições de email (verificar spam)
3. Verificar logs do backend: `pm2 logs dsim-backend | grep SNS`
4. Testar manualmente:

```bash
cd backend
node scripts/setup-sns.js
```

### CORS Error no WebSocket

**Problema:** `Cross-Origin Request Blocked`

**Solução:**
1. Verificar CORS no `server.ts`:

```typescript
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://main.d2cq9un5umdfmy.amplifyapp.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
```

2. Reiniciar backend: `pm2 restart dsim-backend`

---

## 📊 Monitoramento

### Logs em Tempo Real

```bash
# Backend
pm2 logs dsim-backend

# Filtrar WebSocket
pm2 logs dsim-backend | grep "🔌"

# Filtrar SNS
pm2 logs dsim-backend | grep "🚨\|⚠️"
```

### Métricas do PM2

```bash
pm2 monit
```

### CloudWatch (AWS)

- **SNS**: Console AWS → SNS → Topics → DSIM-Alertas → Monitoring
- **EC2**: Console AWS → EC2 → Instances → Monitoring

---

## 🎯 Próximas Melhorias

- [ ] Adicionar autenticação ao WebSocket (JWT via query params)
- [ ] Implementar retry automático para SNS falhas
- [ ] Dashboard de métricas em tempo real
- [ ] Histórico de alertas enviados
- [ ] Notificações push no navegador (Web Push API)
- [ ] Integração com WhatsApp Business API
- [ ] Gravação de áudio/vídeo em situações de emergência

---

## 📚 Referências

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [AWS SNS Developer Guide](https://docs.aws.amazon.com/sns/)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [PM2 Process Management](https://pm2.keymetrics.io/)

---

**Desenvolvido por:** Equipe DSIM  
**Data:** Junho 2024  
**Versão:** 2.0.0
