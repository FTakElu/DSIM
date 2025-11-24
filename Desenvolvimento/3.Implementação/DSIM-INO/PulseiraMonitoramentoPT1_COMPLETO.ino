#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include <Wire.h>
#include "MAX30105.h"           // Biblioteca para MAX30102 (SpO2 e BPM)
#include "heartRate.h"          // Algoritmo de detecção de batimentos
#include <MPU6050.h>            // Biblioteca para MPU6050 (detecção de quedas)

// --- 1. Configurações de WiFi ---
const char WIFI_SSID[] = "Nemtenta";
const char WIFI_PASSWORD[] = "Toyo938912";

// --- 2. Configurações AWS IoT Core ---
const char THINGNAME[] = "Pulseira_DSIM";
const char MQTT_HOST[] = "a2cs805qynf1nj-ats.iot.us-east-1.amazonaws.com";
const char AWS_IOT_PUBLISH_TOPIC[] = "pulseira/dados";
const char AWS_IOT_SUBSCRIBE_TOPIC[] = "pulseira/comandos";

// --- 3. Pinos do Hardware ---
const int LM35_PIN = A0;          // Pino analógico para LM35 (temperatura)
const int BUTTON_POWER_PIN = 14;   // Botão de ligar/desligar (D5)
const int BUTTON_PANIC_PIN = 12;   // Botão de pânico (D6)
const int LED_BLUE_PIN = 13;       // LED azul - indica ligado (D7)
const int LED_GREEN_PIN = 15;      // LED verde - indica pânico (D8)
const int BUZZER_PIN = 2;          // Buzzer para alarme de pânico (D4)

// I2C para MAX30102 e MPU6050 (SDA=D2, SCL=D1)

// --- 4. Objetos dos Sensores ---
MAX30105 particleSensor;
MPU6050 mpu;

// --- 5. Variáveis de Estado ---
bool deviceOn = false;              // Estado da pulseira (ligada/desligada)
bool panicMode = false;             // Modo pânico ativado
bool fallDetected = false;          // Queda detectada
bool wasConnected = false;          // Estado anterior de conexão (para detectar saída de área)

// Variáveis de bateria
const float BATTERY_MAX_VOLTAGE = 4.2;  // Voltagem máxima da bateria (LiPo 3.7V)
const float BATTERY_MIN_VOLTAGE = 3.0;  // Voltagem mínima da bateria
int batteryPercentage = 100;

// Variáveis do MAX30102
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute = 0;
int beatAvg = 0;
int spo2 = 98;

// Variáveis do LM35
float temperature = 36.5;

// Variáveis do MPU6050 (detecção de quedas)
int16_t ax, ay, az;
float accelMagnitude = 0;
const float FALL_THRESHOLD = 2.5;  // Limiar de aceleração para detectar queda (em g's)
const float FALL_IMPACT = 0.5;     // Limiar de impacto após queda livre
unsigned long fallTime = 0;
bool inFreeFall = false;

// Variáveis de debounce dos botões
int lastPowerButtonState = HIGH;
int lastPanicButtonState = HIGH;
unsigned long lastPowerDebounceTime = 0;
unsigned long lastPanicDebounceTime = 0;
const int debounceDelay = 50;

// Variáveis de temporização
unsigned long lastPublishTime = 0;
unsigned long lastBatteryCheck = 0;
unsigned long lastConnectionCheck = 0;
unsigned long panicBlinkTime = 0;
const unsigned long publishInterval = 10000;      // Enviar dados a cada 10s
const unsigned long batteryCheckInterval = 30000; // Verificar bateria a cada 30s
const unsigned long connectionCheckInterval = 5000; // Verificar conexão a cada 5s
bool panicLedState = false;

// --- 6. Configuração de Tempo ---
const int8_t TIME_ZONE = -3;

// --- 7. Objetos de Conexão ---
WiFiClientSecure net;
PubSubClient client(net);

