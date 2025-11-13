# Guia de Implantação AWS - Sistema DSIM

Este guia fornece instruções passo a passo para implantar o sistema DSIM na AWS com conta de estudante.

## Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configurar DynamoDB](#1-configurar-dynamodb)
3. [Configurar AWS IoT Core](#2-configurar-aws-iot-core)
4. [Configurar Lambda](#3-configurar-lambda)
5. [Configurar API Gateway](#4-configurar-api-gateway)
6. [Configurar EC2](#5-configurar-ec2-backend)
7. [Configurar Amplify](#6-configurar-amplify-frontend)
8. [Testar o Sistema](#7-testar-o-sistema)

---

## Pré-requisitos

- Conta AWS Academy Learner Lab (estudante)
- AWS CLI instalado e configurado
- Node.js 18+ instalado
- Git instalado

### Configurar AWS CLI

```bash
aws configure
# Insira suas credenciais:
# AWS Access Key ID: [sua access key]
# AWS Secret Access Key: [sua secret key]
# Default region: us-east-1
# Default output format: json
```

---

## 1. Configurar DynamoDB

### 1.1 Criar as Tabelas

Execute os comandos do arquivo `DYNAMODB_STRUCTURE.md`:

```bash
# Navegue até a pasta do backend
cd backend

# Execute os comandos de criação (já fornecidos no DYNAMODB_STRUCTURE.md)
# Ou use o script automatizado:
```

Crie o arquivo `scripts/setup-dynamodb.sh`:

```bash
#!/bin/bash

echo "Criando tabelas DynamoDB..."

# SensorData
aws dynamodb create-table \
  --table-name DSIM_SensorData \
  --attribute-definitions \
    AttributeName=deviceId,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=deviceId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_IMAGE

# Aguardar criação
aws dynamodb wait table-exists --table-name DSIM_SensorData

# Patients
aws dynamodb create-table \
  --table-name DSIM_Patients \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=deviceId,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    "[{\"IndexName\":\"deviceId-index\",\"KeySchema\":[{\"AttributeName\":\"deviceId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --billing-mode PAY_PER_REQUEST

aws dynamodb wait table-exists --table-name DSIM_Patients

# Users
aws dynamodb create-table \
  --table-name DSIM_Users \
  --attribute-definitions \
    AttributeName=email,AttributeType=S \
  --key-schema \
    AttributeName=email,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

aws dynamodb wait table-exists --table-name DSIM_Users

# Alarms
aws dynamodb create-table \
  --table-name DSIM_Alarms \
  --attribute-definitions \
    AttributeName=pacienteId,AttributeType=S \
  --key-schema \
    AttributeName=pacienteId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

aws dynamodb wait table-exists --table-name DSIM_Alarms

# Connections
aws dynamodb create-table \
  --table-name DSIM_Connections \
  --attribute-definitions \
    AttributeName=connectionId,AttributeType=S \
    AttributeName=pacienteId,AttributeType=S \
  --key-schema \
    AttributeName=connectionId,KeyType=HASH \
  --global-secondary-indexes \
    "[{\"IndexName\":\"pacienteId-index\",\"KeySchema\":[{\"AttributeName\":\"pacienteId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --billing-mode PAY_PER_REQUEST

aws dynamodb wait table-exists --table-name DSIM_Connections

# TTL
aws dynamodb update-time-to-live \
  --table-name DSIM_Connections \
  --time-to-live-specification "Enabled=true,AttributeName=ttl"

echo "Tabelas criadas com sucesso!"
```

Execute:
```bash
chmod +x scripts/setup-dynamodb.sh
./scripts/setup-dynamodb.sh
```

---

## 2. Configurar AWS IoT Core

### 2.1 Criar Thing (Dispositivo)

1. Acesse **AWS IoT Core** > **Manage** > **Things**
2. Clique em **Create things** > **Create single thing**
3. Nome: `DSIM_Pulseira_001`
4. Device Shadow: **Named shadow**
5. Clique em **Next**

### 2.2 Configurar Certificados

Você já tem os certificados na pasta `CERTIFICADOS/`. Anote o ID do certificado.

### 2.3 Criar Política IoT

```bash
aws iot create-policy \
  --policy-name DSIM-IoT-Policy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["iot:Connect", "iot:Publish", "iot:Subscribe", "iot:Receive"],
        "Resource": "*"
      }
    ]
  }'
```

### 2.4 Anexar Política ao Certificado

```bash
aws iot attach-policy \
  --policy-name DSIM-IoT-Policy \
  --target "arn:aws:iot:us-east-1:ACCOUNT_ID:cert/CERT_ID"
```

### 2.5 Criar Regra IoT para DynamoDB

1. Acesse **AWS IoT Core** > **Message routing** > **Rules**
2. Clique em **Create rule**
3. Nome: `DSIM_SensorToDynamoDB`
4. SQL statement:
```sql
SELECT * FROM 'dsim/sensores/#'
```

5. Action: **DynamoDB**
   - Table name: `DSIM_SensorData`
   - Partition key: `deviceId` | Value: `${deviceId}`
   - Sort key: `timestamp` | Value: `${timestamp()}`
   - Write message data to this column: (deixe em branco para escrever todos os campos)

6. IAM role: Criar nova role com permissões DynamoDB

---

## 3. Configurar Lambda

### 3.1 Criar Função Lambda

```bash
cd backend/lambda

# Instalar dependências
npm install

# Compilar
npm run build

# Criar pacote
zip -r function.zip dist node_modules
```

### 3.2 Criar Role IAM para Lambda

Crie arquivo `lambda-role-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:DescribeStream",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:ListStreams"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/DSIM_*",
        "arn:aws:dynamodb:us-east-1:*:table/DSIM_*/index/*",
        "arn:aws:dynamodb:us-east-1:*:table/DSIM_*/stream/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "execute-api:ManageConnections",
        "execute-api:Invoke"
      ],
      "Resource": "arn:aws:execute-api:us-east-1:*:*/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### 3.3 Deploy da Lambda via Console

1. Acesse **AWS Lambda** > **Create function**
2. Nome: `DSIM-ProcessSensorData`
3. Runtime: Node.js 18.x
4. Architecture: x86_64
5. Permissions: Use existing role (a criada acima)
6. Clique em **Create function**
7. Upload: `function.zip`
8. Handler: `dist/index.handler`
9. Timeout: 30 segundos
10. Memory: 256 MB

### 3.4 Adicionar Trigger DynamoDB Stream

1. Na função Lambda criada, clique em **Add trigger**
2. Source: **DynamoDB**
3. Table: `DSIM_SensorData`
4. Batch size: 10
5. Starting position: Latest
6. Enable trigger: Sim

### 3.5 Configurar Variáveis de Ambiente

Na Lambda, adicione:
- `AWS_REGION`: us-east-1
- `DYNAMODB_SENSOR_DATA_TABLE`: DSIM_SensorData
- `DYNAMODB_PATIENTS_TABLE`: DSIM_Patients
- `DYNAMODB_ALARMS_TABLE`: DSIM_Alarms
- `DYNAMODB_CONNECTIONS_TABLE`: DSIM_Connections
- `WEBSOCKET_API_ENDPOINT`: (será configurado após criar API Gateway)

---

## 4. Configurar API Gateway

### 4.1 Criar API REST

1. Acesse **API Gateway** > **Create API**
2. Escolha **REST API**
3. Protocol: REST
4. Nome: `DSIM-API`
5. Endpoint Type: Regional

### 4.2 Criar Recursos e Métodos

Estrutura de rotas:
```
/api
  /auth
    POST /login
    POST /register
  /pacientes
    GET /
    POST /
    GET /{id}
    PUT /{id}
    DELETE /{id}
    POST /{id}/device
  /alarms
    GET /{pacienteId}
    POST /{pacienteId}
  /historico
    GET /{pacienteId}
    GET /{pacienteId}/latest
```

**NOTA**: Para conta de estudante, é mais simples usar **HTTP API Proxy** para o backend EC2.

### 4.3 Configurar HTTP API Proxy

1. Crie recurso: `{proxy+}`
2. Método: **ANY**
3. Integration type: **HTTP Proxy**
4. Endpoint URL: `http://SEU-EC2-IP:9999/{proxy}`
5. Deploy API: stage `production`

Anote o **Invoke URL**: `https://xxxxx.execute-api.us-east-1.amazonaws.com/production`

### 4.4 Criar WebSocket API

1. **API Gateway** > **Create API** > **WebSocket API**
2. Nome: `DSIM-WebSocket`
3. Route selection expression: `$request.body.action`
4. Adicionar rotas:
   - `$connect`
   - `$disconnect`
   - `$default`

5. Para cada rota, criar integração Lambda com função que gerencia WebSocket (opcional, ou usar backend EC2)

---

## 5. Configurar EC2 (Backend)

### 5.1 Lançar Instância EC2

1. **EC2** > **Launch Instance**
2. Nome: `DSIM-Backend`
3. AMI: **Ubuntu Server 22.04 LTS**
4. Instance type: **t2.micro** (free tier)
5. Key pair: Use `dsim_keypair.pem` que você já tem
6. Security Group:
   - SSH (22): Seu IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0
   - Custom TCP (9999): 0.0.0.0/0
   - Custom TCP (8080): 0.0.0.0/0 (WebSocket)

7. Launch instance

### 5.2 Conectar ao EC2

```bash
chmod 400 CERTIFICADOS/dsim_keypair.pem
ssh -i CERTIFICADOS/dsim_keypair.pem ubuntu@SEU-EC2-IP
```

### 5.3 Instalar Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Nginx
sudo apt install -y nginx

# Instalar Git
sudo apt install -y git

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2
```

### 5.4 Clonar e Configurar Backend

```bash
# Criar diretório
mkdir -p /home/ubuntu/dsim
cd /home/ubuntu/dsim

# Clonar repositório (ou fazer upload via SCP)
# Por enquanto, vamos criar os arquivos manualmente

# Upload via SCP da sua máquina local:
```

Na sua máquina local:
```bash
cd "c:\Users\flavi\OneDrive\Área de Trabalho\DSIM\Desenvolvimento\3.Implementação\DSIM-COD\backend"

# Compactar backend
tar -czf backend.tar.gz src package.json tsconfig.json

# Enviar para EC2
scp -i ..\CERTIFICADOS\dsim_keypair.pem backend.tar.gz ubuntu@SEU-EC2-IP:/home/ubuntu/dsim/
```

No EC2:
```bash
cd /home/ubuntu/dsim
tar -xzf backend.tar.gz

# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Criar arquivo .env
nano .env
```

Conteúdo do `.env`:
```bash
PORT=9999
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_super_secreto_aqui
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
DYNAMODB_USERS_TABLE=DSIM_Users
DYNAMODB_PATIENTS_TABLE=DSIM_Patients
DYNAMODB_SENSOR_DATA_TABLE=DSIM_SensorData
DYNAMODB_ALARMS_TABLE=DSIM_Alarms
WS_PORT=8080
```

### 5.5 Iniciar com PM2

```bash
# Iniciar servidor
pm2 start dist/server.js --name dsim-api

# Iniciar WebSocket
pm2 start dist/websocket.js --name dsim-websocket

# Salvar configuração
pm2 save

# Configurar inicialização automática
pm2 startup
```

### 5.6 Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/dsim
```

Conteúdo:
```nginx
server {
    listen 80;
    server_name SEU-EC2-IP-OU-DOMINIO;

    # API REST
    location /api {
        proxy_pass http://localhost:9999;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:9999/health;
    }
}
```

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/dsim /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. Configurar Amplify (Frontend)

### 6.1 Preparar Frontend

No seu computador:

```bash
cd "c:\Users\flavi\OneDrive\Área de Trabalho\DSIM\Desenvolvimento\3.Implementação\DSIM-COD\frontend"

# Criar arquivo .env.production
```

Conteúdo do `.env.production`:
```
VITE_API_URL=https://SEU-API-GATEWAY-URL/production
```

Ou, se usar direto o EC2:
```
VITE_API_URL=http://SEU-EC2-IP/api
```

### 6.2 Fazer Commit no GitHub

```bash
git add .
git commit -m "Configuração de produção"
git push origin main
```

### 6.3 Configurar Amplify Hosting

1. Acesse **AWS Amplify** > **All apps** > **New app** > **Host web app**
2. Source: **GitHub**
3. Autorize o GitHub e selecione o repositório `DSIM`
4. Branch: `main`
5. App name: `DSIM-Frontend`
6. Build settings:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd Desenvolvimento/3.Implementação/DSIM-COD/frontend
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: Desenvolvimento/3.Implementação/DSIM-COD/frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

7. Environment variables:
   - `VITE_API_URL`: URL do seu backend

8. **Save and deploy**

Amplify vai fazer o build e deploy automaticamente. Anote a URL gerada.

---

## 7. Testar o Sistema

### 7.1 Testar Backend

```bash
# Health check
curl http://SEU-EC2-IP/health

# Registrar usuário
curl -X POST http://SEU-EC2-IP/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin","email":"admin@dsim.com","senha":"senha123"}'

# Login
curl -X POST http://SEU-EC2-IP/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dsim.com","senha":"senha123"}'
```

### 7.2 Testar IoT

Atualize o código do ESP8266 com:
- Endpoint do AWS IoT Core
- Caminhos dos certificados
- Tópico MQTT: `dsim/sensores/ESP8266_001`

Formato da mensagem:
```json
{
  "deviceId": "ESP8266_001",
  "batimentos": 85,
  "oxigenio": 97,
  "temperatura": 36.5
}
```

### 7.3 Acessar Frontend

Abra a URL do Amplify no navegador e teste todas as funcionalidades:
1. Login/Cadastro
2. Adicionar Paciente
3. Vincular dispositivo ao paciente
4. Ver dados em tempo real
5. Configurar alarmes

---

## 8. Monitoramento e Logs

### 8.1 CloudWatch Logs

- Lambda: `/aws/lambda/DSIM-ProcessSensorData`
- IoT: AWS IoT > Logs

### 8.2 DynamoDB

Visualize dados nas tabelas via Console AWS.

### 8.3 EC2 Logs

```bash
# Logs do PM2
pm2 logs

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### Problema: Lambda não está sendo acionada
- Verifique se o Stream está habilitado em `DSIM_SensorData`
- Verifique se o trigger está configurado corretamente
- Veja os logs no CloudWatch

### Problema: Frontend não conecta ao backend
- Verifique CORS no backend
- Confirme a URL da API no `.env.production`
- Verifique Security Group do EC2

### Problema: Dispositivo não conecta ao IoT Core
- Verifique certificados
- Confirme endpoint do IoT Core
- Veja logs no IoT Core

---

## Custos Estimados (Conta de Estudante)

Com AWS Academy Learner Lab, você tem créditos limitados. Use:
- DynamoDB: On-Demand (baixo custo para testes)
- EC2: t2.micro (free tier)
- Lambda: Free tier (1M requests/mês)
- API Gateway: Free tier (1M calls/mês)
- Amplify: Free tier (até 5GB)

**Total estimado**: Dentro do free tier para desenvolvimento/testes.

---

## Próximos Passos

1. Configurar HTTPS com Let's Encrypt no Nginx
2. Implementar autenticação OAuth2
3. Adicionar mais regras de alarme personalizadas
4. Criar dashboard de monitoramento em tempo real
5. Implementar notificações via SNS/Email

---

**Boa sorte com a implantação! 🚀**
