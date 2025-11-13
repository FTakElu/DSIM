# Sistema DSIM - Monitoramento de Pacientes IoT

Sistema completo de monitoramento de sinais vitais em tempo real utilizando pulseiras IoT, AWS e React.

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
│   ├── scripts/
│   │   └── setup-dynamodb.sh # Script automação DynamoDB
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

### Ordem de Implantação

1. **DynamoDB** - Criar 5 tabelas
2. **AWS IoT Core** - Configurar Thing, certificados e regras
3. **Lambda** - Deploy da função de processamento
4. **EC2** - Deploy do backend Node.js
5. **API Gateway** - Configurar proxy
6. **Amplify** - Deploy do frontend

**Guia completo**: [DEPLOYMENT_GUIDE.md](backend/DEPLOYMENT_GUIDE.md)

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