// --- 8. Certificados (mantenha os mesmos do código original) ---
static const char cacert[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF
ADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6
b24gUm9vdCBDQSAxMB4XDTE1MDUyNjAwMDAwMFoXDTM4MDExNzAwMDAwMFowOTEL
MAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv
b3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj
ca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM
9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw
IFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6
VOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L
93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm
jgSubJrIqg0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC
AYYwHQYDVR0OBBYEFIQYzIU07LwMlJQuCFmcx7IQTgoIMA0GCSqGSIb3DQEBCwUA
A4IBAQCY8jdaQZChGsV2USggNiMOruYou6r4lK5IpDB/G/wkjUu0yKGX9rbxenDI
U5PMCCjjmCXPI6T53iHTfIUJrU6adTrCC2qJeHZERxhlbI1Bjjt/msv0tadQ1wUs
N+gDS63pYaACbvXy8MWy7Vu33PqUXHeeE6V/Uq2V8viTO96LXFvKWlJbYK8U90vv
o/ufQJVtMVT8QtPHRh8jrdkPSHCa2XV4cdFyQzR1bldZwgJcJmApzyMZFo6IQ6XU
5MsI+yMRQ+hDKXJioaldXgjUkK642M4UwtBV8ob2xJNDd2ZhwLnoQdeXeGADbkpy
rqXRfboQnoZsG4q5WTP468SQvvG5
-----END CERTIFICATE-----
)EOF";

static const char client_cert[] PROGMEM = R"KEY(
-----BEGIN CERTIFICATE-----
MIIDWTCCAkGgAwIBAgIUYRqMOLVdybZRm8Q0Qf0/zEEnO60wDQYJKoZIhvcNAQEL
BQAwTTFLMEkGA1UECwxCQW1hem9uIFdlYiBTZXJ2aWNlcyBPPUFtYXpvbi5jb20g
SW5jLiBMPVNlYXR0bGUgU1Q9V2FzaGluZ3RvbiBDPVVTMB4XDTI1MDcyNTAxNTM1
NVoXDTQ5MTIzMTIzNTk1OVowHjEcMBoGA1UEAwwTQVdTIElvVCBDZXJ0aWZpY2F0
ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKUU9PvQfS7Y5+Xk3xRe
rFWS8BKcdOWLuMXergoYxQNt87V/WZYz+r+Iqh/TP+dcn3/CmfRBJ+VhE+PIXFt3
3JxEks/tVFBIRTfcnCuk0iNiEhFDvtZ5XfdCd6Z2ohGx19GOfMNF4wqzKsMh0bkz
aBpCdp5bxQkuWCsRnu4pc3hBK9svHEOR/KI2za3pZmewNQEccjqPGJOHD069DgAB
2lzRGgU1ah5y365Uus3mWl1qoLgUE6ZbRMUuRBOWWzMkpvEUwcTxh5TsAsAbYiTV
+AtqcFfG/y2074zCm7S/ftgoyiZxyXYnZgbaFlgkBFg0V9/M1kK9Fcnz9HD+ZKPr
Ni0CAwEAAaNgMF4wHwYDVR0jBBgwFoAUVXTLsspcKNfWVWaFltPfpR4x8VIwHQYD
VR0OBBYEFCy3ME4AiGJ/LeEcZJ+XE9Ie2GsnMAwGA1UdEwEB/wQCMAAwDgYDVR0P
AQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4IBAQC+r5WNmkSiMmkMSFS99jJeEzgW
8hqrCFeyBmpYDCpLfg8dkkjaKcerSrU0CixI1KLQoKzk38TcUDqseIZ3OxdH47fs
wCCkOivFHLI0BkEY1AJUTVRIcrH0D3kxB22oxE3+OKf6zJAK6l7X3ZcIirWDgOPd
g75BB0qv+Oebl1clkmcQXwWoJ7vPCq+kdrETvKcQxpEsUeChSSCxuD7nog3nMTQy
6nmOTzV1vKn9CwZpg5CuimM5gcIxoxQXsXYYa/BOzXh+aod9gYoHSKkI4J2wvn+6
pjM4yJcDlUV0JpfGM9qUCxh7duGryKGZwdxyb37aT7NXmZanXdbVy3tRMOaE
-----END CERTIFICATE-----
)KEY";

