# DSIM - Dispositivo de Segurança Inteligente para Monitoramento

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Arduino](https://img.shields.io/badge/-Arduino-00979D?style=for-the-badge&logo=Arduino&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

![ProjectLogo](https://github.com/FTakElu/DSIM/blob/6a314038459ba6172102d95c006211f7e44ce688/Desenvolvimento/3.Implementa%C3%A7%C3%A3o/DSIM-COD/DSIM/public/images/DSIM_logoExtensa.png?raw=true)

## 📌 Sobre o Projeto

Trabalho de Conclusão de Curso em Ciência da Computação desenvolvido no **Instituto Federal de São Paulo – Campus Salto**.

O **DSIM** (Dispositivo de Segurança Inteligente para Monitoramento) é uma solução completa para monitoramento remoto de sinais vitais, composta por:

- 🩺 **Pulseira IoT** (ESP8266 + sensores) que coleta batimentos cardíacos, SpO2 e temperatura
- ☁️ **Infraestrutura AWS** com IoT Core, DynamoDB, Lambda, EC2 e SNS
- 💻 **Dashboard Web** em React com monitoramento em tempo real via WebSocket
- 📱 **Alertas por SMS/Email** para situações críticas usando AWS SNS

**Objetivo:** Promover segurança e autonomia para pessoas em situações de vulnerabilidade, permitindo respostas rápidas em emergências médicas.

## ☁️ Infraestrutura AWS em Produção

### Recursos Ativos

| Recurso | Identificador | URL/Função |
|---------|---------------|------------|
| **EC2 Instance** | `i-0019770d6275005b2` | Backend Node.js + PM2 (t2.micro) |
| **Elastic IP** | `98.95.251.71` | IP público fixo |
| **API Gateway (HTTP)** | `87xx2k2vn5` | `https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com` |
| **API Gateway (WebSocket)** | `kzjolz71nl` | `wss://kzjolz71nl.execute-api.us-east-1.amazonaws.com/production` |
| **SNS Topic** | `DSIM-Alertas` | `arn:aws:sns:us-east-1:565757789330:DSIM-Alertas` |
| **Lambda** | `DSIM-MEWS-Processor` | Processa streams e calcula MEWS |
| **IoT Thing** | `Pulseira_001` | Dispositivo registrado no IoT Core |
| **Amplify** | (branch `main`) | Frontend React auto-deploy |

### DynamoDB (5 tabelas)

- **DSIM_Users**: Usuários do sistema
- **DSIM_Patients**: Pacientes monitorados (com `deviceId`)
- **DSIM_SensorData**: Leituras IoT (Stream → Lambda)
- **DSIM_Alarms**: Alarmes personalizados
- **DSIM_Connections**: WebSocket connections

### Endpoints Públicos

- **Backend direto**: `http://98.95.251.71:9999` (apenas desenvolvimento)
- **API Gateway HTTP**: `https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com` (REST API)
- **API Gateway WebSocket**: `wss://kzjolz71nl.execute-api.us-east-1.amazonaws.com/production` (tempo real)
- **IoT MQTT**: `a2cs805qynf1nj-ats.iot.us-east-1.amazonaws.com:8883`

### 🔄 Atualizar Credenciais AWS (Academy)

Credenciais expiram a cada **2-4 horas**. Use o script automático:

```cmd
aws configure  # Colar novas credenciais AWS Academy
update_ec2_credentials.bat  # Atualiza EC2 e reinicia PM2
```

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
                            │  MEWS Processor │
                            │  + SNS Alerts   │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │  DynamoDB    │  │  AWS SNS     │  │  WebSocket   │
            │   Patients   │  │  (SMS/Email) │  │  (Socket.io) │
            └──────┬───────┘  └──────────────┘  └──────┬───────┘
                   │                                    │
                   └─────────┬──────────────────────────┘
                             ▼
                   ┌─────────────────┐
                   │  Backend API    │
                   │  Node.js/Express│
                   │   (EC2 + PM2)   │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │   Frontend      │
                   │  React + Vite   │
                   │  (AWS Amplify)  │
                   └─────────────────┘
```

## 🚀 Funcionalidades Implementadas

### Pulseira IoT (ESP8266)
- ✅ **Monitoramento Contínuo**: FC, SpO2 e temperatura a cada 10s
- ✅ **Botão de Pânico**: Acionamento manual de emergência
- ✅ **Comunicação Segura**: TLS 1.2 com certificados X.509
- ✅ **Reconexão Automática**: Recupera de quedas de conexão

### Backend (Node.js + TypeScript)
- ✅ **API RESTful**: CRUD completo de pacientes
- ✅ **Autenticação JWT**: Login seguro com bcrypt
- ✅ **WebSocket em Tempo Real**: Socket.io para alertas instantâneos
- ✅ **Alertas SNS**: SMS/Email para sinais vitais críticos
- ✅ **Endpoint IoT Público**: `/api/pacientes/iot/data` (sem JWT)
- ✅ **Cálculo MEWS**: Modified Early Warning Score automático
- ✅ **Thresholds de Alerta**:
  - Bradicardia: FC < 40 bpm
  - Taquicardia: FC > 120 bpm
  - Hipoxemia: SpO2 < 90%
  - Febre: Temp > 38°C
  - Hipotermia: Temp < 35°C

### Frontend (React + TypeScript)
- ✅ **Dashboard Interativo**: Cards com dados em tempo real
- ✅ **Sistema de Cores**: 🟢 Normal | 🟡 Atenção | 🔴 Crítico
- ✅ **Notificações Toast**: react-toastify para alertas visuais
- ✅ **Cadastro Completo**: Upload de foto, dados médicos, emergência
- ✅ **Histórico com Gráficos**: Visualização de tendências
- ✅ **Alarmes Personalizados**: Limites ajustáveis por paciente
- ✅ **Responsivo**: Mobile, tablet e desktop

### AWS Lambda
- ✅ **Trigger DynamoDB Stream**: Processamento automático
- ✅ **Cálculo MEWS**: Score de alerta precoce
- ✅ **Detecção de Anomalias**: Verifica limites configurados
- ✅ **Atualização de Pacientes**: Sincroniza dados em tempo real

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

## 💻 Desenvolvimento Local

Consulte os READMEs específicos para executar localmente:

- **Backend**: `cd backend && npm install && npm run dev` (porta 9999)
- **Frontend**: `cd frontend && npm install && npm run dev` (porta 5173)
- **ESP8266**: Configure WiFi no Arduino IDE, certificados já incluídos

Detalhes completos nos READMEs de cada módulo.

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

## 🧪 Como Testar o Sistema

### 1. Testar Backend (Health Check)

```bash
# Via API Gateway (produção)
curl https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com/health

# Resposta esperada: {"status":"OK","timestamp":"..."}
```

### 2. Criar Usuário e Paciente

```bash
# 1. Registrar usuário
curl -X POST http://98.95.251.71:9999/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin","email":"admin@dsim.com","senha":"senha123","role":"medico"}'

# 2. Fazer login (obter token)
curl -X POST http://98.95.251.71:9999/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dsim.com","senha":"senha123"}'

# 3. Criar paciente (usar token do passo 2)
curl -X POST http://98.95.251.71:9999/api/pacientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "nome": "Paciente Teste",
    "dataNascimento": "1980-01-01",
    "genero": "M",
    "telefone": "11999999999",
    "deviceId": "Pulseira_001"
  }'
```

### 3. Testar Envio de Dados IoT

```bash
# Simular dados da pulseira (valores críticos)
curl -X POST http://98.95.251.71:9999/api/pacientes/iot/data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "Pulseira_001",
    "frequencia_cardiaca": 130,
    "saturacao_oxigenio": 85,
    "temperatura": 39.5,
    "bateria": 70,
    "status": "ligado"
  }'

