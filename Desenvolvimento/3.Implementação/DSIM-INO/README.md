# Pulseira IoT - DSIM (Sistema de Monitoramento de Pacientes)

## 📋 Sobre

Código para ESP8266 que implementa uma pulseira inteligente para monitoramento de sinais vitais de pacientes, integrada com AWS IoT Core.

## 🔧 Hardware Necessário

- **ESP8266-01** ou similar
- **Sensores** (a serem integrados):
  - MAX30102: Batimentos cardíacos (BPM) e Saturação de Oxigênio (SpO2)
  - MLX90614 ou DS18B20: Temperatura corporal
- **Botão de Pânico** (GPIO0)
- **Buzzer** (GPIO2)
- **Fonte de alimentação 3.3V**

## 📦 Bibliotecas Necessárias

Instale via Arduino IDE (Gerenciar Bibliotecas):

```
- ESP8266WiFi (já incluso no ESP8266 Core)
- PubSubClient (by Nick O'Leary)
- ArduinoJson (by Benoit Blanchon) - versão 6.x
```

## ⚙️ Configuração

### 1. Configurar WiFi

Edite as linhas 8-9 do arquivo `PulseiraMonitoramentoPT1.ino`:

```cpp
const char WIFI_SSID[] = "SEU_WIFI";
const char WIFI_PASSWORD[] = "SUA_SENHA";
```

### 2. Certificados AWS IoT

Os certificados já estão configurados no código (linhas 41-103). Eles são específicos para a Thing `Pulseira_DSIM` e não precisam ser alterados.

**Certificados incluídos:**
- Amazon Root CA1 (autenticação do servidor AWS)
- Certificado do dispositivo (identidade da pulseira)
- Chave privada (criptografia segura)

### 3. Configurações AWS IoT Core

Já configurado para conectar em:
- **Thing Name**: `Pulseira_DSIM`
- **Endpoint**: `a2cs805qynf1nj-ats.iot.us-east-1.amazonaws.com`
- **Tópico de publicação**: `pulseira/dados`
- **Tópico de comandos**: `pulseira/comandos`

## 🚀 Como Funciona

### Fluxo de Dados

```
ESP8266 → WiFi → AWS IoT Core → Regra IoT → DynamoDB → Backend → Frontend
```

### Funcionalidades

#### 1. **Conexão Segura (TLS/SSL)**
- Conecta ao WiFi configurado
- Sincroniza relógio via NTP (necessário para TLS)
- Estabelece conexão segura com AWS IoT usando certificados X.509

#### 2. **Monitoramento Contínuo**
- **A cada 10 segundos**: Envia dados dos sensores automaticamente
- **Dados enviados**:
  ```json
  {
    "deviceId": "Pulseira_DSIM",
    "batimentos": 75,
    "oxigenio": 98,
    "temperatura": 36.5,
    "panico_ativo": false
  }
  ```

#### 3. **Botão de Pânico**
- **Botão GPIO0**: Ao pressionar, alterna o modo pânico (ON/OFF)
- **Debounce**: 50ms para evitar leituras duplicadas
- **Buzzer GPIO2**: Toca quando modo pânico está ativo
- **Alerta imediato**: Publica status de pânico instantaneamente ao AWS IoT

#### 4. **Reconexão Automática**
- Detecta perda de conexão WiFi ou MQTT
- Reconecta automaticamente

### Estrutura do Código

```
setup()
├── Inicializa Serial (115200 baud)
├── Configura pinos (botão e buzzer)
└── connectAWS()
    ├── Conecta WiFi
    ├── Sincroniza NTP
    └── Conecta AWS IoT Core (MQTT)

loop()
├── Verifica conexões (WiFi + MQTT)
├── Envia dados dos sensores (a cada 10s)
├── Monitora botão de pânico
│   └── Se pressionado: alterna modo e publica
└── Controla buzzer (ativo durante pânico)
```

## 📊 Formato dos Dados

Os dados são enviados em JSON via MQTT:

```json
{
  "deviceId": "Pulseira_DSIM",
  "batimentos": 75,           // BPM (60-120)
  "oxigenio": 98,             // SpO2 % (92-100)
  "temperatura": 36.5,        // °C (35.5-37.5)
  "panico_ativo": false       // true/false
}
```

### Processamento no Backend

1. **AWS IoT Rule** recebe no tópico `pulseira/dados`
2. Adiciona timestamp automaticamente
3. Insere na tabela **DynamoDB** `DSIM_SensorData`
4. **Lambda** processa:
   - Calcula score MEWS (Modified Early Warning Score)
   - Verifica limites de alarmes configurados
   - Envia alertas via WebSocket se necessário
