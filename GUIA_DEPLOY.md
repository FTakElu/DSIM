# 📋 Infraestrutura DSIM Implantada na AWS

## Recursos AWS Criados e Configurados

### Resumo da Infraestrutura

O sistema DSIM foi implantado na AWS com os seguintes componentes em produção:

| Recurso | ID/Nome | Status | Descrição |
|---------|---------|--------|-----------|
| **EC2** | `i-0019770d6275005b2` | ✅ Rodando | Instância t2.micro com backend Node.js |
| **Elastic IP** | `98.95.251.71` | ✅ Associado | IP fixo permanente da EC2 |
| **API Gateway** | `87xx2k2vn5` | ✅ Ativo | HTTP API com proxy para EC2 |
| **API URL** | `https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com` | ✅ Acessível | Endpoint público |
| **Security Group** | `sg-0f38c9d3a91bd3473` | ✅ Configurado | Portas: 22, 80, 443, 9999 |
| **DynamoDB** | 5 tabelas | ✅ Operacionais | Users, Patients, SensorData, Alarms, Connections |
| **Region** | `us-east-1` | - | Virgínia do Norte |
| **PM2** | `dsim-backend` | ✅ Ativo | Process manager rodando backend |

---

## O Que Foi Feito na Implantação

### 1. Banco de Dados - DynamoDB (5 Tabelas)

Todas as tabelas criadas com **billing mode: On-Demand** (paga apenas pelo uso).

**Tabela: DSIM_Users**
- **Função**: Armazenar usuários do sistema (médicos, enfermeiros)
- **Chave primária**: `userId` (String)
- **Atributos**: username, password (hash), role (admin/medico/enfermeiro), createdAt

**Tabela: DSIM_Patients**
- **Função**: Dados cadastrais e sinais vitais dos pacientes
- **Chave primária**: `patientId` (String)
- **Atributos**: nome, idade, sexo, dispositivo vinculado, sinais vitais atuais, score MEWS
- **GSI (Global Secondary Index)**: `deviceId-index` para buscar paciente por pulseira

**Tabela: DSIM_SensorData**
- **Função**: Histórico de leituras das pulseiras IoT
- **Chave primária**: `deviceId` (Partition Key) + `timestamp` (Sort Key)
- **Atributos**: batimentos, oxigenio, temperatura, panico_ativo
- **DynamoDB Stream**: Habilitado (trigger para Lambda)

**Tabela: DSIM_Alarms**
- **Função**: Configurações personalizadas de alarmes por paciente
- **Chave primária**: `pacienteId` (String)
- **Atributos**: limites customizados (BPM min/max, SpO2 min, temperatura min/max)

**Tabela: DSIM_Connections**
- **Função**: Gerenciar conexões WebSocket ativas
- **Chave primária**: `connectionId` (String)
- **TTL**: Configurado para expirar conexões antigas automaticamente

---

### 2. Servidor Backend - EC2 + PM2

**Configuração da Instância:**
- **Tipo**: t2.micro (1 vCPU, 1 GB RAM) - Free Tier elegível
- **AMI**: Amazon Linux 2023
- **Key Pair**: `dsim_keypair.pem` (acesso SSH)
- **Elastic IP**: `98.95.251.71` (fixo, não muda após reiniciar)
- **Security Group**: Permite tráfego nas portas 22, 80, 443, 9999

**Software Instalado:**
- Node.js 18.x LTS
- Git (para clonar repositório)
- PM2 (Process Manager para manter backend rodando 24/7)

**Backend Configurado:**
- **Porta**: 9999
- **Endpoint health check**: `http://98.95.251.71:9999/health`
- **Repositório clonado**: GitHub `FTakElu/DSIM`
- **Diretório**: `/home/ec2-user/DSIM/Desenvolvimento/3.Implementação/DSIM-COD/backend`
- **PM2 configurado**: Auto-restart em caso de crash, logs centralizados

**Variáveis de Ambiente (.env):**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=ASIAYHO...
AWS_SECRET_ACCESS_KEY=EHn3kmr...
AWS_SESSION_TOKEN=IQoJb3JpZ...
PORT=9999
JWT_SECRET=[gerado]
```

**Gerenciamento com PM2:**
```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs dsim-backend

# Reiniciar
pm2 restart dsim-backend

