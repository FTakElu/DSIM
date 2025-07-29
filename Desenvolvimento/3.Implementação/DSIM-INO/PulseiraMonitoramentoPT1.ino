#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h> // Inclui as funcionalidades seguras para comunicação TLS/SSL
#include <PubSubClient.h>     // Biblioteca para MQTT
#include <ArduinoJson.h>      // Biblioteca para manipulação de JSON
#include <time.h>             // Para funções de tempo (necessário para NTP)

// --- 1. Configurações de WiFi ---
const char WIFI_SSID[] = "Nemtenta";        // SEU SSID (do seu WiFi)
const char WIFI_PASSWORD[] = "Toyo938912";  // SUA SENHA (do seu WiFi)

// --- 2. Configurações AWS IoT Core ---
const char THINGNAME[] = "DSIM_ESP8266_IoT"; // Seu Thing Name / Client ID
const char MQTT_HOST[] = "a2cs805qynf1nj-ats.iot.us-east-1.amazonaws.com"; // Seu Endpoint AWS IoT

const char AWS_IOT_PUBLISH_TOPIC[] = "DSIM_ESP8266_IoT/pub";
const char AWS_IOT_SUBSCRIBE_TOPIC[] = "DSIM_ESP8266_IoT/sub";

// --- 3. Pinos do Hardware para ESP8266-01 ---
const int buttonPin = 0;      // Pino digital para o botão de Pânico (GPIO0 no ESP8266-01)
const int buzzerPin = 2;      // Pino para o Buzzer (GPIO2 no ESP8266-01)

// --- 4. Variáveis de Estado para o Botão e Buzzer ---
bool panicMode = false;       // Estado atual do modo pânico (true = ativado, false = desativado)
int lastButtonState = HIGH;   // Último estado lido do botão (HIGH = não pressionado, LOW = pressionado)
unsigned long lastDebounceTime = 0; // Tempo do último acionamento do debounce
const int debounceDelay = 50; // Atraso para debounce em milissegundos

// --- 5. Configuração de Tempo para TLS/SSL ---
const int8_t TIME_ZONE = -3; // Fuso horário

// --- 6. Objetos de Conexão ---
WiFiClientSecure net;       // Objeto para comunicação segura (TLS/SSL)
PubSubClient client(net);   // Cliente MQTT que usa a conexão segura

// --- 7. Certificados e Chave Privada ---
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

// --- Funções Auxiliares ---

void NTPConnect() {
  Serial.print("Setting time using SNTP");
  configTime(TIME_ZONE * 3600, 0, "pool.ntp.org", "time.nist.gov");
  time_t now = time(nullptr);
  while (now < 1672531200) { // Espera até que o tempo seja sincronizado (timestamp maior que 1º de janeiro de 2023)
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("done!");
  Serial.print("Hora atual: ");
  Serial.println(ctime(&now));
}

void messageReceived(char *topic, byte *payload, unsigned int length) {
  Serial.print("Received [");
  Serial.print(topic);
  Serial.print("]: ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void connectAWS() {
  delay(3000);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println(String("Attempting to connect to SSID: ") + String(WIFI_SSID));
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("\nWiFi conectado!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());

  NTPConnect();

  net.setTrustAnchors(new BearSSL::X509List(cacert));
  net.setClientRSACert(new BearSSL::X509List(client_cert), new BearSSL::PrivateKey(privkey));

  client.setServer(MQTT_HOST, 8883);
  client.setCallback(messageReceived);

  Serial.println("Connecting to AWS IoT");

  while (!client.connected()) {
    Serial.print("Tentando conexão MQTT como: ");
    Serial.println(THINGNAME);
    if (client.connect(THINGNAME)) {
      Serial.println("conectado ao AWS IoT!");
      client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);
      Serial.println(String("Subscrito ao tópico: ") + AWS_IOT_SUBSCRIBE_TOPIC);
    } else {
      Serial.print("Falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos...");
      delay(5000);
    }
  }
  if (!client.connected()) {
    Serial.println("AWS IoT Timeout! Não foi possível conectar após várias tentativas.");
  }
}

void publishPanicStatus() {
  StaticJsonDocument<200> doc; // <--- CORRIGIDO: Adicionado o tamanho do buffer (200 bytes)
  doc["device_id"] = THINGNAME;
  doc["timestamp"] = String(time(nullptr));
  doc["panic_status"] = panicMode;

  char jsonBuffer[200];
  serializeJson(doc, jsonBuffer);

  Serial.print("Publicando no topico [");
  Serial.print(AWS_IOT_PUBLISH_TOPIC);
  Serial.print("]: ");
  Serial.println(jsonBuffer);

  if (client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer)) {
    Serial.println("Mensagem publicada com sucesso!");
  } else {
    Serial.println("Falha ao publicar mensagem.");
  }
}

void setup() {
  Serial.begin(115200);
  delay(100);

  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(buzzerPin, OUTPUT);
  noTone(buzzerPin);

  connectAWS();

  Serial.println("---------------------------------");
  Serial.println("Setup completo. Aguardando interação...");
  Serial.println("---------------------------------");
}

void loop() {
  // Mantém a conexão MQTT e processa mensagens
  if (!client.connected() || WiFi.status() != WL_CONNECTED) {
    Serial.println("Conexão perdida. Tentando reconectar...");
    connectAWS();
  }
  client.loop(); // Processa mensagens MQTT pendentes e mantém o keep-alive

  // --- LEITURA E DEBOUNCE DO BOTÃO (LÓGICA QUE VOCÊ DISSE QUE FUNCIONAVA) ---
  int currentButtonState = digitalRead(buttonPin);

  // Detecta a transição de HIGH para LOW (botão pressionado) E aplica o debounce
  if (currentButtonState == LOW && lastButtonState == HIGH && (millis() - lastDebounceTime) > debounceDelay) {
    panicMode = !panicMode;        // Alterna o modo (se estava false, vira true; se estava true, vira false)
    lastDebounceTime = millis();   // Atualiza o tempo do último "clique" para o debounce

    Serial.print("Modo pânico alternado para: ");
    Serial.println(panicMode ? "ATIVO" : "DESATIVADO");

    // Publica o status do pânico no AWS IoT (agora integrado)
    if (client.connected()) {
      publishPanicStatus(); // Chama a função que cria o JSON e publica
    } else {
      Serial.println("Erro: Não conectado ao AWS IoT para publicar mensagem.");
    }
  }
  lastButtonState = currentButtonState; // Salva o estado atual do botão para a próxima iteração

  // --- Lógica do Modo Pânico e Ativação do Buzzer ---
  if (panicMode) {
    tone(buzzerPin, 1000); // Buzzer toca um tom de 1000 Hz
  } else {
    noTone(buzzerPin);     // Buzzer desligado
  }

  // Não é necessário um delay fixo aqui, pois o debounce já controla a frequência de leitura do botão.
  // Removi as linhas de debug extra do final do loop para não encher o serial.
}