5. **Backend API** disponibiliza dados
6. **Frontend** exibe em tempo real

## 🔧 Integração com Sensores Reais

**⚠️ Atualmente os valores são simulados com `random()`**

Para integrar sensores reais, substitua as funções de leitura:

### MAX30102 (BPM + SpO2)

```cpp
#include <MAX30105.h>
MAX30105 particleSensor;

// No setup():
particleSensor.begin(Wire, I2C_SPEED_FAST);
particleSensor.setup();

// Ler valores reais:
int batimentos = particleSensor.getHeartRate();
int oxigenio = particleSensor.getSpO2();
```

### MLX90614 (Temperatura)

```cpp
#include <Adafruit_MLX90614.h>
Adafruit_MLX90614 mlx;

// No setup():
mlx.begin();

// Ler temperatura:
float temperatura = mlx.readObjectTempC();
```

## 🧪 Testando

### 1. Upload do Código

1. Abra `PulseiraMonitoramentoPT1.ino` no Arduino IDE
2. Selecione a placa: **Tools → Board → ESP8266 → Generic ESP8266 Module**
3. Configure:
   - Flash Size: 1MB (FS:64KB OTA:~470KB)
   - Upload Speed: 115200
4. Compile e faça upload

### 2. Monitor Serial

Abra o Serial Monitor (115200 baud) para ver:

```
Attempting to connect to SSID: Nemtenta
.....
WiFi conectado!
Endereço IP: 192.168.1.100
Setting time using SNTP....done!
Hora atual: Wed Nov 13 11:48:00 2025
Connecting to AWS IoT
Tentando conexão MQTT como: Pulseira_DSIM
conectado ao AWS IoT!
Subscrito ao tópico: pulseira/comandos
---------------------------------
Setup completo. Aguardando interação...
---------------------------------
📊 Dados dos sensores [pulseira/dados]: {"deviceId":"Pulseira_DSIM","batimentos":75,"oxigenio":98,"temperatura":36.5,"panico_ativo":false}
✅ Dados enviados com sucesso!
```

### 3. Verificar no AWS Console

**MQTT Test Client:**
1. Acesse AWS IoT Core
2. **Test** → **MQTT test client**
3. Subscribe to: `pulseira/dados`
4. Você verá as mensagens chegando em tempo real

**DynamoDB:**
```bash
aws dynamodb scan --table-name DSIM_SensorData --region us-east-1 --max-items 5
```

### 4. Testar Botão de Pânico

1. Pressione o botão conectado ao GPIO0
2. Buzzer deve tocar
3. Monitor Serial mostra: `🚨 Modo pânico alternado para: ATIVO`
4. Mensagem com `"panico_ativo":true` é enviada imediatamente

## 🔐 Segurança

- **TLS 1.2**: Todas as comunicações são criptografadas
- **Certificados X.509**: Autenticação mútua (dispositivo ↔ AWS)
- **Políticas IoT**: Permissões específicas por dispositivo
- **Certificados únicos**: Cada pulseira tem certificados próprios

## 📝 Notas Importantes

1. **Sincronização de Tempo**: NTP é essencial para validar certificados TLS
2. **Intervalo de Envio**: 10 segundos (configurável em `publishInterval`)
3. **Reconexão**: Automática em caso de perda de conexão
4. **Memória**: ESP8266-01 tem RAM limitada (80KB). O código está otimizado.
5. **Alimentação**: Certifique-se de usar 3.3V (ESP8266 não suporta 5V)

## 🐛 Troubleshooting

### Não conecta ao WiFi
- Verifique SSID e senha
- Verifique sinal WiFi (ESP8266 não suporta 5GHz)
- Reset do ESP8266

### Não conecta ao AWS IoT
- Erro `rc=-2`: Certificados inválidos ou expirados
- Erro `rc=-4`: Timeout de conexão (firewall?)
- Erro `rc=5`: Credenciais rejeitadas (Thing Name incorreto)

### Dados não aparecem no DynamoDB
- Verifique se a regra IoT está ativa
- Verifique logs no CloudWatch
- Confirme que o tópico é `pulseira/dados`

## 📚 Referências

- [ESP8266 Arduino Core](https://github.com/esp8266/Arduino)
- [PubSubClient Library](https://github.com/knolleary/pubsubclient)
- [AWS IoT Core Documentation](https://docs.aws.amazon.com/iot/)
- [ArduinoJson Documentation](https://arduinojson.org/)

## 👥 Suporte

Para dúvidas ou problemas:
1. Verifique o Monitor Serial (115200 baud)
2. Consulte os logs do AWS IoT Core
3. Revise a documentação do backend em `../DSIM-COD/backend/README.md`