static const char privkey[] PROGMEM = R"KEY(
-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEApRT0+9B9Ltjn5eTfFF6sVZLwEpx05Yu4xd6uChjFA23ztX9Z
ljP6v4iqH9M/51yff8KZ9EEn5WET48hcW3fcnESSz+1UUEhFN9ycK6TSI2ISEUO+
1nld90J3pnaiEbHX0Y58w0XjCrMqwyHRuTNoGkJ2nlvFCS5YKxGe7ilzeEEr2y8c
Q5H8ojbNrelmZ7A1ARxyOo8Yk4cPTr0OAAHaXNEaBTVqHnLfrlS6zeZaXWqguBQT
pltExS5EE5ZbMySm8RTBxPGHlOwCwBtiJNX4C2pwV8b/LbTvjMKbtL9+2CjKJnHJ
didmBtoWWCQEWDRX38zWQr0VyfP0cP5ko+s2LQIDAQABAoIBAQCSVWdsqL2u/1th
MGaG+f0txhjFhqcgq6BY1jHUhWxuw9Ka+o6BVQZbLlwP5gTpo/NHH0u1duRUsp8c
9YjZFAEdDLRPWIO6vrWM9SQClBIqh06Yu0K5f9BJ1EOX7eVwZgN3oST7PEIsQ/IO
EzaDQwxu6qeXbKXWo5xIYVBOsbPHziCsvmTV9wB61CSmO9TsXKwNwrz3qHn3utzC
+qZ7fZ3iCC/HefPCN0EoNYT5ST6xuSXjW3L6GHvnQqvU5TCvmMYu5W89ww7oN1xX
z/8/sEInyVEAZXVTrZUv5Kz4J9buMAZEVRwoP4Pq0Okc11q9Qpic+vYLEjf0nT2M
/wglQ/vBAoGBANb7HzCbP7hWy/+Fvgph1Ln4BFnzHOJMpMtokjuNlMxU9sKHB8Tk
EwvSwa7Fze16QCffSFPeBJqgyICOn5RHsdj4z5IOtcRaCQX3Ue5g/lHkEslIl+4I
O0n+s8CBkzEQDiIEw1+nZg6oMd8F7Lh+WjhwugjFVLERjm8jhI3CF8vJAoGBAMSU
e8DOPubo2vT10R1uEU94LqvbKNfJ30+EBmGlF95BXAEAKHdxMons3zcUwBb2U6QF
YGJPiXbpXQ0oDLTU07v3Nt96pTg61SXpLJ+l2BTiQdqTB2HD9fac+IK+9RDqt/Rf
tkpNi3uC+1xxoiRNkJgN+qrYOkubhxlCYuAtyYFFAoGBAJTzqcijyKKQgQeqQuIu
ppWzolAwgfLJ5+SHr8pTbqWkuNRPerKQ1CF9BXVy2BuSeKEns5VoXwhEHqf0Kd0z
T6ZlvmwUhRxmxZm8oqfnzE4xGFMeWSYzzeCW+TSIktOLrD8lzbiY472EDAnasQmj
gh9Y+4zYLLYC1A1tLoqJ0LMBAoGBAMPxsW0c58wovN/BCsEIDo8lH3hECvEVEtdi
pS29bw4mHfwNWUi9d3/NsS1pLJN20yZCCbHU0BPMRukvS4MQRUEuCO83g+qJkh6o
zscPe1RNtxCUz53ew5QfIQLKLuK+47/di4mCxA7IH58k0VbYTdGS1ZJn16u3ijFe
X8pPOXT1AoGAf7GLRroM1EzdClu+pbWJi2h5cRYJi/VotqwMuOfVvUi9CopOZTSC
sjCXNgxo4MLFX3yDsVYdYcylq9JVvHgByOImaAjXqaGbnq1vwzr/9MUHC6EJ8ptf
wLVAMu9651br036N4ueESi07phl1An8yuwo2mUEzXQe4FXqyliy4Z0k=
-----END RSA PRIVATE KEY-----
)KEY";

// --- FUNÇÕES AUXILIARES ---

void NTPConnect() {
  Serial.print("⏰ Sincronizando horário via NTP");
  configTime(TIME_ZONE * 3600, 0, "pool.ntp.org", "time.nist.gov");
  time_t now = time(nullptr);
  while (now < 1672531200) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println(" OK!");
  Serial.print("Hora atual: ");
  Serial.println(ctime(&now));
}

