# DSIM - Dispositivo de Segurança Inteligente para Monitoramento (Intelligent Security Device for Monitoring)

## About DSIM

As part of a Bachelor’s thesis in Computer Science at the Federal Institute of São Paulo – Salto Campus, the DSIM (Intelligent Safety Device for Monitoring) project involves developing a wearable solution that comprises a smart bracelet paired with an integrated web platform designed to monitor users who may be in situations of risk or vulnerability. 

The system continuously tracks vital signs, location, and movement, and automatically issues alerts through its smart features when necessary.By providing real-time data to both users and their caregivers or family members, DSIM promotes greater safety and autonomy, enables faster responses in critical situations, and improves the overall quality of assisted care.

## Features

- **Vital Sign Monitoring**: Real-time tracking of heart rate, body temperature, and blood oxygenation (SpO₂), with continuous data streaming for up-to-the-second health insights.
- **Fall Detection & Alerts**: Inertial-sensor fusion (accelerometer, gyroscope, magnetometer) to detect sudden impacts or prolonged inactivity, triggering immediate SMS notifications to preconfigured caregivers.
- **GPS Tracking**: Live geolocation via an integrated GPS module, providing precise position updates for both routine monitoring and emergency response.
- **Web Monitoring App**: Responsive, user-friendly interface for remote viewing of all vital and location data, with multi-user support allowing caregivers or family members personalized access.
- **Sensor Calibration & Validation**: Comparative accuracy tests against reference instruments for physiological sensors, and GPS performance evaluations assessing fix-time, positional accuracy, and environmental stability.
- **Cloud Infrastructure (AWS)**: The system leverages Amazon Web Services (AWS) to ensure secure, scalable, and highly available cloud storage, processing, and deployment of health and location data.


## Project's Code Location

```
Desenvolvimento/
  └── 3.Implementação/
      ├── DSIM-COD/DSIM/                     # Web server and dashboard
      │    ├── public/                       # Frontend: index.html, JS, CSS
      │    └── server.js                     # Backend: Express server, WebSocket
      │
      │
      └── DSIM-INO/                          # Arduino/ESP8266 firmware
           ├── ESP8266/                      # ESP8266 specific code
           └── PulseiraMonitoramentoPT1.ino  # Main monitoring bracelet firmware
```

## Setup & Installation

### 1. Prerequisites

* [**Node.js (LTS “Jod” 22.17.1)**.](https://nodejs.org/en/blog/release/v22.17.1)
* **Git** for cloning the repo.
* **AWS Account** with permissions to create IoT Core “Things,” Lambda functions, API Gateway and DynamoDB.
* **Arduino-compatible board** (Uno, Nano, ESP32/8266) + temperature sensor (e.g. DHT22 or LM35) + Wi‑Fi or Bluetooth module (if not built‑in).
* Then **clone the repo** with :
```bash
git clone https://github.com/FTakElu/DSIM.git
```
in your git bash.

### 2. Node.js configuration

```bash
# 1. Go to directory

cd DSIM/Desenvolvimento/3.Implementação/DSIM-COD/DSIM/

# 2. Initialize npm (if needed)
npm init -y

# 3. Install dependencies
npm install express ws aws-sdk

# 4. Start the server
node server.js
```

* The server listens on **[http://localhost:3000](http://localhost:3000)** by default.

---

### 3. AWS IoT Core Configuration

1. Sign in to the [AWS Console](https://console.aws.amazon.com/) and activate:

   * **AWS IoT Core**
   * **Lambda**
   * **API Gateway**
   * **DynamoDB**

2. In **IoT Core → Manage → Things**, click **Create Thing** and follow the wizard.

3. Download the auto‑generated certificates (Root CA, Device Cert, Private Key) and store them securely.

---

### 4. Configure `server.js` for AWS IoT

1. Ensure `aws-sdk` is installed:

   ```bash
   npm install aws‑sdk
   ```
2. At the top of **server.js**, add:

   ```js
   import AWS from 'aws‑sdk';

   AWS.config.update({
     region: 'us‑east‑1',            // your AWS region
     accessKeyId: 'YOUR_ACCESS_KEY',
     secretAccessKey: 'YOUR_SECRET_KEY'
   });

   const iotData = new AWS.IotData({ endpoint: 'YOUR_IOT_ENDPOINT' });
   ```

---

### 5. Arduino / ESP32 Integration

   **Hardware**

   * Arduino Uno/Nano or ESP32/8266
   * DHT22 or LM35 temperature sensor
   * Wi‑Fi (ESP32/8266) or external Wi‑Fi/Bluetooth module

---

### 6. Secure Production Setup

* **AWS IAM**: create least‑privilege policies and roles for your IoT devices.
* **Certificate Rotation**: periodically rotate device certificates/keys.
* **AWS Cognito**: consider using for user authentication and authorization.
* **TLS on Arduino**: for production, use `WiFiClientSecure` and load your CA, client cert & private key.

### 7. Firmware

- Open `PulseiraMonitoramentoPT1.ino` in the Arduino IDE.
- Configure Wi-Fi credentials and MQTT/AWS IoT parameters in the code.
- Upload the firmware to your ESP8266 device.

---

With these steps completed, your DSIM system will be fully installed and configured—from local development to cloud integration and wearable device connectivity.


## Usage

- After setup, the device should collect temperature data and send it to the web dashboard.
- Open the dashboard in your browser to view real-time values and history.

## Technologies Used

- **Languages**: C++ (Firmware), JavaScript (Backend/Frontend)
- **Frameworks**: Express.js, WebSocket
- **Hardware**: ESP8266 microcontroller
- **Cloud**: AWS IoT

## License

Please contact the repository owner for usage permissions.

## Contact

- Project Maintainer: [FTakElu](https://github.com/FTakElu)