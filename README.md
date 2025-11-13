# DSIM - Dispositivo de Segurança Inteligente para Monitoramento
## (Intelligent Security Device for Monitoring)

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Arduino](https://img.shields.io/badge/-Arduino-00979D?style=for-the-badge&logo=Arduino&logoColor=white) ![C++](https://img.shields.io/badge/c++-%2300599C.svg?style=for-the-badge&logo=c%2B%2B&logoColor=white) ![AmazonDynamoDB](https://img.shields.io/badge/Amazon%20DynamoDB-4053D6?style=for-the-badge&logo=Amazon%20DynamoDB&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

![ProjectLogo](https://github.com/FTakElu/DSIM/blob/6a314038459ba6172102d95c006211f7e44ce688/Desenvolvimento/3.Implementa%C3%A7%C3%A3o/DSIM-COD/DSIM/public/images/DSIM_logoExtensa.png?raw=true)

## 📌 Sobre o DSIM

Como parte de um trabalho de conclusão de curso em Ciência da Computação no Instituto Federal de São Paulo – Campus Salto, o projeto DSIM (Dispositivo de Segurança Inteligente para Monitoramento) consiste no desenvolvimento de uma solução wearable que compreende uma pulseira inteligente integrada a uma plataforma web, projetada para monitorar usuários que possam estar em situações de risco ou vulnerabilidade.

O sistema monitora continuamente sinais vitais, localização e movimento, emitindo alertas automáticos através de seus recursos inteligentes quando necessário. Ao fornecer dados em tempo real tanto para os usuários quanto para seus cuidadores ou familiares, o DSIM promove maior segurança e autonomia, permite respostas mais rápidas em situações críticas e melhora a qualidade geral do atendimento assistido.

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Pulseira IoT   │────────▶│  AWS IoT Core   │────────▶│   DynamoDB      │
│    ESP8266      │  MQTT   │  (MQTT Broker)  │  Rule   │  SensorData     │
│  + Sensores     │  TLS    │                 │         └────────┬────────┘
└─────────────────┘         └─────────────────┘                  │
                                                                  │ Stream
                                    ┌─────────────────────────────┘
                                    ▼
                            ┌─────────────────┐
                            │     Lambda      │
                            │   Processor     │
                            │  (MEWS, Alerts) │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │  DynamoDB    │  │  DynamoDB    │  │  WebSocket   │
            │   Patients   │  │    Alarms    │  │   Server     │
            └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                   │                 │                  │
                   └─────────┬───────┘                  │
                             ▼                          │
                   ┌─────────────────┐                 │
                   │  Backend API    │                 │
                   │  Node.js/Express│◀────────────────┘
                   │   (Port 9999)   │
                   └────────┬────────┘
                            │ HTTP/REST
                            ▼
                   ┌─────────────────┐
                   │   Frontend      │
                   │  React + Vite   │
                   │  (Port 5173)    │
                   └─────────────────┘
```

## 🚀 Funcionalidades

### Pulseira IoT (ESP8266)
- ✅ **Monitoramento de Sinais Vitais**: Rastreamento em tempo real de frequência cardíaca, temperatura corporal e oxigenação sanguínea (SpO₂)
- ✅ **Botão de Pânico**: Acionamento manual de alertas de emergência
- ✅ **Comunicação Segura**: Conexão TLS/SSL com AWS IoT Core via MQTT
- ✅ **Envio Automático**: Dados transmitidos a cada 10 segundos
- ✅ **Reconexão Automática**: Recuperação automática de quedas de conexão

### Backend (Node.js/Express)
- ✅ **API RESTful**: Endpoints para pacientes, alarmes, histórico e autenticação
- ✅ **Autenticação JWT**: Login seguro com tokens de 24 horas
- ✅ **Cálculo MEWS**: Modified Early Warning Score automático
- ✅ **WebSocket**: Alertas em tempo real para o frontend
- ✅ **Integração AWS**: DynamoDB, IoT Core e Lambda

### Lambda Processor
- ✅ **Processamento de Stream**: Analisa dados do DynamoDB Stream
- ✅ **Detecção de Anomalias**: Verifica limites de alarmes configurados
- ✅ **Cálculo de Score**: MEWS baseado em sinais vitais
- ✅ **Notificações**: Envia alertas via WebSocket quando necessário

### Frontend (React + TypeScript)
- ✅ **Dashboard de Pacientes**: Visualização em cards com dados em tempo real
- ✅ **Cadastro Completo**: Formulário com foto e histórico médico
- ✅ **Histórico Visual**: Gráficos interativos de sinais vitais
- ✅ **Alertas em Tempo Real**: Notificações via WebSocket
- ✅ **Configuração de Alarmes**: Limites personalizados por paciente
- ✅ **Interface Responsiva**: Adaptável para desktop, tablet e mobile

## 📁 Estrutura do Projeto

```
DSIM/
├── README.md                                    # Este arquivo
├── Desenvolvimento/
│   ├── 1.Requisitos/                           # Especificações do sistema
│   ├── 2.Analise e Design/                     # Diagramas UML
│   │   └── DSIM - Modelos Analise e Design.asta
│   ├── 3.Implementação/
│   │   ├── CERTIFICADOS/                       # Certificados AWS IoT
│   │   │   ├── certificate.pem.crt
│   │   │   ├── private.pem.key
│   │   │   ├── AmazonRootCA1.pem
│   │   │   └── dsim_keypair.pem
│   │   │
│   │   ├── DSIM-COD/                          # Código da Aplicação
│   │   │   ├── backend/                       # Backend Node.js
│   │   │   │   ├── README.md                  # Docs do backend
│   │   │   │   ├── package.json
│   │   │   │   ├── tsconfig.json
│   │   │   │   ├── src/
│   │   │   │   │   ├── server.ts             # Servidor Express
│   │   │   │   │   ├── websocket.ts          # WebSocket server
│   │   │   │   │   ├── config/
│   │   │   │   │   │   └── aws.ts           # Configuração AWS SDK
│   │   │   │   │   ├── middleware/
│   │   │   │   │   │   └── auth.ts          # Middleware JWT
│   │   │   │   │   ├── routes/
│   │   │   │   │   │   ├── auth.ts          # Login/Registro
│   │   │   │   │   │   ├── pacientes.ts     # CRUD pacientes
│   │   │   │   │   │   ├── alarms.ts        # Config alarmes
│   │   │   │   │   │   └── historico.ts     # Histórico dados
│   │   │   │   │   ├── types/
│   │   │   │   │   │   └── index.ts         # Tipos TypeScript
│   │   │   │   │   └── utils/
│   │   │   │   │       └── mews.ts          # Cálculo MEWS
│   │   │   │   ├── lambda/                   # Função Lambda
│   │   │   │   │   ├── src/
│   │   │   │   │   │   └── index.ts         # Processor Lambda
│   │   │   │   │   └── package.json
│   │   │   │   └── test-api.js              # Script de testes
│   │   │   │
│   │   │   └── frontend/                     # Frontend React
│   │   │       ├── README.md                 # Docs do frontend
│   │   │       ├── package.json
│   │   │       ├── vite.config.ts
│   │   │       └── src/
│   │   │           ├── App.tsx               # Componente raiz
│   │   │           ├── main.tsx
│   │   │           ├── components/           # Componentes reutilizáveis
│   │   │           │   ├── PatientCard/
│   │   │           │   ├── Header/
│   │   │           │   ├── Historico/
│   │   │           │   └── Alarme/
│   │   │           ├── pages/                # Páginas da aplicação
│   │   │           │   ├── Dashboard.tsx
│   │   │           │   ├── AddPatientPage.tsx
│   │   │           │   ├── LoginPage.tsx
│   │   │           │   └── HistoricoPage.tsx
│   │   │           ├── service/
│   │   │           │   └── api.ts           # Cliente HTTP
│   │   │           └── Types/
│   │   │               └── types.ts         # Interfaces
│   │   │
│   │   └── DSIM-INO/                        # Firmware Arduino/ESP8266
│   │       ├── README.md                    # Docs do firmware
│   │       ├── ESP8266/
│   │       │   └── ESP8266.ino             # Código alternativo
│   │       └── PulseiraMonitoramentoPT1.ino # Firmware principal
│   │
│   ├── 4.Testes/                           # Casos de teste
│   └── 5.Implantação/                      # Guias de deploy
│
└── Gerenciamento de Projeto/
    └── Atas/                               # Reuniões do projeto
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **AWS Account** - [AWS Academy Learner Lab](https://awsacademy.instructure.com/)
- **Arduino IDE** - [Download](https://www.arduino.cc/en/software)
- **ESP8266 Core** - Instalar via Arduino IDE Board Manager
- **Hardware**:
  - ESP8266 (NodeMCU ou similar)
  - Sensor MAX30102 (BPM + SpO2)
  - Sensor MLX90614 ou DS18B20 (Temperatura)
  - Botão de pânico
  - Buzzer

### 1. Clonar o Repositório

```bash
git clone https://github.com/FTakElu/DSIM.git
cd DSIM
```

### 2. Configurar Backend

```bash
cd "Desenvolvimento/3.Implementação/DSIM-COD/backend"

# Instalar dependências
npm install

# Criar arquivo .env com suas credenciais AWS
# (Veja backend/README.md para detalhes)

# Criar tabelas DynamoDB
# (Execute via AWS Console ou script setup-dynamodb.bat)

# Iniciar servidor
npm run dev
```

Servidor disponível em: **http://localhost:9999**

### 3. Configurar Frontend

```bash
cd "Desenvolvimento/3.Implementação/DSIM-COD/frontend"

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Aplicação disponível em: **http://localhost:5173**

### 4. Configurar Pulseira IoT

1. Abra `Desenvolvimento/3.Implementação/DSIM-INO/PulseiraMonitoramentoPT1.ino` no Arduino IDE
2. Configure WiFi (linhas 8-9)
3. Os certificados AWS já estão incluídos no código
4. Compile e envie para o ESP8266
5. Abra o Serial Monitor (115200 baud) para verificar conexão

Veja `DSIM-INO/README.md` para instruções detalhadas.

### 5. Configurar AWS IoT Core

**Via Console AWS:**

1. Acesse **IoT Core** → **Settings** → Copie o endpoint
2. **Manage** → **Things** → Verifique `Pulseira_DSIM`
3. **Message routing** → **Rules** → Verifique `DadosPulseiraToDynamoDB`
4. **Test** → **MQTT test client** → Subscribe `pulseira/dados` para ver dados chegando

## 🧪 Testando o Sistema

### 1. Backend

```bash
cd backend
node test-api.js
```

Você deve ver:
- ✅ Health check: OK
- ✅ Registro: Status 201
- ✅ Login: Status 200 com token JWT

### 2. IoT → DynamoDB

```bash
aws dynamodb scan --table-name DSIM_SensorData --region us-east-1 --max-items 5
```

Deve retornar registros com `deviceId`, `timestamp`, `batimentos`, `oxigenio`, `temperatura`.

### 3. Frontend → Backend

1. Acesse http://localhost:5173
2. Faça login com as credenciais criadas
3. Cadastre um paciente
4. Vincule o device `Pulseira_DSIM` ao paciente
5. Veja os dados em tempo real no dashboard

## 📊 Fluxo de Dados Completo

```
1. ESP8266 coleta sensores (BPM, SpO2, Temp)
   ↓
2. Publica via MQTT no tópico "pulseira/dados"
   ↓
3. AWS IoT Core recebe mensagem
   ↓
4. Regra IoT adiciona timestamp e insere no DynamoDB (SensorData)
   ↓
5. DynamoDB Stream dispara Lambda
   ↓
6. Lambda:
   - Calcula MEWS
   - Verifica alarmes
   - Atualiza tabela Patients
   - Envia alerta via WebSocket (se necessário)
   ↓
7. Backend API disponibiliza dados via REST
   ↓
8. Frontend exibe em tempo real no Dashboard
```

## 🔐 Segurança

- **TLS/SSL**: Todas as comunicações criptografadas
- **Certificados X.509**: Autenticação mútua dispositivo ↔ AWS
- **JWT**: Tokens com expiração de 24h
- **Bcrypt**: Senhas hasheadas com salt
- **CORS**: Configurado para permitir apenas origens confiáveis
- **AWS IAM**: Políticas de menor privilégio

## 🧩 Tecnologias Utilizadas

### Backend
- Node.js 18+ com TypeScript
- Express 4.18 (API REST)
- WebSocket (ws) - Alertas em tempo real
- AWS SDK v3 (DynamoDB, IoT)
- JWT (jsonwebtoken)
- Bcrypt (criptografia de senhas)

### Frontend
- React 18
- TypeScript
- Vite (build tool)
- Axios (cliente HTTP)
- CSS Modules
- WebSocket API

### IoT
- ESP8266 Arduino Core
- PubSubClient (MQTT)
- ArduinoJson
- WiFiClientSecure (TLS)

### AWS
- **IoT Core**: MQTT broker, Thing registry, Rules
- **DynamoDB**: 5 tabelas (SensorData, Patients, Users, Alarms, Connections)
- **Lambda**: Processamento serverless
- **CloudWatch**: Logs e monitoramento

## 📚 Documentação Adicional

- **Backend**: `Desenvolvimento/3.Implementação/DSIM-COD/backend/README.md`
- **Frontend**: `Desenvolvimento/3.Implementação/DSIM-COD/frontend/README.md`
- **IoT Firmware**: `Desenvolvimento/3.Implementação/DSIM-INO/README.md`
- **Deployment**: `Desenvolvimento/3.Implementação/DSIM-COD/backend/DEPLOYMENT_GUIDE.md`
- **API Reference**: `Desenvolvimento/3.Implementação/DSIM-COD/backend/QUICK_REFERENCE.md`

## 🐛 Troubleshooting

### Backend não conecta ao DynamoDB
- Verifique credenciais AWS no `.env`
- Confirme que `AWS_SESSION_TOKEN` está configurado (AWS Academy)
- Certifique-se de que as tabelas existem

### IoT não envia dados
- Verifique conexão WiFi no Serial Monitor
- Confirme endpoint do IoT Core no código
- Verifique certificados (devem incluir BEGIN/END)

### Frontend não carrega dados
- Confirme que backend está rodando (porta 9999)
- Verifique token JWT (deve estar válido)
- Veja console do navegador (F12) para erros

## ⚖️ Licença

Este projeto é parte de um Trabalho de Conclusão de Curso (TCC) e está disponível para fins educacionais e de pesquisa. Para uso comercial ou redistribuição, entre em contato com o autor.

## 👥 Autores

- **Flávia Alessandra Elugo da Silva** - Desenvolvedora Principal
- **Instituição**: Instituto Federal de São Paulo (IFSP) - Campus Salto

## 🤝 Contribuições

Este é um projeto acadêmico em desenvolvimento. Sugestões e feedback são bem-vindos através de Issues no GitHub.

## 📧 Contato

- GitHub: [@FTakElu](https://github.com/FTakElu)

---

**Desenvolvido com ❤️ no IFSP - Campus Salto**