void messageReceived(char *topic, byte *payload, unsigned int length) {
  Serial.print("📩 Mensagem recebida [");
  Serial.print(topic);
  Serial.print("]: ");
  
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  
  // Processar comandos remotos (ex: desligar pulseira remotamente)
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);
  
  if (!error) {
    if (doc.containsKey("comando")) {
      String comando = doc["comando"].as<String>();
      if (comando == "desligar") {
        deviceOn = false;
        digitalWrite(LED_BLUE_PIN, LOW);
        Serial.println("🔴 Pulseira desligada remotamente");
      }
    }
  }
}

void connectAWS() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println(String("📡 Conectando ao WiFi: ") + String(WIFI_SSID));
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    Serial.print(".");
    delay(500);
    attempts++;
  }
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\n❌ Falha ao conectar WiFi");
    return;
  }
  
  Serial.println("\n✅ WiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  NTPConnect();

  net.setTrustAnchors(new BearSSL::X509List(cacert));
  net.setClientRSACert(new BearSSL::X509List(client_cert), new BearSSL::PrivateKey(privkey));

  client.setServer(MQTT_HOST, 8883);
  client.setCallback(messageReceived);

  Serial.println("🔐 Conectando ao AWS IoT...");

  int mqttAttempts = 0;
  while (!client.connected() && mqttAttempts < 3) {
    if (client.connect(THINGNAME)) {
      Serial.println("✅ Conectado ao AWS IoT!");
      client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);
      Serial.println(String("📫 Inscrito em: ") + AWS_IOT_SUBSCRIBE_TOPIC);
      wasConnected = true;
      
      // Notificar que a pulseira foi ligada
      publishDeviceStatus("ligada");
    } else {
      Serial.print("❌ Falha MQTT, rc=");
      Serial.println(client.state());
      mqttAttempts++;
      delay(2000);
    }
  }
}

// Ler temperatura do LM35
float readLM35Temperature() {
  int reading = analogRead(LM35_PIN);
  // LM35: 10mV por °C, ESP8266 ADC 0-1V = 0-1023
  // Temperatura = (reading * (1000/1023)) / 10
  float voltage = (reading / 1023.0) * 1.0; // Tensão em Volts
  float temp = voltage * 100.0; // LM35: 10mV/°C = 100x para °C
  
  // Filtro simples para evitar leituras absurdas
  if (temp < 30.0 || temp > 45.0) {
    return temperature; // Retorna última leitura válida
  }
  return temp;
}

// Ler dados do MAX30102 (SpO2 e BPM)
void readMAX30102() {
  long irValue = particleSensor.getIR();
  
  if (checkForBeat(irValue) == true) {
    long delta = millis() - lastBeat;
    lastBeat = millis();
    
    beatsPerMinute = 60 / (delta / 1000.0);
    
    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= RATE_SIZE;
      
      beatAvg = 0;
      for (byte x = 0; x < RATE_SIZE; x++)
        beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  }
  
  // Estimativa simples de SpO2 (requer calibração adequada)
  // Para MAX30102, usar biblioteca SparkFun MAX3010x com algoritmo spo2_algorithm
  if (irValue < 50000) {
    spo2 = 0; // Dedo não detectado
  } else {
    spo2 = 95 + random(0, 5); // Simulação - SUBSTITUA pelo algoritmo real
  }
}

// Detectar quedas com MPU6050
void checkForFall() {
  mpu.getAcceleration(&ax, &ay, &az);
  
  // Calcular magnitude da aceleração (em g's)
  accelMagnitude = sqrt(pow(ax/16384.0, 2) + pow(ay/16384.0, 2) + pow(az/16384.0, 2));
  
  // Detecta queda livre (aceleração próxima de 0g)
  if (accelMagnitude < FALL_IMPACT && !inFreeFall) {
    inFreeFall = true;
    fallTime = millis();
    Serial.println("⚠️ Queda livre detectada!");
  }
  
  // Detecta impacto após queda livre
  if (inFreeFall && accelMagnitude > FALL_THRESHOLD) {
    if (millis() - fallTime < 1000) { // Impacto em até 1 segundo após queda livre
      fallDetected = true;
      inFreeFall = false;
      Serial.println("🚨 QUEDA DETECTADA!");
      publishFallAlert();
    } else {
      inFreeFall = false; // Timeout, não foi queda real
    }
  }
  
  // Reset do estado de queda livre após 1.5 segundos
  if (inFreeFall && millis() - fallTime > 1500) {
    inFreeFall = false;
  }
}

