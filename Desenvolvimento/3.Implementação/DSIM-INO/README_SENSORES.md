# Pulseira DSIM - Sistema Completo de Monitoramento

## 📋 Componentes Utilizados

### Sensores
1. **LM35** - Sensor de temperatura corporal (0-100°C)
2. **MAX30102** - Sensor de oximetria (SpO2) e frequência cardíaca (BPM)
3. **MPU6050** - Acelerômetro/giroscópio para detecção de quedas

### Atuadores
1. **LED Azul** - Indica pulseira ligada
2. **LED Verde** - Pisca durante modo pânico
3. **Buzzer** - Emite som de alerta no modo pânico

### Botões
1. **Botão POWER** - Liga/desliga a pulseira
2. **Botão PÂNICO** - Ativa/desativa alarme de emergência

## 🔌 Pinout do ESP8266

```
GPIO0  (D3)  -> Botão POWER (com pull-up)
GPIO2  (D4)  -> Buzzer
GPIO4  (D2)  -> I2C SDA (MAX30102 e MPU6050)
GPIO5  (D1)  -> I2C SCL (MAX30102 e MPU6050)
GPIO12 (D6)  -> Botão PÂNICO (com pull-up)
GPIO13 (D7)  -> LED Azul (indica ligado)
GPIO14 (D5)  -> LED Verde (indica pânico)
GPIO15 (D8)  -> Reservado
A0           -> LM35 (saída analógica)
```

## 🛠️ Bibliotecas Necessárias

Instale via Arduino IDE Library Manager:

```
1. ESP8266WiFi (já inclusa no pacote ESP8266)
2. PubSubClient (para MQTT)
3. ArduinoJson (versão 6.x)
4. SparkFun MAX3010x Sensor Library
5. MPU6050 (by Electronic Cats)
6. Wire (já inclusa)
```

## 🔧 Configurações Importantes

### 1. LM35 - Temperatura Corporal
```cpp
// Leitura em contato constante com a pele
// Faixa normal: 35.5°C - 37.5°C
// Alerta febre: > 37.5°C
```

### 2. MAX30102 - SpO2 e BPM
```cpp
// SpO2 normal: 95-100%
// BPM normal em repouso: 60-100 bpm
// Sensor deve estar em contato com o dedo ou pulso
```

### 3. MPU6050 - Detecção de Quedas
```cpp
// Algoritmo:
// 1. Detecta queda livre (aceleração < 0.5g)
// 2. Detecta impacto (aceleração > 2.5g) em até 1s
// 3. Envia alerta automático
```

## 📡 Dados Enviados ao AWS IoT

### Tópico: `pulseira/dados`
```json
{
  "deviceId": "Pulseira_DSIM",
  "batimentos": 75,
  "oxigenio": 98,
  "temperatura": 36.5,
  "panico_ativo": false,
  "queda_detectada": false,
  "bateria": 85,
  "status": "online",
  "timestamp": 1234567890
}
```

### Tópico: `pulseira/status`
```json
{
  "deviceId": "Pulseira_DSIM",
  "status": "ligada|desligada|reconectada",
  "timestamp": 1234567890
}
```

### Tópico: `pulseira/alertas`
```json
{
  "deviceId": "Pulseira_DSIM",
  "alerta": "queda_detectada|fora_de_area",
  "timestamp": 1234567890,
  "temperatura": 36.5,
  "batimentos": 75
}
```

## ⚙️ Funcionalidades Implementadas

### ✅ Botão Power (Ligar/Desligar)
- Pressione para ligar → LED azul acende
- Pressione novamente para desligar → LED azul apaga
- **Notifica AWS**: Envia status "ligada" ou "desligada"

### ✅ Botão Pânico
- Pressione para ativar → LED verde pisca + buzzer apita
- Pressione novamente para desativar
- **Notifica AWS**: Campo `panico_ativo` = true/false

### ✅ Detecção de Quedas
- Automática via MPU6050
- **Notifica AWS**: Tópico `pulseira/alertas` com "queda_detectada"

