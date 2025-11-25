# DSIM Backend

Backend do sistema DSIM de monitoramento de pacientes usando IoT, Node.js/Express e AWS.

## � Infraestrutura Implantada

### Recursos AWS (Produção)

| Recurso | Identificador | Status |
|---------|---------------|--------|
| **EC2 Instance** | `i-0019770d6275005b2` | ✅ Rodando |
| **Elastic IP** | `98.95.251.71` | ✅ Fixo (não muda) |
| **API Gateway** | `87xx2k2vn5` | ✅ Ativo |
| **API URL** | `https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com` | ✅ Público |
| **Security Group** | `sg-0f38c9d3a91bd3473` | Portas: 22, 80, 443, 9999 |
| **Backend (Direto)** | `http://98.95.251.71:9999` | ✅ Acessível |
| **Process Manager** | PM2 (daemon `dsim-backend`) | ✅ Auto-restart |

### DynamoDB Tables (us-east-1)

- `DSIM_Users` - Usuários do sistema
- `DSIM_Patients` - Dados dos pacientes
- `DSIM_SensorData` - Leituras das pulseiras IoT (com Stream)
- `DSIM_Alarms` - Configurações de alarmes
- `DSIM_Connections` - Conexões WebSocket ativas

### Lambda Function

- **Nome**: `DSIM-MEWS-Processor`
- **Trigger**: DynamoDB Stream (DSIM_SensorData)
- **Função**: Calcular MEWS e enviar alertas

---

## �🏗️ Arquitetura

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Pulseira   │──────▶│  AWS IoT     │──────▶│  DynamoDB    │
│   ESP8266    │ MQTT  │   Core       │ Rule  │  SensorData  │
└──────────────┘       └──────────────┘       └──────┬───────┘
                                                      │
                                                      │ Stream
                                                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Frontend   │◀──────│   Backend    │       │    Lambda    │
│    React     │ HTTP  │  Node.js/TS  │       │  Processor   │
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │                      │                       │
       │ WebSocket            │ AWS SDK               │ MEWS
       │                      ▼                       ▼
       │               ┌──────────────┐       ┌──────────────┐
       └──────────────▶│  DynamoDB    │◀──────│  DynamoDB    │
                       │   Patients   │       │   Patients   │
                       │   Users      │       │   Alarms     │
                       │   Alarms     │       └──────────────┘
                       │ Connections  │
                       └──────────────┘
```

## 🎯 Funcionalidades

- ✅ **API RESTful** com Express e TypeScript
- ✅ **Autenticação JWT** com bcrypt
- ✅ **CRUD Completo de Pacientes** (Create, Read, Update, Delete)
- ✅ **Gestão de Dispositivos IoT** (atribuir/listar pulseiras disponíveis)
- ✅ **Sistema de Alarmes** personalizável por paciente
- ✅ **WebSocket Server** para alertas em tempo real
- ✅ **Integração com DynamoDB** (5 tabelas)
- ✅ **Integração com Lambda** para processamento de streams
- ✅ **CORS configurado** para frontend React
- ✅ **Validações de dados** completas
- ✅ **Logs estruturados** para debugging

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── aws.ts              # Configuração AWS SDK (DynamoDB + IoT)
│   ├── middleware/
│   │   └── auth.ts             # Middleware JWT autenticação
│   ├── routes/
│   │   ├── auth.ts             # Login e registro
│   │   ├── pacientes.ts        # CRUD pacientes + devices
│   │   ├── alarms.ts           # Configuração de alarmes
│   │   └── historico.ts        # Histórico de sinais vitais
│   ├── types/
│   │   └── index.ts            # Interfaces TypeScript
│   ├── utils/
│   │   └── mews.ts             # Cálculo MEWS (Modified Early Warning Score)
│   ├── server.ts               # Servidor Express principal
│   └── websocket.ts            # Servidor WebSocket (porta 8080)
├── lambda/
│   ├── src/
│   │   └── index.ts            # Lambda MEWS Processor
│   ├── package.json
│   └── tsconfig.json
├── scripts/
│   └── setup-dynamodb.sh       # Script de criação de tabelas
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🚀 Início Rápido

### Opção 1: Usar Backend na EC2 (Recomendado - Já Implantado)

O backend já está rodando na EC2 com IP fixo `98.95.251.71`.

**Atualizar credenciais AWS (a cada 2-4h):**

```cmd
# No Windows (raiz do projeto):
aws configure  # Colar novas credenciais AWS Academy
update_ec2_credentials.bat  # Atualiza automaticamente na EC2
```

**Verificar status:**

```cmd
# Testar backend direto
curl http://98.95.251.71:9999/health

