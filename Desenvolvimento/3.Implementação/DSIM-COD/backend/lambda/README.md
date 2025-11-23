# Script para criar Lambda DSIM-MEWS-Processor via Console AWS

## ⚠️ AWS Academy restringe criação via CLI - Use o Console Web

### 📋 Passo a Passo (10 minutos)

#### 1. Acessar Lambda Console
- AWS Console → Services → Lambda
- Click "Create function"

#### 2. Configurações Básicas
```
Function name: DSIM-MEWS-Processor
Runtime: Node.js 20.x
Architecture: x86_64
Execution role: Use an existing role → LabRole
```

#### 3. Upload do Código
- Arquivo ZIP já criado: `lambda-function.zip` (7.9 MB)
- Code → Upload from → .zip file
- Selecionar: `lambda-function.zip`
- Click "Save"

#### 4. Configurar Variáveis de Ambiente
Configuration → Environment variables → Edit

Adicionar:
```
DYNAMODB_PATIENTS_TABLE = DSIM_Patients
DYNAMODB_ALARMS_TABLE = DSIM_Alarms
WS_ENDPOINT = ws://localhost:8080
```

(Trocar `localhost` pelo IP público do EC2 se backend estiver lá)

#### 5. Ajustar Configurações
Configuration → General configuration → Edit
```
Memory: 256 MB
Timeout: 30 seconds
```

#### 6. Configurar Trigger DynamoDB
**No DynamoDB Console:**
1. Tables → DSIM_SensorData
2. Exports and streams → DynamoDB stream details
3. Click "Turn on" (se desligado)
4. Stream view type: **New and old images**

**No Lambda Console:**
1. Configuration → Triggers → Add trigger
2. Select trigger: **DynamoDB**
3. DynamoDB table: **DSIM_SensorData**
4. Batch size: 100
5. Starting position: Latest
6. Click "Add"

#### 7. Testar Lambda
1. Test → Configure test event
2. Template: DynamoDB Stream event
3. Event JSON:
```json
{
  "Records": [
    {
      "eventID": "1",
      "eventName": "INSERT",
      "eventVersion": "1.0",
      "eventSource": "aws:dynamodb",
      "awsRegion": "us-east-1",
      "dynamodb": {
        "Keys": {
          "deviceId": {
            "S": "Pulseira_DSIM"
          },
          "timestamp": {
            "N": "1700000000000"
          }
        },
        "NewImage": {
          "deviceId": {
            "S": "Pulseira_DSIM"
          },
          "timestamp": {
            "N": "1700000000000"
          },
          "batimentos": {
            "N": "75"
          },
          "oxigenio": {
            "N": "98"
          },
          "temperatura": {
            "N": "36.5"
          },
          "panico_ativo": {
            "BOOL": false
          }
        },
        "SequenceNumber": "111",
        "SizeBytes": 26,
        "StreamViewType": "NEW_AND_OLD_IMAGES"
      }
    }
  ]
}
```
4. Click "Test"
5. Verificar logs no CloudWatch

---

## ✅ Verificação Final

Após configurar, testar o fluxo completo:

### 1. Publicar dados via IoT Core
IoT Core → Test → MQTT test client

Topic: `pulseira/dados`
Payload:
```json
{
  "deviceId": "Pulseira_DSIM",
  "batimentos": 85,
  "oxigenio": 96,
  "temperatura": 37.2,
  "panico_ativo": false
}
```

### 2. Verificar execução
1. **DynamoDB:** DSIM_SensorData deve ter novo registro
2. **Lambda Monitor:** Deve mostrar invocação
3. **CloudWatch Logs:** Verificar logs de execução
4. **DynamoDB:** DSIM_Patients deve ter MEWS atualizado

---

## 🐛 Troubleshooting

**Lambda não dispara:**
- Verificar que DynamoDB Stream está ON
- Verificar que trigger está configurado
- Verificar permissões da LabRole

**Lambda dá erro:**
- Verificar CloudWatch Logs
- Verificar variáveis de ambiente
- Verificar que handler é `dist/index.handler`

**MEWS não calcula:**
- Verificar que paciente com deviceId existe
- Verificar logs no CloudWatch

---

## 📂 Localização dos Arquivos

```
backend/lambda/
├── lambda-function.zip          ← Upload este arquivo (7.9 MB)
├── dist/                        ← Código compilado
│   └── index.js                 ← Handler: dist/index.handler
├── src/
│   └── index.ts                 ← Código fonte
├── node_modules/                ← Dependências
└── package.json
```

---

## 🔗 Links Úteis

- Lambda Console: https://console.aws.amazon.com/lambda/
- DynamoDB Console: https://console.aws.amazon.com/dynamodb/
- IoT Core Test: https://console.aws.amazon.com/iot/home?region=us-east-1#/test
- CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups

---

**Status:** ✅ ZIP criado e pronto para upload
**Tamanho:** 7.9 MB
**Localização:** `c:\Users\flavi\OneDrive\Área de Trabalho\DSIM\Desenvolvimento\3.Implementação\DSIM-COD\backend\lambda\lambda-function.zip`
