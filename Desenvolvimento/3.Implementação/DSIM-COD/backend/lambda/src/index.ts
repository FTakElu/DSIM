import {
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import {
    AttributeValue as DynamoDBAttributeValue,
    DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    GetCommand,
    QueryCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDBStreamEvent } from 'aws-lambda';

// Configuração AWS
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Cliente WebSocket API Gateway (configurar endpoint)
const wsClient = new ApiGatewayManagementApiClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.WEBSOCKET_API_ENDPOINT,
});

// Tabelas DynamoDB
const TABLES = {
  SENSOR_DATA: process.env.DYNAMODB_SENSOR_DATA_TABLE || 'DSIM_SensorData',
  PATIENTS: process.env.DYNAMODB_PATIENTS_TABLE || 'DSIM_Patients',
  ALARMS: process.env.DYNAMODB_ALARMS_TABLE || 'DSIM_Alarms',
  CONNECTIONS: process.env.DYNAMODB_CONNECTIONS_TABLE || 'DSIM_Connections',
};

interface SensorData {
  deviceId: string;
  timestamp: number;
  batimentos: number;
  oxigenio: number;
  temperatura: number;
}

interface AlarmConfig {
  batimentos_min: number;
  batimentos_max: number;
  oxigenio_min: number;
  temperatura_max: number;
}

type VitalStatus = 'stable' | 'warning' | 'danger';

/**
 * Calcula o escore MEWS (Modified Early Warning Score)
 */
function calculateMEWS(
  batimentos: number,
  oxigenio: number,
  temperatura: number
): { score: number; status: VitalStatus } {
  let score = 0;

  // Frequência Cardíaca
  if (batimentos < 40) score += 3;
  else if (batimentos >= 40 && batimentos < 50) score += 1;
  else if (batimentos >= 50 && batimentos <= 100) score += 0;
  else if (batimentos > 100 && batimentos <= 110) score += 1;
  else if (batimentos > 110 && batimentos <= 129) score += 2;
  else if (batimentos >= 130) score += 3;

  // Saturação de Oxigênio
  if (oxigenio < 85) score += 3;
  else if (oxigenio >= 85 && oxigenio < 90) score += 2;
  else if (oxigenio >= 90 && oxigenio < 95) score += 1;
  else score += 0;

  // Temperatura
  if (temperatura < 35) score += 2;
  else if (temperatura >= 35 && temperatura < 36) score += 1;
  else if (temperatura >= 36 && temperatura <= 38) score += 0;
  else if (temperatura > 38 && temperatura <= 39) score += 1;
  else if (temperatura > 39) score += 2;

  let status: VitalStatus = 'stable';
  if (score >= 5) status = 'danger';
  else if (score >= 3) status = 'warning';

  return { score, status };
}

/**
 * Busca o paciente vinculado ao dispositivo
 */
async function findPatientByDevice(deviceId: string): Promise<any> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.PATIENTS,
        IndexName: 'deviceId-index',
        KeyConditionExpression: 'deviceId = :deviceId',
        ExpressionAttributeValues: {
          ':deviceId': deviceId,
        },
        Limit: 1,
      })
    );

    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    return null;
  }
}

/**
 * Busca configuração de alarmes do paciente
 */