# Testar via API Gateway
curl https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com/health
```

**Acessar EC2 via SSH:**

```cmd
ssh -i "../../CERTIFICADOS/dsim_keypair.pem" ec2-user@98.95.251.71

# Ver logs
pm2 logs dsim-backend

# Reiniciar
pm2 restart dsim-backend

# Status
pm2 status
```

### Opção 2: Desenvolvimento Local

Para rodar backend localmente (ex: testes, desenvolvimento):

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
JWT_SECRET=seu_jwt_secret_super_seguro

# AWS Credentials (AWS Academy requer SESSION_TOKEN)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_SESSION_TOKEN=seu_session_token  # OBRIGATÓRIO no AWS Academy

# DynamoDB Tables
DYNAMODB_USERS_TABLE=DSIM_Users
DYNAMODB_PATIENTS_TABLE=DSIM_Patients
DYNAMODB_SENSOR_DATA_TABLE=DSIM_SensorData
DYNAMODB_ALARMS_TABLE=DSIM_Alarms
DYNAMODB_CONNECTIONS_TABLE=DSIM_Connections
```

### 3. Criar Tabelas DynamoDB

**⚠️ Importante:** As tabelas DynamoDB já foram criadas na AWS.

Caso precise recriá-las, use o Console AWS ou comandos AWS CLI:

- DSIM_Users
- DSIM_Patients
- DSIM_SensorData (com Stream habilitado)
- DSIM_Alarms
- DSIM_Connections (com TTL configurado)

### 4. Compilar TypeScript

```bash
npm run build
```

### 5. Executar em Desenvolvimento

```bash
npm run dev
```

O servidor estará rodando em:
- **API REST:** `http://localhost:9999`
- **WebSocket:** `ws://localhost:8080`

## 📡 API Endpoints

### Autenticação

#### `POST /api/auth/register`
Registrar novo usuário.

**Body:**
```json
{
  "nome": "Admin DSIM",
  "email": "admin@dsim.com",
  "senha": "senha123",
  "role": "admin"
}
```

**Response:** `201 Created`
```json
{
  "message": "Usuário cadastrado com sucesso",
  "userId": "uuid-v4"
}
```

#### `POST /api/auth/login`
Fazer login e receber JWT token.

**Body:**
```json
{
  "email": "admin@dsim.com",
  "senha": "senha123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "userId": "uuid",
  "nome": "Admin DSIM"
}
```

---

### Pacientes

> **Nota:** Todas as rotas requerem autenticação (Bearer Token).

#### `GET /api/pacientes`
Listar todos os pacientes.

