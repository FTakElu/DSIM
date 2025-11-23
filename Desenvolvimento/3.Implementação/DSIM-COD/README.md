# DSIM-COD - Sistema de Monitoramento de Pacientes IoT

Sistema completo de monitoramento de sinais vitais em tempo real utilizando pulseiras IoT, AWS e React.

## 🌐 Infraestrutura Implantada (Produção)

### Recursos AWS Ativos

| Recurso | Identificador | URL/IP | Status |
|---------|---------------|--------|--------|
| **EC2 Instance** | `i-0019770d6275005b2` | `98.95.251.71` | ✅ Rodando |
| **Elastic IP** | `eipalloc-059c204aea5f1234f` | `98.95.251.71` | ✅ Fixo |
| **API Gateway** | `87xx2k2vn5` | `https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com` | ✅ Ativo |
| **Security Group** | `sg-0f38c9d3a91bd3473` | Portas: 22, 80, 443, 9999 | ✅ Configurado |
| **Backend (Direto)** | HTTP | `http://98.95.251.71:9999` | ✅ Acessível |
| **DynamoDB** | 5 tabelas | `us-east-1` | ✅ Ativas |
| **Process Manager** | PM2 | `dsim-backend` | ✅ Auto-restart |

### Endpoints Públicos

- **API Gateway (Produção)**: `https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com`
- **Backend EC2 (Direto)**: `http://98.95.251.71:9999`
- **Health Check**: `https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com/health`

---

## 🏥 Visão Geral

O DSIM é um sistema de monitoramento remoto de pacientes que coleta sinais vitais (batimentos cardíacos, saturação de oxigênio e temperatura) através de pulseiras IoT equipadas com ESP8266, processa os dados na nuvem AWS e exibe informações em tempo real em uma aplicação web React.

### Principais Funcionalidades

- ✅ Monitoramento em tempo real de sinais vitais
- ✅ Cálculo automático do escore MEWS (Modified Early Warning Score)
- ✅ Alertas personalizáveis por paciente
- ✅ Histórico completo de dados com visualização gráfica
- ✅ Interface web responsiva e intuitiva
- ✅ Autenticação segura com JWT
- ✅ Comunicação segura via MQTT/TLS
- ✅ Arquitetura serverless escalável

## 🏗️ Arquitetura

```
┌──────────────────┐
│  Pulseira IoT    │
│    (ESP8266)     │
│  Sensores: FC,   │
│  SpO2, Temp      │
└────────┬─────────┘
         │ MQTT/TLS
         ▼
┌──────────────────┐       ┌──────────────────┐
│  AWS IoT Core    │──────▶│   DynamoDB       │
│  (Broker MQTT)   │ Rule  │  (SensorData)    │
└──────────────────┘       └────────┬─────────┘
                                    │ Stream
                                    ▼
┌──────────────────┐       ┌──────────────────┐
│   Frontend       │       │  AWS Lambda      │
│   React + Vite   │       │  (Processor)     │
│   Amplify        │       └────────┬─────────┘
└────────┬─────────┘                │
         │                           │ Update
         │ HTTP/WS                   ▼
         ▼                   ┌──────────────────┐
┌──────────────────┐        │   DynamoDB       │
│  API Gateway     │◀───────│  • Patients      │
│  (REST + WS)     │        │  • Users         │
└────────┬─────────┘        │  • Alarms        │
         │                  └──────────────────┘
         │ Proxy
         ▼
┌──────────────────┐
│  Backend EC2     │
│  Node.js/Express │
│  + WebSocket     │
│  + Nginx         │
└──────────────────┘
```

## 📂 Estrutura do Projeto

