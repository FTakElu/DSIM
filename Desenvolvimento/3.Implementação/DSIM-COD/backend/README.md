# DSIM Backend

Backend do sistema DSIM de monitoramento de pacientes usando IoT, Node.js/Express e AWS.

## 🏗️ Arquitetura

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Pulseira   │──────▶│  AWS IoT     │──────▶│  DynamoDB    │
│   ESP8266    │ MQTT  │   Core       │ Rule  │  SensorData  │
└──────────────┘       └──────────────┘       └──────┬───────┘
                                                      │
                                                      │ Stream
                                                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Frontend   │◀──────│     API      │       │    Lambda    │
│    React     │ HTTP  │   Gateway    │       │  Processor   │
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │                      │                       │
       │ WebSocket            │ Proxy                 │ Update
       │                      ▼                       ▼
       │               ┌──────────────┐       ┌──────────────┐
       └──────────────▶│   Backend    │       │  DynamoDB    │
                       │ Node.js/EC2  │◀──────│   Patients   │
                       └──────────────┘       │   Alarms     │
                                              └──────────────┘
```

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── aws.ts              # Configuração AWS SDK
│   ├── middleware/
│   │   └── auth.ts             # Middleware JWT
│   ├── routes/
│   │   ├── auth.ts             # Rotas de autenticação
│   │   ├── pacientes.ts        # CRUD de pacientes
│   │   ├── alarms.ts           # Configuração de alarmes
│   │   └── historico.ts        # Histórico de sinais vitais
│   ├── types/
│   │   └── index.ts            # Tipos TypeScript
│   ├── utils/
│   │   └── mews.ts             # Cálculo MEWS
│   ├── server.ts               # Servidor Express principal
│   └── websocket.ts            # Servidor WebSocket
├── lambda/
│   ├── src/
│   │   └── index.ts            # Função Lambda
│   ├── package.json
│   └── tsconfig.json
├── scripts/
│   └── setup-dynamodb.sh       # Script de setup DynamoDB
├── package.json
├── tsconfig.json
├── .env.example
├── DEPLOYMENT_GUIDE.md         # Guia de implantação
├── DYNAMODB_STRUCTURE.md       # Estrutura das tabelas
└── README.md
```

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais AWS:

```env
PORT=9999
NODE_ENV=development
JWT_SECRET=seu_jwt_secret_aqui

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key

DYNAMODB_USERS_TABLE=DSIM_Users
DYNAMODB_PATIENTS_TABLE=DSIM_Patients
DYNAMODB_SENSOR_DATA_TABLE=DSIM_SensorData
DYNAMODB_ALARMS_TABLE=DSIM_Alarms
```

### 3. Criar Tabelas DynamoDB

```bash
# Dar permissão de execução
chmod +x scripts/setup-dynamodb.sh

# Executar script
./scripts/setup-dynamodb.sh
```

Ou crie manualmente seguindo o guia em `DYNAMODB_STRUCTURE.md`.

### 4. Compilar TypeScript

```bash
npm run build
```