**Headers:**
```
Authorization: Bearer <seu_token_jwt>
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "nome": "Maria Silva",
    "dataNascimento": "1980-05-15",
    "genero": "Mulher",
    "relacionamento": "Casado(a)",
    "telefone": "(11) 98765-4321",
    "imageUrl": "data:image/jpeg;base64,...",
    "deviceId": "Pulseira_DSIM",
    "contatoEmergencia": {
      "nome": "João Silva",
      "telefone": "(11) 91234-5678",
      "email": "joao@email.com",
      "parentesco": "Cônjuge"
    },
    "informacaoMedica": {
      "tipoSangue": "O+",
      "possuiDeficiencia": "Não",
      "qualDeficiencia": "",
      "ProblemaEspecifico": "Diabetes, Hipertensão"
    },
    "vitals": {
      "oxigenio": { "value": 98, "status": "stable" },
      "temperatura": { "value": 36.5, "status": "stable" },
      "batimentos": { "value": 75, "status": "stable" }
    },
    "escoreMEWS": 0,
    "statusMEWS": "Baixo Risco"
  }
]
```

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
  "deviceId": "Pulseira_DSIM",
  "contatoEmergencia": {
    "nome": "João Silva",
    "telefone": "(11) 91234-5678",
    "email": "joao@email.com",
    "parentesco": "Cônjuge"
  },
  "informacaoMedica": {
    "tipoSangue": "O+",
    "possuiDeficiencia": "Não",
    "qualDeficiencia": "",
    "ProblemaEspecifico": "Diabetes, Hipertensão"
  },
  "vitals": {
    "oxigenio": { "value": 98, "status": "stable" },
    "temperatura": { "value": 36.5, "status": "stable" },
    "batimentos": { "value": 75, "status": "stable" }
  }
}
```

**Response:** `201 Created`

#### `PUT /api/pacientes/:id`
Atualizar dados do paciente.

**Body:** Mesma estrutura do POST (todos os campos)

**Response:** `200 OK`

#### `DELETE /api/pacientes/:id`
Deletar paciente.

**Response:** `200 OK`
```json
{
  "message": "Paciente deletado com sucesso"
}
```

#### `GET /api/pacientes/devices/available`
Listar dispositivos IoT disponíveis.

**Response:** `200 OK`
```json
{
  "all": ["Pulseira_DSIM", "Pulseira_02", "Pulseira_03"],
  "used": ["Pulseira_DSIM"],
  "available": ["Pulseira_02", "Pulseira_03"]
}
```

---

### Alarmes

#### `GET /api/alarms/:pacienteId`
Obter configuração de alarmes do paciente.

**Response:** `200 OK`
```json
{
  "pacienteId": "uuid",
  "batimentos_min": 50,
  "batimentos_max": 110,
  "oxigenio_min": 92,
  "temperatura_max": 38.0
}
```

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

**Response:** `200 OK`

---

### Histórico

#### `GET /api/historico/:pacienteId?periodo=dia`
Buscar histórico de sinais vitais.

**Query params:**
- `periodo`: `dia` (últimas 24h), `mes` (últimos 30 dias) ou `ano` (últimos 12 meses)

**Response:** `200 OK`
```json
{
  "periodo": "dia",
  "dados": [
    {
      "timestamp": "2025-11-13T10:30:00.000Z",
      "deviceId": "Pulseira_DSIM",
      "oxigenio": 98,
      "temperatura": 36.5,
      "batimentos": 75
    }
  ]
}
```

#### `GET /api/historico/:pacienteId/latest`
Buscar dados mais recentes do paciente.

**Response:** `200 OK`

---

## 🔌 WebSocket (Porta 8080)

Servidor WebSocket para alertas em tempo real.

**Conectar:**
```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('Conectado ao WebSocket');
};