async function getAlarmConfig(pacienteId: string): Promise<AlarmConfig> {
  const DEFAULT_CONFIG = {
    batimentos_min: 50,
    batimentos_max: 110,
    oxigenio_min: 92,
    temperatura_max: 38.0,
  };

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLES.ALARMS,
        Key: { pacienteId },
      })
    );

    return result.Item
      ? (result.Item as AlarmConfig)
      : DEFAULT_CONFIG;
  } catch (error) {
    console.error('Erro ao buscar configuração de alarme:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Verifica se deve disparar alarmes
 */
function checkAlarms(
  data: SensorData,
  config: AlarmConfig
): { shouldAlert: boolean; alerts: string[] } {
  const alerts: string[] = [];

  if (data.batimentos < config.batimentos_min) {
    alerts.push(`Batimentos baixos: ${data.batimentos} bpm`);
  }
  if (data.batimentos > config.batimentos_max) {
    alerts.push(`Batimentos altos: ${data.batimentos} bpm`);
  }
  if (data.oxigenio < config.oxigenio_min) {
    alerts.push(`Oxigênio baixo: ${data.oxigenio}%`);
  }
  if (data.temperatura > config.temperatura_max) {
    alerts.push(`Temperatura alta: ${data.temperatura}°C`);
  }

  return {
    shouldAlert: alerts.length > 0,
    alerts,
  };
}

/**
 * Atualiza os sinais vitais do paciente
 */
async function updatePatientVitals(
  pacienteId: string,
  data: SensorData,
  mews: { score: number; status: VitalStatus }
) {
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLES.PATIENTS,
        Key: { id: pacienteId },
        UpdateExpression: `SET 
          vitals.batimentos.#value = :batimentos,
          vitals.batimentos.#status = :batStatus,
          vitals.oxigenio.#value = :oxigenio,
          vitals.oxigenio.#status = :oxiStatus,
          vitals.temperatura.#value = :temperatura,
          vitals.temperatura.#status = :tempStatus,
          escoreMEWS = :score,
          statusMEWS = :mewsStatus,
          updatedAt = :timestamp`,
        ExpressionAttributeNames: {
          '#value': 'value',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':batimentos': data.batimentos,
          ':batStatus': mews.status,
          ':oxigenio': data.oxigenio,
          ':oxiStatus': mews.status,
          ':temperatura': data.temperatura,
          ':tempStatus': mews.status,
          ':score': mews.score,
          ':mewsStatus': mews.status,
          ':timestamp': data.timestamp,
        },
      })
    );
  } catch (error) {
    console.error('Erro ao atualizar vitais do paciente:', error);
  }
}

/**
 * Envia alerta via WebSocket
 */
async function sendWebSocketAlert(pacienteId: string, alert: any) {
  try {
    // Buscar conexões ativas deste paciente
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.CONNECTIONS,
        IndexName: 'pacienteId-index',
        KeyConditionExpression: 'pacienteId = :pacienteId',
        ExpressionAttributeValues: {
          ':pacienteId': pacienteId,
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      console.log('Nenhuma conexão ativa encontrada para:', pacienteId);
      return;
    }

    // Enviar para todas as conexões ativas
    const promises = result.Items.map(async (connection) => {
      try {
        await wsClient.send(
          new PostToConnectionCommand({
            ConnectionId: connection.connectionId,
            Data: JSON.stringify(alert),
          })
        );
      } catch (error: any) {
        // Se conexão está fechada, remover do DynamoDB
        if (error.statusCode === 410) {
          console.log('Conexão expirada, removendo:', connection.connectionId);
          // Aqui você poderia adicionar lógica para remover a conexão
        }
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Erro ao enviar alerta WebSocket:', error);
  }
}

/**
 * Handler principal da Lambda
 */
export async function handler(event: DynamoDBStreamEvent) {
  console.log('Processando evento DynamoDB Stream:', JSON.stringify(event));

  for (const record of event.Records) {
    try {
      // Processar apenas inserções de novos dados
      if (record.eventName !== 'INSERT') continue;

      const newImage = record.dynamodb?.NewImage;
      if (!newImage) continue;

      // Converter DynamoDB format para objeto normal
      const data = unmarshall(
        newImage as Record<string, DynamoDBAttributeValue>
      ) as SensorData;

      console.log('Dados do sensor:', data);

      // Buscar paciente vinculado
      const patient = await findPatientByDevice(data.deviceId);
      if (!patient) {
        console.log('Paciente não encontrado para deviceId:', data.deviceId);
        continue;
      }

      console.log('Paciente encontrado:', patient.id);

      // Calcular MEWS
      const mews = calculateMEWS(
        data.batimentos,
        data.oxigenio,
        data.temperatura
      );

      console.log('MEWS calculado:', mews);

      // Atualizar sinais vitais do paciente
      await updatePatientVitals(patient.id, data, mews);

      // Verificar alarmes personalizados
      const alarmConfig = await getAlarmConfig(patient.id);
      const alarmCheck = checkAlarms(data, alarmConfig);

      // Enviar alertas se necessário
      if (alarmCheck.shouldAlert || mews.status !== 'stable') {
        const alert = {
          type: 'vital_alert',
          pacienteId: patient.id,
          pacienteNome: patient.nome,
          timestamp: data.timestamp,
          vitals: {
            batimentos: data.batimentos,
            oxigenio: data.oxigenio,
            temperatura: data.temperatura,
          },
          mews,
          alerts: alarmCheck.alerts,
        };

        console.log('Enviando alerta:', alert);
        await sendWebSocketAlert(patient.id, alert);
      }
    } catch (error) {
      console.error('Erro ao processar registro:', error);
    }
  }

  return { statusCode: 200, body: 'Processamento concluído' };
}
