# 🐳 Docker Setup - DSIM Backend

Configuração completa para executar o backend DSIM com DynamoDB local usando Docker.

## 📋 Pré-requisitos

- ✅ **Docker** e **Docker Compose** instalados
- ✅ **AWS CLI** instalado (para configurar tabelas)
- ✅ **Java 17** (para desenvolvimento local)

## 🚀 Como executar

### 1. **Inicie os serviços com Docker Compose**
```bash
# Na pasta backend/
docker-compose up --build
```

Isso irá:
- 🗄️ Iniciar **DynamoDB Local** na porta `8000`
- ☕ Construir e iniciar o **Backend Spring Boot** na porta `8080`
- 🔗 Configurar rede entre os serviços

### 2. **Configure as tabelas DynamoDB (em outro terminal)**
```bash
# Windows
setup-dynamodb.bat

# Linux/Mac
chmod +x setup-dynamodb.sh
./setup-dynamodb.sh
```

### 3. **Verifique se está funcionando**
```bash
# Teste básico da API
curl http://localhost:8080/api/v1/pacientes/device/device123

# Lista tabelas DynamoDB
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

## 🔧 Serviços disponíveis

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Backend API** | http://localhost:8080 | APIs REST do Spring Boot |
| **DynamoDB Local** | http://localhost:8000 | DynamoDB para desenvolvimento |
| **WebSocket** | ws://localhost:8080/ws | WebSocket para alertas em tempo real |

## 📡 Endpoints da API

### Teste do sistema MEWS
```bash
curl -X POST http://localhost:8080/api/v1/mews/avaliar \
  -H "Content-Type: application/json" \
  -d '{
    "deviceID": "device123",
    "timestamp": 1640995200000,
    "heartRate": 120,
    "temperature": 38.5,
    "oximetry": 95,
    "bloodPressureSystolic": 140,
    "bloodPressureDiastolic": 90
  }'
```

### Buscar paciente por device
```bash
curl http://localhost:8080/api/v1/pacientes/device/device123
```

## 🗃️ Dados de exemplo

O script `setup-dynamodb` cria automaticamente:

### Paciente de exemplo:
- **ID**: pac-001
- **Nome**: João Silva  
- **Device**: device123
- **Limites MEWS**: hr_min=60, hr_max=100, temp_max=37.5°C, threshold=4

### Dados da pulseira:
- **Device**: device123
- **Frequência**: 75 bpm
- **Temperatura**: 36.8°C
- **Oximetria**: 98%

## 🛠️ Comandos úteis

### Parar serviços
```bash
docker-compose down
```

### Rebuild apenas o backend
```bash
docker-compose up --build dsim-backend
```

### Ver logs
```bash
# Logs do backend
docker-compose logs dsim-backend

# Logs do DynamoDB
docker-compose logs dynamodb-local
```

### Resetar dados do DynamoDB
```bash
docker-compose down
docker volume rm backend_dynamodb_data
docker-compose up --build
```

## 🌐 Integração com Frontend

O backend está configurado para aceitar requisições do frontend React:

- **CORS habilitado** para `http://localhost:3000`
- **WebSocket** disponível em `ws://localhost:8080/ws`
- **Payload JSON** estruturado para alertas

### Exemplo de conexão WebSocket (JavaScript):
```javascript
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function() {
    stompClient.subscribe('/topic/alarms/pac-001', function(message) {
        const alert = JSON.parse(message.body);
        console.log('Alerta recebido:', alert);
    });
});
```

## 🐛 Solução de problemas

### Backend não inicia
- Verifique se a porta 8080 está livre
- Verifique logs: `docker-compose logs dsim-backend`

### DynamoDB não responde
- Verifique se a porta 8000 está livre
- Reinicie: `docker-compose restart dynamodb-local`

### Erro de conexão entre serviços
- Verifique a rede Docker: `docker network ls`
- Recrie: `docker-compose down && docker-compose up`

### Tabelas não foram criadas
- Execute novamente: `setup-dynamodb.bat` ou `setup-dynamodb.sh`
- Verifique se AWS CLI está configurado

## 📊 Monitoramento

### Verificar saúde do backend
```bash
curl http://localhost:8080/actuator/health
```

### Verificar tabelas DynamoDB
```bash
aws dynamodb scan --table-name Pacientes --endpoint-url http://localhost:8000
```

### Logs em tempo real
```bash
docker-compose logs -f dsim-backend
```

## 🔄 Desenvolvimento

Para desenvolvimento local sem Docker:

1. **Inicie apenas o DynamoDB**:
   ```bash
   docker-compose up dynamodb-local
   ```

2. **Configure variáveis de ambiente**:
   ```bash
   export AWS_ACCESS_KEY_ID=local
   export AWS_SECRET_ACCESS_KEY=local
   export AWS_REGION=us-east-1
   export DYNAMODB_ENDPOINT=http://localhost:8000
   ```

3. **Execute o backend localmente**:
   ```bash
   ./mvnw spring-boot:run
   ```

Agora você tem um ambiente completo de desenvolvimento com DynamoDB local e backend containerizado! 🎉