# Ver métricas (CPU/RAM)
pm2 monit
```

---

### 3. API Gateway - Proxy HTTP

**Configuração:**
- **Tipo**: HTTP API (mais simples e barato que REST API)
- **ID**: `87xx2k2vn5`
- **URL Base**: `https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com`
- **Stage**: `$default` (auto-deploy habilitado)

**Integração:**
- **Target**: `http://98.95.251.71:9999/{proxy}`
- **Método**: `ANY` (aceita GET, POST, PUT, DELETE, OPTIONS)
- **Path**: `/{proxy+}` (qualquer rota é redirecionada ao backend)

**CORS Configurado:**
- **Allow Origins**: `*` (ou específico para domínio Amplify)
- **Allow Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allow Headers**: Content-Type, Authorization

**Exemplo de uso:**
```bash
# Via API Gateway (recomendado para frontend)
curl https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com/health

# Direto na EC2 (apenas para testes internos)
curl http://98.95.251.71:9999/health
```

---

### 4. AWS Lambda - Processador MEWS

**Função:** `DSIM-MEWS-Processor`
- **Runtime**: Node.js 18.x
- **Trigger**: DynamoDB Stream da tabela `DSIM_SensorData`
- **Timeout**: 30 segundos
- **Memória**: 256 MB

**O que a Lambda faz automaticamente:**
1. Detecta nova entrada na tabela `DSIM_SensorData` (via Stream)
2. Calcula score MEWS com base nos sinais vitais
3. Verifica se existem alarmes configurados para o paciente
4. Atualiza tabela `DSIM_Patients` com novo score
5. Envia notificação WebSocket se alarme disparado

**Código TypeScript compilado e implantado:**
- Arquivo: `backend/lambda/src/index.ts`
- Dependências: aws-sdk, lodash, moment
- Deployment package: `lambda-deployment.zip`

---

### 5. AWS IoT Core - Comunicação com Pulseira

**Thing criado:** `Pulseira_DSIM`
- **Endpoint**: `a2cs805qynf1nj-ats.iot.us-east-1.amazonaws.com`
- **Protocolo**: MQTT sobre TLS 1.2
- **Certificados**: Gerados e incluídos no firmware ESP8266

**Tópicos MQTT:**
- `pulseira/dados` - Pulseira publica leituras de sensores
- `pulseira/comandos` - Backend envia comandos (buzzer, reset, etc.)

**Regra IoT Core:** `DadosPulseiraToDynamoDB`
```sql
SELECT 
  topic(2) as deviceId,
  * as payload,
  timestamp() as timestamp
FROM 'pulseira/dados'
```
- **Ação**: Insere automaticamente no DynamoDB (tabela `DSIM_SensorData`)
- **Adiciona timestamp**: Garante ordenação temporal

---

### 6. Security Group - Firewall

**Nome**: `dsim-sg`  
**ID**: `sg-0f38c9d3a91bd3473`

**Regras de Entrada (Inbound):**

| Porta | Protocolo | Origem | Descrição |
|-------|-----------|--------|-----------|
| 22 | TCP | `0.0.0.0/0` | SSH para administração |
| 80 | TCP | `0.0.0.0/0` | HTTP (redirecionar para HTTPS) |
| 443 | TCP | `0.0.0.0/0` | HTTPS (futuro) |
| 9999 | TCP | `0.0.0.0/0` | Backend Node.js |

**Regras de Saída (Outbound):**
- Todas liberadas (acesso irrestrito à internet)

---

## 🔄 Gerenciamento de Credenciais AWS Academy

### O Desafio

Contas AWS Academy geram **credenciais temporárias** que expiram a cada 2-4 horas. Quando isso acontece:
- Backend perde acesso ao DynamoDB
- API retorna erros 500
- Sistema para de funcionar

### Solução Implementada

**Script automático:** `update_ec2_credentials.bat` (raiz do projeto)

**O que o script faz:**
1. Lê credenciais AWS do arquivo local: `C:\Users\[USER]\.aws\credentials`
2. Extrai: `aws_access_key_id`, `aws_secret_access_key`, `aws_session_token`
3. Conecta via SSH na EC2: `98.95.251.71`
4. Sobrescreve o arquivo `.env` do backend com novas credenciais
5. Executa `pm2 restart dsim-backend`
6. Verifica se backend reiniciou com sucesso