ws.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  console.log('Alerta recebido:', alert);
  // {
  //   tipo: 'MEWS_ALTO',
  //   pacienteId: 'uuid',
  //   mensagem: 'Paciente Maria Silva - MEWS Alto (Score: 4)',
  //   escoreMEWS: 4,
  //   timestamp: '2025-11-13T10:30:00.000Z'
  // }
};
```

**Tipos de Alertas:**
- `MEWS_BAIXO` (Score 0-2)
- `MEWS_MEDIO` (Score 3-4)
- `MEWS_ALTO` (Score ≥5)
- `LIMITE_EXCEDIDO` (Alarme personalizado disparado)

---

## 🔧 Tecnologias

- **Node.js 18+**: Runtime JavaScript
- **TypeScript 5**: Tipagem estática
- **Express 4**: Framework web
- **AWS SDK v3**: DynamoDB, IoT Core
- **JWT (jsonwebtoken)**: Autenticação
- **bcrypt**: Hash de senhas
- **ws**: WebSocket server
- **CORS**: Cross-Origin Resource Sharing
- **uuid**: Geração de IDs únicos

---

## 🗄️ Estrutura DynamoDB

### 1. DSIM_Users
**Partition Key:** `id` (String)

Armazena usuários do sistema (admins, enfermeiros).

### 2. DSIM_Patients
**Partition Key:** `id` (String)

Armazena dados dos pacientes, incluindo sinais vitais atuais e MEWS.

### 3. DSIM_SensorData
**Partition Key:** `deviceId` (String)  
**Sort Key:** `timestamp` (String)  
**Stream:** Enabled (NEW_AND_OLD_IMAGES)

Armazena leituras brutas das pulseiras IoT. Stream dispara Lambda.

### 4. DSIM_Alarms
**Partition Key:** `pacienteId` (String)

Configurações personalizadas de alarmes por paciente.

### 5. DSIM_Connections
**Partition Key:** `connectionId` (String)

Gerencia conexões WebSocket ativas.

---

## 🧪 Testes

### Testar API

Use o arquivo `test-api.js`:

```bash
node test-api.js
```

Testa os seguintes endpoints:
1. GET `/health` - Verificar se API está online
2. POST `/api/auth/register` - Criar usuário de teste
3. POST `/api/auth/login` - Login e obter token JWT
4. GET `/api/pacientes` - Listar pacientes (autenticado)

**Credenciais de teste:**
- Email: `admin@dsim.com`
- Senha: `senha123`

---

## 🚀 Deploy

### AWS EC2 (Recomendado)

1. Crie uma instância EC2 (t2.micro)
2. Instale Node.js 18+
3. Clone o repositório
4. Configure `.env` com credenciais IAM
5. Instale dependências: `npm install`
6. Compile: `npm run build`
7. Execute: `npm start`
8. Configure Security Group para liberar portas 9999 e 8080

### AWS Lambda (Function Processor)

**Deploy da Lambda:**
1. Compile: `cd lambda && npm run build`
2. Empacote: `npm run package`
3. Faça upload de `lambda-function.zip` no Console AWS
4. Configure trigger: DynamoDB Stream (DSIM_SensorData)
5. Role: LabRole (AWS Academy) ou role customizada

---

## 📝 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta do servidor Express | `9999` |
| `NODE_ENV` | Ambiente de execução | `development` ou `production` |
| `JWT_SECRET` | Chave secreta para JWT | `super_secret_key_123` |
| `AWS_REGION` | Região AWS | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | Access Key AWS | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Secret Key AWS | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_SESSION_TOKEN` | Session Token (AWS Academy) | `FwoGZXIvYXd...` |
| `DYNAMODB_USERS_TABLE` | Nome tabela de usuários | `DSIM_Users` |
| `DYNAMODB_PATIENTS_TABLE` | Nome tabela de pacientes | `DSIM_Patients` |
| `DYNAMODB_SENSOR_DATA_TABLE` | Nome tabela de dados IoT | `DSIM_SensorData` |
| `DYNAMODB_ALARMS_TABLE` | Nome tabela de alarmes | `DSIM_Alarms` |
| `DYNAMODB_CONNECTIONS_TABLE` | Nome tabela de WebSocket | `DSIM_Connections` |

---

## 🐛 Troubleshooting

### Erro: `Missing credentials in config`

**Solução:** Verifique se `.env` contém todas as credenciais AWS, incluindo `AWS_SESSION_TOKEN` se estiver usando AWS Academy.

### Erro: `Cannot connect to DynamoDB`

**Solução:** 
1. Verifique se as credenciais AWS estão corretas
2. Confirme que as tabelas existem: `aws dynamodb list-tables`
3. Teste a conexão: `npm run test`

### Erro: `CORS blocked`

**Solução:** Verifique se o frontend está na lista de origens permitidas em `server.ts`:

```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

### Lambda não está processando streams

**Solução:**
1. Verifique se o Stream está habilitado na tabela `DSIM_SensorData`
2. Confirme que a função Lambda tem permissões (LabRole ou custom role)
3. Verifique CloudWatch Logs para erros

### WebSocket não conecta

**Solução:**
1. Verifique se a porta 8080 está aberta no firewall
2. Confirme que o servidor WebSocket está rodando: `netstat -ano | findstr :8080`
3. Teste manualmente: `wscat -c ws://localhost:8080`

---

## 📚 Documentação Adicional

## 📚 Documentação Adicional

- **Frontend README**: `../frontend/README.md`
- **Main README**: `../../../../README.md`

## 👥 Suporte

Para problemas ou dúvidas:

1. Verifique os logs do servidor: `npm run dev` (modo verboso)
2. Consulte CloudWatch Logs (Lambda e DynamoDB Streams)
3. Revise a documentação da API acima
4. Teste endpoints com `test-api.js`

---

## 🔐 Segurança

- ✅ Senhas criptografadas com bcrypt (10 rounds)
- ✅ JWT com expiração de 24h
- ✅ Middleware de autenticação em todas as rotas protegidas
- ✅ Validação de dados de entrada
- ✅ CORS configurado para origens específicas
- ⚠️ **Não commitar** arquivo `.env` no Git
- ⚠️ **Renovar** credenciais AWS Academy a cada sessão

---

## 📄 Licença

Projeto acadêmico - DSIM 2025