// Calcular percentual de bateria
int readBatteryPercentage() {
  // SUBSTITUA por leitura real do pino de bateria
  // Exemplo com divisor de tensão: batteryVoltage = analogRead(BATTERY_PIN) * (4.2 / 1023.0)
  float batteryVoltage = 3.7; // Simulação
  
  float percentage = ((batteryVoltage - BATTERY_MIN_VOLTAGE) / (BATTERY_MAX_VOLTAGE - BATTERY_MIN_VOLTAGE)) * 100.0;
  
  if (percentage > 100) percentage = 100;
  if (percentage < 0) percentage = 0;
  
  return (int)percentage;
}

// Publicar status do dispositivo (ligado/desligado)
void publishDeviceStatus(const char* status) {
  StaticJsonDocument<256> doc;
  doc["deviceId"] = THINGNAME;
  doc["status"] = status;
  doc["timestamp"] = millis();
  
  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);
  
  if (client.publish("pulseira/status", jsonBuffer)) {
    Serial.print("📤 Status enviado: ");
    Serial.println(status);
  }
}

// Publicar alerta de queda
void publishFallAlert() {
  StaticJsonDocument<256> doc;
  doc["deviceId"] = THINGNAME;
  doc["alerta"] = "queda_detectada";
  doc["timestamp"] = millis();
  doc["temperatura"] = temperature;
  doc["batimentos"] = beatAvg;
  
  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);
  
  if (client.publish("pulseira/alertas", jsonBuffer)) {
    Serial.println("🚨 Alerta de queda enviado!");
  }
}

// Publicar dados dos sensores
void publishSensorData() {
  StaticJsonDocument<512> doc;
  
  doc["deviceId"] = THINGNAME;
  doc["batimentos"] = beatAvg > 0 ? beatAvg : 0;
  doc["oxigenio"] = spo2;
  doc["temperatura"] = temperature;
  doc["panico_ativo"] = panicMode;
  doc["queda_detectada"] = fallDetected;
  doc["bateria"] = batteryPercentage;
  doc["status"] = deviceOn ? "online" : "offline";
  doc["timestamp"] = millis();
  
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);
  
  if (client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer)) {
    Serial.print("📊 Dados enviados: BPM=");
    Serial.print(beatAvg);
    Serial.print(" SpO2=");
    Serial.print(spo2);
    Serial.print("% Temp=");
    Serial.print(temperature);
    Serial.print("°C Bat=");
    Serial.print(batteryPercentage);
    Serial.println("%");
  } else {
    Serial.println("❌ Falha ao enviar dados");
  }
  
  // Reset flag de queda após enviar
  fallDetected = false;
}