**Quando usar:**
- Toda vez que iniciar nova sessão AWS Academy (a cada 2-4 horas)
- Após ver erros de credenciais expiradas nos logs
- Antes de demonstrações importantes

**Como usar:**
```cmd
# 1. Atualizar AWS CLI com novas credenciais da AWS Academy
aws configure

# 2. Executar script (leva ~10 segundos)
update_ec2_credentials.bat
```

---

## ✅ Checklist do Sistema em Produção

**Infraestrutura AWS:**
- [x] DynamoDB: 5 tabelas criadas e operacionais
- [x] EC2: Instância rodando com Elastic IP fixo
- [x] Security Group: Portas configuradas
- [x] API Gateway: Proxy HTTP configurado
- [x] Lambda: Função implantada com trigger DynamoDB Stream
- [x] IoT Core: Thing criado e regra configurada

**Backend (EC2):**
- [x] Node.js 18 instalado
- [x] Repositório clonado do GitHub
- [x] Dependências instaladas (npm install)
- [x] TypeScript compilado
- [x] PM2 configurado e rodando
- [x] Arquivo .env com credenciais AWS
- [x] Endpoint `/health` respondendo corretamente

**Frontend (Amplify):**
- [ ] App conectado ao GitHub (branch `main`)
- [ ] Build configurado (diretório `frontend/`)
- [ ] Variável `VITE_API_URL` configurada
- [ ] Deploy automático em cada push
- [ ] Interface acessível via URL Amplify

**IoT (Pulseira ESP8266):**
- [x] Firmware compilado com certificados AWS
- [x] WiFi configurado
- [x] Conecta ao AWS IoT Core
- [x] Publica dados no tópico `pulseira/dados`
- [ ] Testado enviando dados reais

---

## 📊 Arquitetura do Sistema

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Pulseira IoT   │────────▶│  AWS IoT Core   │────────▶│   DynamoDB      │
│    ESP8266      │  MQTT   │  (MQTT Broker)  │  Rule   │  SensorData     │
└─────────────────┘  TLS    └─────────────────┘         └────────┬────────┘
                                                                  │
                                                        DynamoDB Stream
                                                                  │
                                                                  ▼
                                                          ┌──────────────┐
                                                          │    Lambda    │
                                                          │   Processor  │
                                                          │ (MEWS calc)  │
                                                          └──────┬───────┘
                                                                 │
                                    ┌────────────────────────────┼────────────┐
                                    ▼                            ▼            ▼
                            ┌──────────────┐            ┌──────────────┐  WebSocket
                            │  DynamoDB    │            │  DynamoDB    │  Notifications
                            │   Patients   │            │    Alarms    │      │
                            └──────┬───────┘            └──────────────┘      │
                                   │                                          │
                                   └──────────────┬───────────────────────────┘
                                                  ▼
                                        ┌──────────────────┐
                                        │   Backend API    │
                                        │ Node.js/Express  │
                                        │   EC2 + PM2      │
                                        │  98.95.251.71    │
                                        └────────┬─────────┘
                                                 │
                                ┌────────────────┼────────────────┐
                                ▼                                 ▼
                      ┌──────────────────┐            ┌──────────────────┐
                      │   API Gateway    │            │    Frontend      │
                      │   HTTP Proxy     │◀───────────│  React + Vite    │
                      │   87xx2k2vn5     │   fetch    │  AWS Amplify     │
                      └──────────────────┘            └──────────────────┘
```

---

## 🆘 Comandos Úteis

### Acessar EC2 via SSH
```cmd
ssh -i "Desenvolvimento\3.Implementação\CERTIFICADOS\dsim_keypair.pem" ec2-user@98.95.251.71
```

### Verificar Status do Backend
```bash
pm2 status
pm2 logs dsim-backend --lines 50
pm2 monit
```

### Reiniciar Backend
```bash
pm2 restart dsim-backend
```

### Ver Logs em Tempo Real
```bash
pm2 logs dsim-backend
```

### Testar API
```cmd
# Via API Gateway
curl https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com/health