# Verificar logs do PM2
ssh -i CERTIFICADOS/dsim_keypair.pem ec2-user@98.95.251.71
pm2 logs dsim-backend --lines 50
```

### 4. Subscrever Alertas SNS

```bash
# Adicionar email para receber SMS/email de alertas
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:565757789330:DSIM-Alertas \
  --protocol email \
  --notification-endpoint seu-email@exemplo.com

# Confirmar inscrição no email recebido
```

### 5. Testar Frontend

1. Acesse a URL do Amplify após deploy
2. Faça login com `admin@dsim.com` / `senha123`
3. Veja o paciente criado no dashboard
4. Envie dados críticos via curl (passo 3)
5. Observe toast de alerta aparecer em tempo real

## 🛠️ Tecnologias Utilizadas

- **IoT**: ESP8266, MQTT/TLS, MAX30102, MLX90614
- **Backend**: Node.js 18+, TypeScript, Express, Socket.io, bcrypt, JWT
- **AWS**: IoT Core, DynamoDB, Lambda, EC2, SNS, API Gateway, Amplify
- **Frontend**: React 18, TypeScript, Vite, Axios, react-toastify

## 📚 Documentação Detalhada

- **[Backend README](Desenvolvimento/3.Implementação/DSIM-COD/backend/README.md)**: API, endpoints, configuração
- **[Frontend README](Desenvolvimento/3.Implementação/DSIM-COD/frontend/README.md)**: Componentes, páginas, deploy
- **[Firmware IoT README](Desenvolvimento/3.Implementação/DSIM-INO/README.md)**: ESP8266, sensores, certificados

## 🔐 Segurança

- ✅ TLS 1.2 em todas as comunicações
- ✅ Certificados X.509 para IoT
- ✅ JWT com expiração 24h
- ✅ Senhas hasheadas (bcrypt)
- ✅ CORS configurado
- ✅ Endpoint IoT público (sem JWT para dispositivos)

## 👥 Autores

- **Flávia Alessandra Elugo da Silva** - Desenvolvedora Principal
- **Gabriella Pereira Morais** - Desenvolvedora
- **Instituição**: Instituto Federal de São Paulo (IFSP) - Campus Salto

## 📧 Contato

- GitHub: [@FTakElu](https://github.com/FTakElu)
- GitHub: [@Bagmor](https://github.com/Bagmor)

---

**Desenvolvido com ❤️ no IFSP - Campus Salto**