```
DSIM-COD/
├── backend/                    # Backend Node.js/Express + Lambda
│   ├── src/
│   │   ├── config/            # Configurações AWS
│   │   ├── middleware/        # Autenticação JWT
│   │   ├── routes/            # APIs REST
│   │   ├── types/             # Tipos TypeScript
│   │   ├── utils/             # Utilitários (MEWS)
│   │   ├── server.ts          # Servidor Express
│   │   └── websocket.ts       # Servidor WebSocket
│   ├── lambda/                # Função Lambda
│   │   └── src/
│   │       └── index.ts       # Processador de sensores
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── README.md              # 📖 Documentação principal
│   ├── DEPLOYMENT_GUIDE.md    # 🚀 Guia de implantação AWS
│   ├── DYNAMODB_STRUCTURE.md  # 📊 Estrutura das tabelas
│   ├── IMPLEMENTATION_SUMMARY.md # ✨ Resumo completo
│   ├── CHECKLIST.md           # ✅ Checklist de implementação
│   └── QUICK_REFERENCE.md     # ⚡ Comandos rápidos
│
└── frontend/                   # Frontend React + Vite
    ├── src/
    │   ├── components/        # Componentes React
    │   ├── pages/             # Páginas
    │   ├── service/           # API client
    │   ├── styles/            # Estilos CSS
    │   └── types/             # Tipos TypeScript
    ├── public/
    ├── package.json
    ├── vite.config.ts
    └── README.md
```

## 🚀 Início Rápido

### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais AWS

# Compilar
npm run build

# Executar em desenvolvimento
npm run dev
```

### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

### 3. ESP8266

1. Abra `DSIM-INO/ESP8266/ESP8266.ino` no Arduino IDE
2. Configure WiFi e certificados AWS IoT
3. Faça upload para o ESP8266
4. Consulte `README_ESP8266.md` para detalhes

## 📖 Documentação Completa

### Backend
- **[README.md](backend/README.md)** - Documentação geral do backend
- **[DEPLOYMENT_GUIDE.md](backend/DEPLOYMENT_GUIDE.md)** - Guia completo de implantação AWS
- **[DYNAMODB_STRUCTURE.md](backend/DYNAMODB_STRUCTURE.md)** - Estrutura das 5 tabelas DynamoDB
- **[IMPLEMENTATION_SUMMARY.md](backend/IMPLEMENTATION_SUMMARY.md)** - Resumo da implementação
- **[CHECKLIST.md](backend/CHECKLIST.md)** - Checklist passo a passo
- **[QUICK_REFERENCE.md](backend/QUICK_REFERENCE.md)** - Comandos rápidos e úteis

### ESP8266
- **[ESP8266.ino](../DSIM-INO/ESP8266/ESP8266.ino)** - Código do dispositivo IoT
- **[README_ESP8266.md](../DSIM-INO/ESP8266/README_ESP8266.md)** - Guia de configuração

## 🛠️ Tecnologias Utilizadas

### Hardware
- **ESP8266** (NodeMCU) - Microcontrolador WiFi
- **Sensores** (simulados ou reais):
  - MAX30102 - Batimentos cardíacos e SpO2
  - MLX90614 ou DS18B20 - Temperatura

### Backend
- **Node.js** 18+ com TypeScript
- **Express** - Framework web
- **JWT** - Autenticação
- **WebSocket** (ws) - Comunicação em tempo real
- **AWS SDK v3** - Integração com AWS

### AWS Services
- **IoT Core** - Broker MQTT
- **DynamoDB** - Banco de dados NoSQL
- **Lambda** - Processamento serverless
- **EC2** - Servidor backend
- **API Gateway** - Proxy HTTP/WebSocket
- **Amplify** - Hospedagem frontend
- **CloudWatch** - Logs e monitoramento

### Frontend
- **React** 18 com TypeScript
- **Vite** - Build tool
- **Axios** - Cliente HTTP
- **React Router** - Roteamento
- **Recharts** - Gráficos
- **CSS Modules** - Estilos

## 📊 Fluxo de Dados

1. **Coleta**: Pulseira ESP8266 coleta sinais vitais
2. **Envio**: Dados enviados via MQTT/TLS para AWS IoT Core
3. **Armazenamento**: Regra IoT salva dados no DynamoDB (SensorData)
4. **Processamento**: Lambda processa dados, calcula MEWS, verifica alarmes
5. **Atualização**: Lambda atualiza dados do paciente no DynamoDB
6. **Notificação**: Alertas enviados via WebSocket em tempo real
7. **Visualização**: Frontend exibe dados atualizados instantaneamente

## 🧮 Sistema MEWS

O sistema calcula automaticamente o Modified Early Warning Score baseado em:

### Frequência Cardíaca
- < 40 bpm: +3 pontos
- 40-50: +1
- 50-100: 0 (normal)
- 101-110: +1
- 111-129: +2
- ≥130: +3

### Saturação de O2
- < 85%: +3 pontos
- 85-89: +2
- 90-94: +1
- ≥95: 0 (normal)

### Temperatura
- < 35°C: +2 pontos
- 35-35.9: +1
- 36-38: 0 (normal)
- 38.1-39: +1
- >39: +2

**Status**: Stable (0-2), Warning (3-4), Danger (≥5)

## 🔐 Segurança

- ✅ Autenticação JWT para APIs
- ✅ Senhas hasheadas com bcrypt
- ✅ Comunicação IoT via TLS/certificados
- ✅ HTTPS no frontend e backend
- ✅ Variáveis sensíveis em `.env`
- ✅ CORS configurado
- ✅ Validação de entrada

## 📈 Deploy

### Infraestrutura AWS Implantada

O sistema DSIM está hospedado na AWS com os seguintes recursos em produção:

**Recursos AWS ativos:**
1. ✅ EC2 (i-0019770d6275005b2): Instância t2.micro com backend Node.js + PM2
2. ✅ Elastic IP (98.95.251.71): IP fixo permanente
3. ✅ API Gateway (87xx2k2vn5): HTTP API com proxy para EC2
4. ✅ DynamoDB: 5 tabelas (Users, Patients, SensorData, Alarms, Connections)
5. ✅ Security Group (sg-0f38c9d3a91bd3473): Firewall configurado
6. ✅ Lambda (DSIM-MEWS-Processor): Processador com trigger DynamoDB Stream
7. ✅ AWS IoT Core: Thing `Pulseira_DSIM` conectado

**Endpoints ativos:**
- Backend EC2: `http://98.95.251.71:9999`
- API Gateway: `https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com`
- Frontend Amplify: (a configurar)

