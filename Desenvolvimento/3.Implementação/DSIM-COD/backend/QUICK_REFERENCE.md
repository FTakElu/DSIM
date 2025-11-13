# 🚀 Guia Rápido de Comandos - DSIM

Referência rápida de comandos para desenvolvimento e deploy.

## 📦 Setup Inicial

### Backend Local
```bash
cd backend
npm install
cp .env.example .env
# Editar .env com suas credenciais
npm run build
npm run dev
```

### Lambda
```bash
cd backend/lambda
npm install
npm run build
zip -r function.zip dist node_modules
```

## ☁️ AWS CLI

### Configurar Credenciais
```bash
aws configure
# Inserir: Access Key, Secret Key, Region (us-east-1), Output (json)
```

### DynamoDB - Criar Tabelas
```bash
cd backend
chmod +x scripts/setup-dynamodb.sh
./scripts/setup-dynamodb.sh
```

### DynamoDB - Listar Tabelas
```bash
aws dynamodb list-tables --region us-east-1
```

### DynamoDB - Ver Dados
```bash
# SensorData
aws dynamodb scan --table-name DSIM_SensorData --limit 10

# Pacientes
aws dynamodb scan --table-name DSIM_Patients

# Usuários
aws dynamodb scan --table-name DSIM_Users
```

### DynamoDB - Deletar Tabela
```bash
aws dynamodb delete-table --table-name NOME_DA_TABELA
```

### IoT Core - Criar Política
```bash
aws iot create-policy \
  --policy-name DSIM-IoT-Policy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["iot:*"],
      "Resource": "*"
    }]
  }'
```

### IoT Core - Anexar Política
```bash
aws iot attach-policy \
  --policy-name DSIM-IoT-Policy \
  --target "arn:aws:iot:us-east-1:ACCOUNT_ID:cert/CERT_ID"
```

### IoT Core - Obter Endpoint
```bash
aws iot describe-endpoint --endpoint-type iot:Data-ATS
```

### Lambda - Criar Função
```bash
aws lambda create-function \
  --function-name DSIM-ProcessSensorData \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME \
  --handler dist/index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 256
```

### Lambda - Atualizar Código
```bash
cd backend/lambda
npm run build
zip -r function.zip dist node_modules

aws lambda update-function-code \
  --function-name DSIM-ProcessSensorData \
  --zip-file fileb://function.zip
```

### Lambda - Ver Logs
```bash
aws logs tail /aws/lambda/DSIM-ProcessSensorData --follow
```

## 🖥️ EC2

### Conectar via SSH
```bash
chmod 400 CERTIFICADOS/dsim_keypair.pem
ssh -i CERTIFICADOS/dsim_keypair.pem ubuntu@SEU-EC2-IP
```

### Setup Inicial no EC2
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2
sudo npm install -g pm2

# Instalar Git
sudo apt install -y git
```

### Upload de Arquivos para EC2
```bash
# Da sua máquina local para EC2
scp -i CERTIFICADOS/dsim_keypair.pem -r backend ubuntu@SEU-EC2-IP:/home/ubuntu/
```

### Gerenciar Aplicação com PM2
```bash
# Iniciar
pm2 start dist/server.js --name dsim-api
pm2 start dist/websocket.js --name dsim-websocket

# Listar processos
pm2 list

# Ver logs
pm2 logs dsim-api
pm2 logs dsim-websocket

# Logs em tempo real
pm2 logs dsim-api --lines 100

# Reiniciar
pm2 restart dsim-api

# Parar
pm2 stop dsim-api

# Deletar
pm2 delete dsim-api

# Salvar configuração
pm2 save

# Iniciar na boot
pm2 startup
# Executar o comando que aparecer
```

### Nginx
```bash
# Testar configuração
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx

# Ver status
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Editar configuração
sudo nano /etc/nginx/sites-available/dsim
```

### Monitorar Sistema
```bash
# Uso de CPU/RAM
htop

# Espaço em disco
df -h

# Processos Node
ps aux | grep node

# Portas em uso
sudo netstat -tulpn | grep LISTEN
```

## 📱 ESP8266

### Arduino CLI (Opcional)
```bash
# Compilar
arduino-cli compile --fqbn esp8266:esp8266:nodemcuv2 ESP8266.ino

# Upload
arduino-cli upload -p COM3 --fqbn esp8266:esp8266:nodemcuv2 ESP8266.ino

# Monitor Serial
arduino-cli monitor -p COM3 -c baudrate=115200
```

### Bibliotecas Necessárias
```bash
# Via Arduino IDE
# Tools > Manage Libraries

# ESP8266WiFi (incluído no board package)
# PubSubClient by Nick O'Leary
# ArduinoJson by Benoit Blanchon
```

## 🔍 Testes e Debug

### Testar APIs Localmente
```bash
# Health check
curl http://localhost:9999/health

# Registrar usuário
curl -X POST http://localhost:9999/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin","email":"admin@dsim.com","senha":"senha123"}'

# Login
curl -X POST http://localhost:9999/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dsim.com","senha":"senha123"}'