# Direto na EC2
curl http://98.95.251.71:9999/health
```

### Verificar Credenciais AWS na EC2
```bash
cat /home/ec2-user/DSIM/Desenvolvimento/3.Implementação/DSIM-COD/backend/.env | grep AWS
```

### Consultar DynamoDB
```cmd
aws dynamodb scan --table-name DSIM_Patients --region us-east-1 --max-items 5
aws dynamodb scan --table-name DSIM_SensorData --region us-east-1 --max-items 10
```

---

## 🔗 Links Rápidos

- **API Gateway**: https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com
- **EC2 Health Check**: http://98.95.251.71:9999/health
- **AWS Console EC2**: https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Instances:instanceId=i-0019770d6275005b2
- **AWS Console DynamoDB**: https://console.aws.amazon.com/dynamodb/home?region=us-east-1
- **AWS Console API Gateway**: https://console.aws.amazon.com/apigateway/main/apis?region=us-east-1
- **AWS Console IoT Core**: https://console.aws.amazon.com/iot/home?region=us-east-1

---

## 📚 Documentação Técnica Detalhada

Cada componente possui documentação técnica específica:

- **Backend API**: `Desenvolvimento/3.Implementação/DSIM-COD/backend/README.md`
- **Frontend Web**: `Desenvolvimento/3.Implementação/DSIM-COD/frontend/README.md`
- **Lambda Processor**: `Desenvolvimento/3.Implementação/DSIM-COD/backend/lambda/README.md`
- **Pulseira IoT**: `Desenvolvimento/3.Implementação/DSIM-INO/README.md`
- **README Principal**: `README.md` (raiz do projeto)

---

## 📊 Arquitetura Implantada

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Pulseira IoT   │────────▶│  AWS IoT Core   │────────▶│   DynamoDB      │
│    ESP8266      │  MQTT   │  (MQTT Broker)  │  Rule   │  SensorData     │
└─────────────────┘  TLS    └─────────────────┘         └────────┬────────┘
                                                                  │ Stream
                                    ┌─────────────────────────────┘
                                    ▼
                            ┌─────────────────┐
                            │     Lambda      │
                            │   Processor     │
                            │  (MEWS calc)    │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │  DynamoDB    │  │  DynamoDB    │  │  WebSocket   │
            │   Patients   │  │    Alarms    │  │   (PM2)      │
            └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                   │                 │                  │
                   └─────────┬───────┘                  │
                             ▼                          │
                   ┌─────────────────┐                 │
                   │  Backend API    │◀────────────────┘
                   │  Node.js/Express│
                   │ EC2 (PM2 daemon)│
                   │  98.95.251.71   │
                   └────────┬────────┘
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
         ┌─────────────────┐  ┌─────────────────┐
         │  API Gateway    │  │   Frontend      │
         │ HTTP Proxy      │  │  React + Vite   │
         │ 87xx2k2vn5      │  │  AWS Amplify    │
         └─────────────────┘  └─────────────────┘
```

---

## 🆘 Troubleshooting

### Backend não responde

```bash
# Conectar na EC2
ssh -i dsim_keypair.pem ec2-user@98.95.251.71

# Verificar status
pm2 status

# Ver logs
pm2 logs dsim-backend

# Reiniciar
pm2 restart dsim-backend
```

### Credenciais AWS expiradas

```cmd
# Sintoma: Backend retorna erros 500 ou timeout no DynamoDB

# Solução:
aws configure  # Novas credenciais
update_ec2_credentials.bat
```

### API Gateway retorna erro

```bash
# Verificar se backend está rodando
curl http://98.95.251.71:9999/health

# Verificar integração
aws apigatewayv2 get-integrations --api-id 87xx2k2vn5 --region us-east-1
```

### Frontend não carrega dados

1. Verificar URL do API Gateway no Amplify (variável `VITE_API_URL`)
2. Verificar CORS no backend
3. Abrir console do navegador (F12) para ver erros

---

## 📞 Suporte

Documentação adicional:
- **README Principal**: `README.md`
- **Backend**: `Desenvolvimento/3.Implementação/DSIM-COD/backend/README.md`
- **Frontend**: `Desenvolvimento/3.Implementação/DSIM-COD/frontend/README.md`
- **IoT**: `Desenvolvimento/3.Implementação/DSIM-INO/README.md`
- **Lambda**: `Desenvolvimento/3.Implementação/DSIM-COD/backend/lambda/README.md`

---

**✨ Deploy criado e documentado em 23/11/2025**