**Acesso à EC2:**

```cmd
# Via SSH
ssh -i "../CERTIFICADOS/dsim_keypair.pem" ec2-user@98.95.251.71

# Ver status do backend
pm2 status

# Ver logs
pm2 logs dsim-backend

# Reiniciar
pm2 restart dsim-backend
```

**Gerenciamento de Credenciais AWS Academy:**

As credenciais AWS Academy expiram a cada 2-4 horas. Para atualizar na EC2:

```cmd
# No Windows (raiz do projeto):
aws configure  # Colar novas credenciais da AWS Academy
update_ec2_credentials.bat  # Atualiza automaticamente na EC2
```

**Frontend no Amplify:**
- Console AWS Amplify: https://console.aws.amazon.com/amplify/
- Repositório: `FTakElu/DSIM` (branch `main`)
- Variável necessária: `VITE_API_URL=https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com`

**Documentação completa**: [`../../GUIA_DEPLOY.md`](../../GUIA_DEPLOY.md)

## 🧪 Testes

```bash
# Backend
cd backend
npm run build
npm run dev

# Testar endpoint
curl http://localhost:9999/health

# Registrar usuário
curl -X POST http://localhost:9999/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin","email":"admin@dsim.com","senha":"senha123"}'
```

## 📞 Suporte

- **Documentação AWS**: https://docs.aws.amazon.com
- **Node.js**: https://nodejs.org
- **React**: https://react.dev
- **ESP8266**: https://arduino-esp8266.readthedocs.io

## 👥 Equipe

Projeto desenvolvido como parte do curso de Engenharia/Computação.

## 📄 Licença

MIT License - Veja LICENSE para detalhes.

---

## 🎯 Próximos Passos

1. Ler [DEPLOYMENT_GUIDE.md](backend/DEPLOYMENT_GUIDE.md)
2. Configurar AWS usando [CHECKLIST.md](backend/CHECKLIST.md)
3. Testar sistema end-to-end
4. Documentar deployment específico

---

**Desenvolvido com ❤️ para monitoramento de saúde em tempo real**