# Listar pacientes (com token)
curl http://localhost:9999/api/pacientes \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### Testar APIs na AWS
```bash
# Substituir localhost por IP do EC2 ou URL do API Gateway
curl http://SEU-EC2-IP/health
curl https://API-GATEWAY-URL/production/api/pacientes
```

### Testar WebSocket
```bash
# Instalar wscat
npm install -g wscat

# Conectar
wscat -c ws://localhost:8080

# Ou na AWS
wscat -c ws://SEU-EC2-IP:8080
```

### Debug DynamoDB
```bash
# Contar registros
aws dynamodb describe-table --table-name DSIM_SensorData \
  --query 'Table.ItemCount'

# Buscar por deviceId
aws dynamodb query \
  --table-name DSIM_SensorData \
  --key-condition-expression "deviceId = :id" \
  --expression-attribute-values '{":id":{"S":"ESP8266_001"}}'
```

## 🧹 Limpeza e Manutenção

### Limpar Logs do PM2
```bash
pm2 flush
```

### Limpar Cache do NPM
```bash
npm cache clean --force
```

### Limpar Build
```bash
rm -rf dist node_modules
npm install
npm run build
```

### Deletar Tabelas DynamoDB (CUIDADO!)
```bash
aws dynamodb delete-table --table-name DSIM_SensorData
aws dynamodb delete-table --table-name DSIM_Patients
aws dynamodb delete-table --table-name DSIM_Users
aws dynamodb delete-table --table-name DSIM_Alarms
aws dynamodb delete-table --table-name DSIM_Connections
```

## 📊 Monitoramento AWS

### CloudWatch Logs - Lambda
```bash
# Últimos logs
aws logs tail /aws/lambda/DSIM-ProcessSensorData --since 10m

# Seguir logs em tempo real
aws logs tail /aws/lambda/DSIM-ProcessSensorData --follow
```

### CloudWatch Metrics
```bash
# Invocações da Lambda
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=DSIM-ProcessSensorData \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### DynamoDB Streams
```bash
# Listar streams
aws dynamodb describe-table --table-name DSIM_SensorData \
  --query 'Table.LatestStreamArn'
```

## 🔐 Segurança

### Rotacionar Credenciais AWS
```bash
# Criar nova access key
aws iam create-access-key --user-name SEU_USUARIO

# Deletar antiga (após atualizar .env)
aws iam delete-access-key --access-key-id ANTIGA_KEY --user-name SEU_USUARIO
```

### Alterar JWT Secret
```bash
# No .env
JWT_SECRET=$(openssl rand -base64 32)
```

### Backup de Certificados
```bash
# Fazer backup da pasta CERTIFICADOS
tar -czf certificados_backup.tar.gz CERTIFICADOS/
```

## 🚀 Deploy Rápido

### Backend para EC2
```bash
# 1. Fazer upload
scp -i CERTIFICADOS/dsim_keypair.pem -r backend ubuntu@EC2-IP:/home/ubuntu/

# 2. No EC2
ssh -i CERTIFICADOS/dsim_keypair.pem ubuntu@EC2-IP
cd /home/ubuntu/backend
npm install
npm run build
pm2 restart all
```

### Lambda
```bash
cd backend/lambda
npm run build
zip -r function.zip dist node_modules
aws lambda update-function-code \
  --function-name DSIM-ProcessSensorData \
  --zip-file fileb://function.zip
```

### Frontend (Amplify faz automaticamente via Git)
```bash
cd frontend
git add .
git commit -m "Deploy production"
git push origin main
# Amplify detecta e faz deploy automático
```

## 📚 Atalhos Úteis

### Ver Estrutura do Projeto
```bash
tree -L 3 -I 'node_modules|dist'
```

### Buscar por Texto
```bash
# Buscar em todos os arquivos TypeScript
grep -r "searchTerm" --include="*.ts"
```

### Contar Linhas de Código
```bash
find . -name "*.ts" -not -path "*/node_modules/*" | xargs wc -l
```

## 🆘 Comandos de Emergência

### Reiniciar Tudo (EC2)
```bash
pm2 restart all
sudo systemctl restart nginx
```

### Parar Tudo
```bash
pm2 stop all
sudo systemctl stop nginx
```

### Ver Status de Tudo
```bash
pm2 status
sudo systemctl status nginx
aws dynamodb list-tables
```

### Logs Completos (Debug)
```bash
# Backend
pm2 logs --lines 1000

# Nginx
sudo tail -n 100 /var/log/nginx/error.log

# Lambda
aws logs tail /aws/lambda/DSIM-ProcessSensorData --since 1h
```

---

## 🔗 Links Rápidos

- **AWS Console**: https://console.aws.amazon.com
- **DynamoDB**: https://console.aws.amazon.com/dynamodb
- **IoT Core**: https://console.aws.amazon.com/iot
- **Lambda**: https://console.aws.amazon.com/lambda
- **EC2**: https://console.aws.amazon.com/ec2
- **CloudWatch**: https://console.aws.amazon.com/cloudwatch
- **Amplify**: https://console.aws.amazon.com/amplify

---

**Salve este arquivo para referência rápida!** 📌