### ✅ Monitoramento de Área
- Detecta quando perde conexão WiFi/MQTT
- **Notifica AWS**: Tópico `pulseira/alertas` com "fora_de_area"
- Notifica quando reconecta

### ✅ Nível de Bateria
- Monitora percentual de bateria
- Envia junto com os dados dos sensores
- Alerta quando < 20%

## 🚀 Como Usar

### 1. Preparação
```arduino
1. Instale todas as bibliotecas necessárias
2. Configure seu WiFi (WIFI_SSID e WIFI_PASSWORD)
3. Verifique os certificados AWS IoT
4. Faça upload do código para o ESP8266
```

### 2. Primeira Inicialização
```
1. Abra o Serial Monitor (115200 baud)
2. Pressione o botão POWER
3. Aguarde conexão WiFi e AWS IoT
4. LED azul acenderá quando conectado
```

### 3. Operação Normal
```
- LED Azul ligado = Pulseira funcionando
- Dados enviados automaticamente a cada 10 segundos
- Bateria verificada a cada 30 segundos
- Conexão verificada a cada 5 segundos
```

### 4. Modo Pânico
```
1. Pressione botão PÂNICO
2. LED verde piscará
3. Buzzer apitará
4. AWS receberá alerta imediato
```

## 🔍 Calibrações Necessárias

### LM35
```cpp
// Ajuste caso necessário:
float temp = voltage * 100.0; // 10mV/°C
```

### MAX30102 SpO2
```cpp
// IMPORTANTE: SpO2 requer calibração complexa
// Use biblioteca SparkFun spo2_algorithm.h
// Código atual usa estimativa simples
```

### MPU6050 Quedas
```cpp
const float FALL_THRESHOLD = 2.5;  // Ajuste sensibilidade
const float FALL_IMPACT = 0.5;     // Ajuste impacto
```

### Bateria
```cpp
// Adicione divisor de tensão para medir bateria:
// Bateria+ -> 10kΩ -> A0 -> 10kΩ -> GND
// Leitura = analogRead(A0) * (4.2/1023.0) * 2
```

## 📊 Integração com Backend

### Ajustes no Backend (já implementados)
O backend já possui:
- ✅ Endpoint para receber dados da pulseira
- ✅ Regra DynamoDB para armazenar histórico
- ✅ Sistema de alarmes MEWS
- ✅ Notificações SNS

### Próximos Passos Sugeridos
1. **SNS para alertas**: Configure tópico SNS para receber alertas de queda/pânico
2. **Dashboard**: Adicione indicador de bateria na interface
3. **Status online/offline**: Mostre quando pulseira está desligada
4. **Área de monitoramento**: Alerta visual quando sair da área

## 🐛 Troubleshooting

### Pulseira não conecta ao WiFi
```
- Verifique SSID e senha
- Verifique força do sinal WiFi
- ESP8266 só suporta 2.4GHz
```

### MAX30102 não detecta batimentos
```
- Verifique conexões I2C (SDA/SCL)
- Certifique-se que o sensor está em contato com a pele
- Aguarde 5-10 segundos para estabilizar
```

### MPU6050 detecta quedas falsas
```
- Aumente FALL_THRESHOLD (ex: 3.0)
- Ajuste tempo de detecção (ex: 1500ms)
```

### Bateria sempre 100%
```
- Implemente leitura real com divisor de tensão
- Calibre valores MAX/MIN da sua bateria
```

## 📝 Notas Importantes

1. **LM35 em contato com a pele**: Use pasta térmica ou gel para melhor contato
2. **MAX30102**: Pressão firme mas confortável no pulso
3. **Consumo de bateria**: WiFi+MQTT+Sensores = ~80-150mA
4. **Autonomia estimada**: 
   - Bateria 500mAh: ~3-6 horas
   - Bateria 1000mAh: ~6-12 horas
   - Bateria 2000mAh: ~13-25 horas

## 🔐 Segurança

- Certificados AWS incluídos no código
- Conexão TLS/SSL (porta 8883)
- Validação de mensagens MQTT
- Debounce de botões para evitar acionamentos falsos

---

**Desenvolvido para o projeto DSIM - Sistema de Monitoramento de Pacientes**