// Verificar se saiu da área de cobertura
void checkConnectionStatus() {
  bool isConnected = client.connected() && WiFi.status() == WL_CONNECTED;
  
  // Detecta perda de conexão
  if (wasConnected && !isConnected) {
    Serial.println("⚠️ SAIU DA ÁREA DE MONITORAMENTO!");
    wasConnected = false;
    // Tentar publicar alerta antes de perder conexão totalmente
    StaticJsonDocument<256> doc;
    doc["deviceId"] = THINGNAME;
    doc["alerta"] = "fora_de_area";
    doc["timestamp"] = millis();
    char jsonBuffer[256];
    serializeJson(doc, jsonBuffer);
    client.publish("pulseira/alertas", jsonBuffer);
  }
  
  // Detecta reconexão
  if (!wasConnected && isConnected) {
    Serial.println("✅ VOLTOU À ÁREA DE MONITORAMENTO");
    wasConnected = true;
    publishDeviceStatus("reconectada");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n\n🔷 === PULSEIRA DSIM - SISTEMA COMPLETO === 🔷");
  
  // Configurar pinos
  pinMode(BUTTON_POWER_PIN, INPUT_PULLUP);
  pinMode(BUTTON_PANIC_PIN, INPUT_PULLUP);
  pinMode(LED_BLUE_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LM35_PIN, INPUT);
  
  digitalWrite(LED_BLUE_PIN, LOW);
  digitalWrite(LED_GREEN_PIN, LOW);
  noTone(BUZZER_PIN);
  
  // Inicializar I2C
  Wire.begin();
  
  // Inicializar MAX30102
  Serial.print("🫀 Iniciando MAX30102... ");
  if (particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("OK!");
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
  } else {
    Serial.println("FALHA!");
  }
  
  // Inicializar MPU6050
  Serial.print("🏃 Iniciando MPU6050... ");
  mpu.initialize();
  if (mpu.testConnection()) {
    Serial.println("OK!");
  } else {
    Serial.println("FALHA!");
  }
  
  Serial.println("\n✅ Setup completo!");
  Serial.println("Pressione o botão POWER para ligar a pulseira");
  Serial.println("=========================================\n");
}

void loop() {
  // --- BOTÃO POWER (LIGAR/DESLIGAR) ---
  int currentPowerState = digitalRead(BUTTON_POWER_PIN);
  if (currentPowerState == LOW && lastPowerButtonState == HIGH && 
      (millis() - lastPowerDebounceTime) > debounceDelay) {
    deviceOn = !deviceOn;
    lastPowerDebounceTime = millis();
    
    digitalWrite(LED_BLUE_PIN, deviceOn ? HIGH : LOW);
    
    if (deviceOn) {
      Serial.println("\n🟢 PULSEIRA LIGADA");
      connectAWS();
    } else {
      Serial.println("\n🔴 PULSEIRA DESLIGADA");
      publishDeviceStatus("desligada");
      client.disconnect();
      digitalWrite(LED_GREEN_PIN, LOW);
      noTone(BUZZER_PIN);
      panicMode = false;
    }
  }
  lastPowerButtonState = currentPowerState;
  
  // Se a pulseira está desligada, não faz mais nada
  if (!deviceOn) {
    delay(100);
    return;
  }
  
  // --- MANTER CONEXÃO MQTT ---
  if (!client.connected()) {
    Serial.println("⚠️ Reconectando...");
    connectAWS();
  }
  client.loop();
  
  // --- BOTÃO PÂNICO ---
  int currentPanicState = digitalRead(BUTTON_PANIC_PIN);
  if (currentPanicState == LOW && lastPanicButtonState == HIGH && 
      (millis() - lastPanicDebounceTime) > debounceDelay) {
    panicMode = !panicMode;
    lastPanicDebounceTime = millis();
    
    Serial.print("🚨 Modo pânico: ");
    Serial.println(panicMode ? "ATIVADO" : "DESATIVADO");
    
    if (!panicMode) {
      digitalWrite(LED_GREEN_PIN, LOW);
      noTone(BUZZER_PIN);
    }
    
    // Publicar imediatamente
    publishSensorData();
  }
  lastPanicButtonState = currentPanicState;
  
  // --- ALARME DE PÂNICO (LED + BUZZER) ---
  if (panicMode) {
    // LED verde pisca a cada 500ms
    if (millis() - panicBlinkTime > 500) {
      panicLedState = !panicLedState;
      digitalWrite(LED_GREEN_PIN, panicLedState ? HIGH : LOW);
      panicBlinkTime = millis();
    }
    // Buzzer apita continuamente
    tone(BUZZER_PIN, 2000);
  } else {
    noTone(BUZZER_PIN);
  }
  
  // --- LEITURA DOS SENSORES ---
  temperature = readLM35Temperature();
  readMAX30102();
  checkForFall();
  
  // --- VERIFICAR BATERIA (A CADA 30s) ---
  if (millis() - lastBatteryCheck > batteryCheckInterval) {
    batteryPercentage = readBatteryPercentage();
    lastBatteryCheck = millis();
    
    // Alerta de bateria baixa
    if (batteryPercentage < 20) {
      Serial.print("🔋 BATERIA BAIXA: ");
      Serial.print(batteryPercentage);
      Serial.println("%");
    }
  }
  
  // --- VERIFICAR STATUS DE CONEXÃO (A CADA 5s) ---
  if (millis() - lastConnectionCheck > connectionCheckInterval) {
    checkConnectionStatus();
    lastConnectionCheck = millis();
  }
  
  // --- ENVIO PERIÓDICO DE DADOS (A CADA 10s) ---
  if (millis() - lastPublishTime > publishInterval) {
    publishSensorData();
    lastPublishTime = millis();
  }
  
  delay(50); // Pequeno delay para não sobrecarregar o loop
}
