# DSIM - Dispositivo de Segurança Inteligente para Monitoramento
## (Intelligent Security Device for Monitoring)

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Arduino](https://img.shields.io/badge/-Arduino-00979D?style=for-the-badge&logo=Arduino&logoColor=white) ![C++](https://img.shields.io/badge/c++-%2300599C.svg?style=for-the-badge&logo=c%2B%2B&logoColor=white) ![AmazonDynamoDB](https://img.shields.io/badge/Amazon%20DynamoDB-4053D6?style=for-the-badge&logo=Amazon%20DynamoDB&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

![ProjectLogo](https://github.com/FTakElu/DSIM/blob/6a314038459ba6172102d95c006211f7e44ce688/Desenvolvimento/3.Implementa%C3%A7%C3%A3o/DSIM-COD/DSIM/public/images/DSIM_logoExtensa.png?raw=true)

## 📌 Sobre o DSIM

Como parte de um trabalho de conclusão de curso em Ciência da Computação no Instituto Federal de São Paulo – Campus Salto, o projeto DSIM (Dispositivo de Segurança Inteligente para Monitoramento) consiste no desenvolvimento de uma solução wearable que compreende uma pulseira inteligente integrada a uma plataforma web, projetada para monitorar usuários que possam estar em situações de risco ou vulnerabilidade.

O sistema monitora continuamente sinais vitais, localização e movimento, emitindo alertas automáticos através de seus recursos inteligentes quando necessário. Ao fornecer dados em tempo real tanto para os usuários quanto para seus cuidadores ou familiares, o DSIM promove maior segurança e autonomia, permite respostas mais rápidas em situações críticas e melhora a qualidade geral do atendimento assistido.

## ☁️ Infraestrutura AWS em Produção

O sistema DSIM está hospedado completamente na AWS (Amazon Web Services) com os seguintes recursos ativos:

### Recursos Principais

| Recurso | ID/Identificador | Função |
|---------|------------------|--------|
| **EC2 Instance** | `i-0019770d6275005b2` | Servidor rodando backend Node.js com PM2 (t2.micro) |
| **Elastic IP** | `98.95.251.71` | IP público fixo da EC2 (não muda após reiniciar) |
| **API Gateway** | `87xx2k2vn5` | HTTP API que faz proxy entre frontend e backend |
| **Security Group** | `sg-0f38c9d3a91bd3473` | Firewall com portas 22, 80, 443, 9999 abertas |
| **Lambda Function** | `DSIM-MEWS-Processor` | Calcula score MEWS e processa alarmes automaticamente |
| **IoT Thing** | `Pulseira_DSIM` | Dispositivo IoT registrado para comunicação MQTT |
| **Region** | `us-east-1` | Região AWS (Virgínia do Norte) |

### DynamoDB Tables (5 tabelas ativas)

| Tabela | Chave Primária | Função | Recursos Especiais |
|--------|----------------|--------|-------------------|
| **DSIM_Users** | `userId` | Armazena usuários do sistema | - |
| **DSIM_Patients** | `patientId` | Dados dos pacientes monitorados | GSI: `deviceId-index` |
| **DSIM_SensorData** | `deviceId` + `timestamp` | Histórico de leituras das pulseiras | DynamoDB Stream (trigger Lambda) |
| **DSIM_Alarms** | `pacienteId` | Configurações de alarmes personalizados | - |
| **DSIM_Connections** | `connectionId` | Gerencia conexões WebSocket ativas | TTL habilitado |

### Endpoints Ativos

- **Backend (EC2)**: `http://98.95.251.71:9999`
- **API Gateway**: `https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com`
- **AWS IoT Endpoint**: `a2cs805qynf1nj-ats.iot.us-east-1.amazonaws.com`
- **Frontend (Amplify)**: *A configurar*

### 🔑 Gerenciamento de Credenciais (AWS Academy)

O projeto utiliza AWS Academy, que gera **credenciais temporárias com validade de 2-4 horas**. 

Para atualizar as credenciais automaticamente na EC2:

```cmd
# 1. Atualizar credenciais localmente
aws configure  # Colar novas credenciais da sessão AWS Academy

# 2. Executar script automático
update_ec2_credentials.bat  # Atualiza .env na EC2 e reinicia backend
```

**Arquivo responsável**: `update_ec2_credentials.bat` (raiz do projeto)

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
- ✅ **CRUD Completo**: Create, Read, Update, Delete para gerenciamento de pacientes
- ✅ **Gestão de Dispositivos IoT**: Endpoint para listar pulseiras disponíveis e atribuí-las
- ✅ **Autenticação JWT**: Login seguro com tokens de 24 horas
- ✅ **Cálculo MEWS**: Modified Early Warning Score automático baseado em sinais vitais
- ✅ **WebSocket**: Alertas em tempo real para o frontend (porta 8080)
- ✅ **Integração AWS**: DynamoDB, IoT Core e Lambda
- ✅ **Validações**: Verificação de dados de entrada e tratamento de erros

### Lambda Processor
- ✅ **Processamento de Stream**: Analisa dados do DynamoDB Stream
- ✅ **Detecção de Anomalias**: Verifica limites de alarmes configurados
- ✅ **Cálculo de Score**: MEWS baseado em sinais vitais
- ✅ **Notificações**: Envia alertas via WebSocket quando necessário

### Frontend (React + TypeScript)
- ✅ **Dashboard de Pacientes**: Visualização em cards com dados em tempo real
- ✅ **Sistema de Cores Inteligente**: 
  - 🟢 Verde: Sinais vitais normais
  - 🟡 Amarelo: Valores próximos aos limites (atenção)
  - 🔴 Vermelho: Valores críticos excedendo limites
- ✅ **Cadastro Completo**: Formulário com upload de foto, dados pessoais, contato de emergência e histórico médico
- ✅ **Edição de Pacientes**: Atualização de dados com formulário pré-preenchido
- ✅ **Exclusão Segura**: Remoção de pacientes com confirmação
- ✅ **Gestão de Dispositivos**: Atribuição e visualização de pulseiras IoT disponíveis
- ✅ **Histórico Visual**: Gráficos interativos de sinais vitais
- ✅ **Alertas em Tempo Real**: Notificações via WebSocket
- ✅ **Configuração de Alarmes**: Limites personalizados por paciente com base em MEWS
- ✅ **Interface Responsiva**: Adaptável para desktop, tablet e mobile

## 📁 Estrutura do Projeto

```
DSIM/
├── README.md                                    # Este arquivo
├── amplify.yml                                  # Configuração de build do AWS Amplify
├── update_ec2_credentials.bat                   # Script para atualizar credenciais AWS na EC2
├── GUIA_DEPLOY.md                              # Documentação completa da infraestrutura AWS
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

## 🛠️ Infraestrutura AWS Implantada

### O que foi criado na AWS

O projeto DSIM está hospedado na AWS com a seguinte infraestrutura:

#### 🖥️ **Amazon EC2 (Servidor Backend)**
- **Instância**: `i-0019770d6275005b2`
- **Tipo**: t2.micro (Free Tier elegível)
- **IP Fixo (Elastic IP)**: `98.95.251.71`
- **Sistema Operacional**: Amazon Linux 2023
- **Função**: Roda o backend Node.js/Express com PM2
- **Portas abertas**: 22 (SSH), 80 (HTTP), 443 (HTTPS), 9999 (Backend API)

**O que está rodando:**
- Backend Node.js na porta 9999
- Gerenciado pelo PM2 (Process Manager) com auto-restart
- Conecta ao DynamoDB para armazenar dados
- Recebe dados das pulseiras IoT via AWS IoT Core

#### 🌐 **API Gateway**
- **ID**: `87xx2k2vn5`
- **Tipo**: HTTP API
- **URL Pública**: `https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com`
- **Função**: Atua como proxy entre o frontend e o backend EC2
- **Integração**: Redireciona todas as requisições para `http://98.95.251.71:9999`
- **CORS**: Configurado para aceitar requisições do frontend
- **Auto-deploy**: Habilitado (mudanças são aplicadas automaticamente)

#### 🗄️ **DynamoDB (Banco de Dados)**
- **Região**: us-east-1 (Virgínia do Norte)
- **Modo de cobrança**: On-Demand (paga apenas pelo que usa)
- **Tabelas criadas** (5 no total):

1. **DSIM_Users**
   - Armazena usuários do sistema (médicos, enfermeiros)
   - Chave primária: `userId`

2. **DSIM_Patients**
   - Dados dos pacientes monitorados
   - Chave primária: `patientId`
   - Inclui: nome, dados vitais, histórico médico, device vinculado

3. **DSIM_SensorData**
   - Leituras das pulseiras IoT
   - Chave primária: `deviceId` + `timestamp`
   - DynamoDB Stream habilitado (dispara Lambda)

4. **DSIM_Alarms**
   - Configurações de alarmes personalizados por paciente
   - Chave primária: `pacienteId`

5. **DSIM_Connections**
   - Gerencia conexões WebSocket ativas
   - Chave primária: `connectionId`

#### ⚡ **AWS Lambda**
- **Função**: `DSIM-MEWS-Processor`
- **Runtime**: Node.js 18.x
- **Trigger**: DynamoDB Stream da tabela `DSIM_SensorData`
- **Função**: 
  - Processa dados de sensores em tempo real
  - Calcula score MEWS (Modified Early Warning Score)
  - Verifica limites de alarmes
  - Envia alertas via WebSocket quando necessário

#### 📡 **AWS IoT Core**
- **Thing Name**: `Pulseira_DSIM`
- **Endpoint**: `a2cs805qynf1nj-ats.iot.us-east-1.amazonaws.com`
- **Protocolo**: MQTT com TLS 1.2
- **Tópicos**:
  - Publicação: `pulseira/dados` (pulseira envia dados)
  - Comandos: `pulseira/comandos` (backend envia comandos)
- **Regra IoT**: `DadosPulseiraToDynamoDB` (insere dados no DynamoDB automaticamente)

#### 🔒 **Security Group**
- **ID**: `sg-0f38c9d3a91bd3473`
- **Nome**: `dsim-sg`
- **Regras de entrada**:
  - Porta 22 (SSH): Para acesso administrativo
  - Porta 80 (HTTP): Para tráfego web
  - Porta 443 (HTTPS): Para tráfego seguro
  - Porta 9999 (Custom TCP): Para o backend Node.js

#### 🌍 **AWS Amplify** (Frontend)
- **Função**: Hospedagem do frontend React
- **Deploy**: Automático a cada push no GitHub (branch `main`)
- **Build**: Vite compila o React TypeScript
- **Variável de ambiente**: `VITE_API_URL` aponta para o API Gateway

---

## 🔑 Gerenciamento de Credenciais AWS Academy

### ⚠️ Problema: Credenciais Temporárias

Contas AWS Academy geram credenciais que **expiram a cada 2-4 horas**. Quando isso acontece:
- Backend perde acesso ao DynamoDB
- Sistema para de funcionar
- Precisa atualizar as credenciais na EC2

### ✅ Solução: Script Automático

O projeto inclui um script que **atualiza automaticamente** as credenciais AWS na EC2.

**Arquivo**: `update_ec2_credentials.bat` (raiz do projeto)

**O que o script faz:**
1. Lê suas credenciais AWS do arquivo local `~/.aws/credentials`
2. Conecta via SSH na instância EC2 (`98.95.251.71`)
3. Atualiza o arquivo `.env` do backend com as novas credenciais
4. Reinicia o backend automaticamente
5. Tudo em menos de 10 segundos!

**Quando usar:**
```cmd
# Quando iniciar nova sessão AWS Academy:
1. aws configure  # Colar novas credenciais da AWS Academy

2. update_ec2_credentials.bat  # Atualizar na EC2 automaticamente
```

---

## 🚀 Como o Sistema Funciona

### Fluxo Completo de Dados

```
1. Pulseira IoT (ESP8266)
   └─> Coleta sinais vitais (BPM, SpO2, Temperatura)
   └─> Publica via MQTT/TLS no tópico "pulseira/dados"
        ↓
2. AWS IoT Core
   └─> Recebe mensagem MQTT
   └─> Regra IoT adiciona timestamp
   └─> Insere no DynamoDB (tabela SensorData)
        ↓
3. DynamoDB Stream
   └─> Dispara Lambda automaticamente
        ↓
4. Lambda Function (DSIM-MEWS-Processor)
   └─> Calcula score MEWS
   └─> Verifica alarmes configurados
   └─> Atualiza tabela Patients
   └─> Envia alerta via WebSocket (se necessário)
        ↓
5. Backend API (EC2)
   └─> Serve dados via API REST
   └─> Mantém conexões WebSocket
        ↓
6. API Gateway
   └─> Faz proxy das requisições
   └─> Frontend ←→ Backend
        ↓
7. Frontend (Amplify)
   └─> Exibe dados em tempo real
   └─> Atualiza interface automaticamente
```

---

## 💻 Desenvolvimento Local (Opcional)

Se quiser rodar o sistema localmente para testes ou desenvolvimento:

### Backend Local

```bash
cd "Desenvolvimento/3.Implementação/DSIM-COD/backend"
npm install

# Criar arquivo .env com suas credenciais AWS
# (Ver backend/README.md para detalhes)

npm run dev  # Roda na porta 9999
```

### Frontend Local

```bash
cd "Desenvolvimento/3.Implementação/DSIM-COD/frontend"
npm install

# Configurar URL da API em src/service/api.ts
# Para usar backend de produção:
# baseURL: 'https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com'

npm run dev  # Roda na porta 5173
```

### Pulseira IoT (Arduino/ESP8266)

1. Abra `Desenvolvimento/3.Implementação/DSIM-INO/PulseiraMonitoramentoPT1.ino` no Arduino IDE
2. Configure seu WiFi (linhas 8-9)
3. Os certificados AWS já estão no código
4. Compile e faça upload para o ESP8266
5. Abra o Serial Monitor (115200 baud) para ver os dados sendo enviados

Detalhes completos em: `DSIM-INO/README.md`

---

## 🧪 Como Testar o Sistema

### 1. Testar Backend (Produção)

```bash
# Via API Gateway (recomendado)
curl https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com/health

# Direto na EC2
curl http://98.95.251.71:9999/health

# Resposta esperada:
# {"status":"OK","timestamp":"2025-11-23T..."}
```

### 2. Testar Conexão com DynamoDB

```bash
# Listar pacientes
curl https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com/api/pacientes \
  -H "Authorization: Bearer SEU_TOKEN_JWT"

# Ver dados de sensores
aws dynamodb scan --table-name DSIM_SensorData --region us-east-1 --max-items 5
```

### 3. Testar IoT → DynamoDB

Publique uma mensagem no AWS IoT Console:

**Topic**: `pulseira/dados`

**Payload**:
```json
{
  "deviceId": "Pulseira_DSIM",
  "batimentos": 75,
  "oxigenio": 98,
  "temperatura": 36.5,
  "panico_ativo": false
}
```

Verifique se os dados aparecem no DynamoDB (tabela `DSIM_SensorData`).

---

## 📚 Documentação Detalhada

Cada componente tem sua própria documentação completa:

- **Backend**: `Desenvolvimento/3.Implementação/DSIM-COD/backend/README.md`
- **Frontend**: `Desenvolvimento/3.Implementação/DSIM-COD/frontend/README.md`
- **Lambda**: `Desenvolvimento/3.Implementação/DSIM-COD/backend/lambda/README.md`
- **Pulseira IoT**: `Desenvolvimento/3.Implementação/DSIM-INO/README.md`
- **Guia de Deploy**: `GUIA_DEPLOY.md`

## 🧪 Testando o Sistema

### Script de Gerenciamento AWS

O projeto inclui um script essencial para gerenciar as credenciais AWS Academy:

| Script | Descrição |
|--------|-----------|
| `update_ec2_credentials.bat` | Atualiza automaticamente as credenciais AWS na EC2 quando sessão AWS Academy expira |

**Como usar:**

```cmd
# Quando iniciar nova sessão AWS Academy (a cada 2-4h):
aws configure  # Colar novas credenciais da AWS Academy
update_ec2_credentials.bat  # Atualizar automaticamente na EC2
```

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