### 5. Executar em Desenvolvimento

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:9999`.

## 📡 API Endpoints

### Autenticação

#### `POST /api/auth/register`
Registrar novo usuário.

**Body:**
```json
{
  "nome": "Admin",
  "email": "admin@dsim.com",
  "senha": "senha123",
  "role": "admin"
}
```

**Response:**
```json
{
  "message": "Usuário cadastrado com sucesso",
  "userId": "uuid"
}
```

#### `POST /api/auth/login`
Fazer login.

**Body:**
```json
{
  "email": "admin@dsim.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "role": "admin",
  "userId": "uuid",
  "nome": "Admin"
}
```

### Pacientes

> **Nota:** Todas as rotas de pacientes requerem autenticação (Bearer Token).

#### `GET /api/pacientes`
Listar todos os pacientes.

#### `GET /api/pacientes/:id`
Buscar paciente por ID.

#### `POST /api/pacientes`
Criar novo paciente.

**Body:**
```json
{
  "nome": "Maria Silva",
  "dataNascimento": "1980-05-15",
  "genero": "Mulher",
  "relacionamento": "Casado(a)",
  "telefone": "(11) 98765-4321",
  "imageUrl": "data:image/jpeg;base64,...",
  "contatoEmergencia": {
    "nome": "João Silva",
    "telefone": "(11) 91234-5678",
    "email": "joao@email.com",
    "instagram": "@joaosilva"
  },
  "informacaoMedica": {
    "tipoSangue": "O+",
    "Deficiencia": "Nenhuma",
    "ProblemaEspecifico": "Diabetes, Hipertensão"
  }
}
```

#### `PUT /api/pacientes/:id`
Atualizar paciente.

#### `DELETE /api/pacientes/:id`
Deletar paciente.

#### `POST /api/pacientes/:id/device`
Vincular dispositivo ao paciente.

**Body:**
```json
{
  "deviceId": "ESP8266_001"
}
```

### Alarmes

#### `GET /api/alarms/:pacienteId`
Obter configuração de alarmes do paciente.

#### `POST /api/alarms/:pacienteId`
Configurar alarmes personalizados.

**Body:**
```json
{
  "batimentos_min": 50,
  "batimentos_max": 110,
  "oxigenio_min": 92,
  "temperatura_max": 38.0
}
```

### Histórico

#### `GET /api/historico/:pacienteId?periodo=dia`
Buscar histórico de sinais vitais.

**Query params:**
- `periodo`: `dia`, `mes` ou `ano`

#### `GET /api/historico/:pacienteId/latest`
Buscar dados mais recentes do paciente.

## 🔌 WebSocket

Conectar ao WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  // Registrar interesse em um paciente
  ws.send(JSON.stringify({
    type: 'register',
    pacienteId: 'uuid-do-paciente'
  }));
};

ws.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  console.log('Alerta recebido:', alert);
};
```

**Formato de alertas:**
```json
{
  "type": "vital_alert",
  "pacienteId": "uuid",
  "pacienteNome": "Maria Silva",
  "timestamp": 1699900000000,
  "vitals": {
    "batimentos": 85,
    "oxigenio": 97,
    "temperatura": 36.5
  },
  "mews": {
    "score": 2,
    "status": "warning"
  },
  "alerts": ["Batimentos altos: 125 bpm"]
}
```

## 🧮 Cálculo MEWS

O sistema calcula automaticamente o Modified Early Warning Score (MEWS) baseado em:

### Frequência Cardíaca (bpm)
- < 40: +3
- 40-50: +1
- 50-100: 0
- 101-110: +1
- 111-129: +2
- ≥ 130: +3

### Saturação de O2 (%)
- < 85: +3
- 85-89: +2
- 90-94: +1
- ≥ 95: 0

### Temperatura (°C)
- < 35: +2
- 35-35.9: +1
- 36-38: 0
- 38.1-39: +1
- > 39: +2

### Status
- **Stable**: Score 0-2
- **Warning**: Score 3-4
- **Danger**: Score ≥ 5

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento com hot-reload
npm run dev

# Compilar TypeScript
npm run build

# Executar em produção
npm start

# Executar testes (se configurado)
npm test
```

## 📦 Deploy

Siga o guia completo em [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) para:

1. Configurar DynamoDB
2. Configurar AWS IoT Core
3. Deploy da Lambda
4. Configurar API Gateway
5. Deploy no EC2
6. Deploy do frontend no Amplify

## 🔐 Segurança

- Todas as senhas são hasheadas com bcrypt
- Autenticação via JWT
- Comunicação IoT via TLS/certificados
- Variáveis sensíveis em `.env` (não commitadas)

## 📊 Monitoramento

### Logs locais
```bash
# Ver logs em desenvolvimento
npm run dev

# Logs em produção (PM2)
pm2 logs dsim-api
```

### AWS CloudWatch
- Lambda: `/aws/lambda/DSIM-ProcessSensorData`
- IoT Core: AWS IoT > Logs
- DynamoDB: Metrics & Alarms

## 🐛 Troubleshooting

### Erro de autenticação AWS
Verifique se as credenciais no `.env` estão corretas:
```bash
aws sts get-caller-identity
```

### Tabelas DynamoDB não encontradas
Execute o script de setup:
```bash
./scripts/setup-dynamodb.sh
```

### Porta já em uso
Altere a porta no `.env`:
```env
PORT=9000
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

MIT

## 👥 Equipe

Projeto DSIM - Sistema de Monitoramento de Pacientes IoT

---

Para mais informações, consulte:
- [Guia de Deployment](./DEPLOYMENT_GUIDE.md)
- [Estrutura DynamoDB](./DYNAMODB_STRUCTURE.md)
