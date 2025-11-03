# Backend - DSIM

Sistema de monitoramento DSIM desenvolvido com **Spring Boot** para integração com DynamoDB e AWS IoT.

## 🏗️ Arquitetura

- **Framework**: Spring Boot 3.2.0
- **Linguagem**: Java 17
- **Banco de dados**: AWS DynamoDB
- **Comunicação**: APIs REST + WebSocket
- **Cloud**: AWS (DynamoDB, IoT Core)

## 📋 Estrutura do Projeto

```
backend/
├── src/main/java/com/example/dsim/
│   ├── DsimApplication.java           # Classe principal
│   ├── config/
│   │   ├── AwsConfig.java            # Configuração AWS DynamoDB
│   │   ├── WebConfig.java            # Configuração CORS
│   │   └── WebSocketConfig.java      # Configuração WebSocket
│   ├── controller/
│   │   ├── MewsController.java       # Endpoint para avaliação MEWS
│   │   └── PacienteController.java   # CRUD de pacientes
│   ├── model/
│   │   ├── DadosPulseira.java        # Modelo dados da pulseira
│   │   ├── Paciente.java             # Modelo paciente
│   │   ├── Usuario.java              # Modelo usuário
│   │   └── Alarme.java               # Modelo alarme
│   ├── repository/
│   │   ├── DadosPulseiraRepository.java  # Repository dados pulseira
│   │   └── PacienteRepository.java       # Repository pacientes
│   └── service/
│       └── MewsAlertService.java     # Lógica de cálculo MEWS
├── src/main/resources/
│   └── application.properties        # Configurações da aplicação
├── pom.xml                          # Dependências Maven
└── README.md
```

## 🗃️ Tabelas DynamoDB

| Tabela | Chave Primária | Função |
|--------|---------------|---------|
| `DadosPulseira` | deviceID (PK) + timestamp (SK) | Armazena dados dos sensores |
| `Pacientes` | pacienteId (PK) | Informações do paciente + limites MEWS |
| `Usuarios` | userId (PK) | Usuários do sistema (Cognito) |
| `Alarmes` | alarmeId (PK) | Alarmes gerados pelo sistema MEWS |

## 🚀 Como executar

### 🐳 **Opção 1: Docker (Recomendado)**

```bash
# Inicia DynamoDB local + Backend
docker-compose up --build

# Configure tabelas (em outro terminal)
setup-dynamodb.bat  # Windows
# ou
./setup-dynamodb.sh # Linux/Mac
```

**Serviços disponíveis:**
- Backend: http://localhost:8080
- DynamoDB Local: http://localhost:8000  
- WebSocket: ws://localhost:8080/ws

📖 **Veja `DOCKER_SETUP.md` para instruções detalhadas**

### ⚙️ **Opção 2: Desenvolvimento local**

#### 1. Configurar variáveis de ambiente:
```bash
# Windows
set AWS_ACCESS_KEY_ID=sua_access_key
set AWS_SECRET_ACCESS_KEY=sua_secret_key
set AWS_REGION=us-east-1

# Linux/Mac
export AWS_ACCESS_KEY_ID=sua_access_key
export AWS_SECRET_ACCESS_KEY=sua_secret_key
export AWS_REGION=us-east-1
```

#### 2. Executar a aplicação:
```bash
# Via Maven
./mvnw spring-boot:run

# Via script automático (Windows)
start.bat

# Via Java (após build)
java -jar target/dsim-backend-0.0.1-SNAPSHOT.jar
```

## 📡 Endpoints da API

### MEWS Controller
```bash
POST /api/v1/mews/avaliar
Content-Type: application/json

{
  "deviceID": "device123",
  "timestamp": 1640995200000,
  "heartRate": 85,
  "temperature": 37.2,
  "oximetry": 98,
  "bloodPressureSystolic": 120,
  "bloodPressureDiastolic": 80
}
```

### Paciente Controller
```bash
GET /api/v1/pacientes/device/{deviceId}
```

## ⚡ WebSocket

O sistema envia alertas em tempo real via WebSocket:

```javascript
// Frontend conecta ao WebSocket
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

// Subscreve aos alertas de um paciente
stompClient.subscribe('/topic/alarms/paciente123', (message) => {
    console.log('Alerta recebido:', message.body);
});
```

## 🧮 Lógica MEWS

O serviço `MewsAlertService` implementa:

1. **Recebe dados** da pulseira via endpoint REST
2. **Busca paciente** associado ao deviceID
3. **Calcula score MEWS** baseado nos limites personalizados
4. **Gera alarme** se score >= threshold
5. **Envia notificação** via WebSocket

### Cálculo de Score:
- **Frequência cardíaca fora dos limites**: +2 pontos
- **Temperatura acima do limite**: +2 pontos
- **Score >= threshold** → Gera alarme
- **Valores padrão**: hr_min=50, hr_max=110, temp_max=38.5°C, threshold=4
- **Tratamento de nulls**: Valores nulos são ignorados no cálculo

### Payload WebSocket:
```json
{
  "type": "MEWS_ALERT",
  "patientId": "paciente123", 
  "score": 4,
  "message": "Alerta MEWS para João Silva",
  "timestamp": 1640995200000
}
```

## 🔧 Configurações

### application.properties
```properties
# Porta do servidor
server.port=8080

# CORS para frontend React
cors.allowed-origins=http://localhost:3000
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*

# WebSocket
websocket.allowed-origins=http://localhost:3000
```

## 🧪 Teste da API

### Teste manual com curl:
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

### Teste com dados incompletos (tratamento de nulls):
```bash
curl -X POST http://localhost:8080/api/v1/mews/avaliar \
  -H "Content-Type: application/json" \
  -d '{
    "deviceID": "device123",
    "timestamp": 1640995200000,
    "heartRate": 120,
    "temperature": null,
    "oximetry": null
  }'
```

## 📦 Dependências Principais

- **Spring Boot Web**: APIs REST
- **Spring Boot WebSocket**: Comunicação em tempo real
- **AWS SDK DynamoDB**: Integração com DynamoDB
- **Lombok**: Reduz boilerplate de código

## 🔗 Integração com Frontend

O backend está preparado para integrar com o frontend React na pasta `../frontend/`:

1. **CORS configurado** para `localhost:3000`
2. **APIs REST** para operações CRUD
3. **WebSocket** para notificações em tempo real
4. **JSON** como formato de dados

## 🚀 Próximos passos

1. **Configurar tabelas** no DynamoDB
2. **Integrar com AWS IoT** Core para dados automáticos
3. **Implementar autenticação** com Cognito
4. **Adicionar logs** e monitoramento
5. **Testes automatizados**