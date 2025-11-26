import { IoTClient, ListThingsCommand } from '@aws-sdk/client-iot';
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane';
import { SNSClient, SubscribeCommand } from '@aws-sdk/client-sns';
import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    ScanCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDB, TABLES } from '../config/aws';
import { authMiddleware } from '../middleware/auth';
import { sendCustomAlert, sendFallAlert, sendPanicAlert } from '../services/sns-service';
import { AuthRequest, Patient } from '../types';
import { emitAlert, emitDeviceStatus, emitVitalUpdate } from '../websocket';
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

async function subscribeResponsavelSNS({ email, telefone }: { email?: string; telefone?: string }) {
  // Subscrever email
  if (email) {
    try {
      await snsClient.send(new SubscribeCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Protocol: 'email',
        Endpoint: email
      }));
      console.log('Solicitação de subscrição SNS para email enviada:', email);
    } catch (err) {
      console.error('Erro ao subscrever email no SNS:', err);
    }
  }
  // Subscrever SMS
  if (telefone) {
    try {
      await snsClient.send(new SubscribeCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Protocol: 'sms',
        Endpoint: telefone
      }));
      console.log('Solicitação de subscrição SNS para SMS enviada:', telefone);
    } catch (err) {
      console.error('Erro ao subscrever SMS no SNS:', err);
    }
  }
}

const router = Router();

// Endpoint público para receber dados do IoT Core (SEM autenticação JWT)
// Este endpoint é chamado pelo AWS IoT Core via MQTT/Lambda
router.post(
  '/iot/data',
  async (req: any, res: Response): Promise<void> => {
    try {
      const sensorData = req.body;
      const { deviceId } = sensorData;

      if (!deviceId) {
        res.status(400).json({ message: 'deviceId é obrigatório' });
        return;
      }

      console.log(`📡 Dados IoT recebidos do dispositivo ${deviceId}`);

      // Buscar paciente pelo deviceId
      const result = await dynamoDB.send(
        new ScanCommand({
          TableName: TABLES.PATIENTS,
          FilterExpression: 'deviceId = :deviceId',
          ExpressionAttributeValues: {
            ':deviceId': deviceId,
          },
        })
      );

      const patient = result.Items?.[0];
      
      if (!patient) {
        console.warn(`Dispositivo ${deviceId} não está vinculado a nenhum paciente`);
        res.status(404).json({ message: 'Paciente não encontrado para este dispositivo' });
        return;
      }

      // Emitir atualização de sinais vitais via WebSocket
      emitVitalUpdate(patient.id, {
        patientId: patient.id,
        patientName: patient.nome,
        deviceId,
        ...sensorData,
        timestamp: Date.now(),
      });

      // Verificar alertas de pânico
      if (sensorData.panico_ativo) {
        console.log(`🚨 Pânico detectado para paciente ${patient.id}`);
        
        emitAlert(patient.id, 'panic', {
          patientId: patient.id,
          patientName: patient.nome,
          message: 'Botão de pânico acionado!',
          ...sensorData,
        });

        try {
          await sendPanicAlert(patient as any, sensorData);
        } catch (snsError) {
          console.error('Erro ao enviar alerta SNS de pânico:', snsError);
        }
      }

      // Verificar alertas de queda
      if (sensorData.queda_detectada) {
        console.log(`⚠️ Queda detectada para paciente ${patient.id}`);
        
        emitAlert(patient.id, 'fall', {
          patientId: patient.id,
          patientName: patient.nome,
          message: 'Queda detectada!',
          ...sensorData,
        });

        try {
          await sendFallAlert(patient as any, sensorData);
        } catch (snsError) {
          console.error('Erro ao enviar alerta SNS de queda:', snsError);
        }
      }

      // Verificar sinais vitais críticos
      const alertasVitais: string[] = [];

      if (sensorData.frequencia_cardiaca) {
        if (sensorData.frequencia_cardiaca < 40) {
          alertasVitais.push(`⚠️ Bradicardia severa: ${sensorData.frequencia_cardiaca} bpm (normal: 60-100)`);
        } else if (sensorData.frequencia_cardiaca > 120) {
          alertasVitais.push(`⚠️ Taquicardia severa: ${sensorData.frequencia_cardiaca} bpm (normal: 60-100)`);
        }
      }

      if (sensorData.saturacao_oxigenio) {
        if (sensorData.saturacao_oxigenio < 90) {
          alertasVitais.push(`⚠️ Hipoxemia: ${sensorData.saturacao_oxigenio}% (normal: >95%)`);
        }
      }

      if (sensorData.temperatura) {
        if (sensorData.temperatura > 38) {
          alertasVitais.push(`⚠️ Febre: ${sensorData.temperatura}°C (normal: 36-37.5°C)`);
        } else if (sensorData.temperatura < 35) {
          alertasVitais.push(`⚠️ Hipotermia: ${sensorData.temperatura}°C (normal: 36-37.5°C)`);
        }
      }

      // Enviar alerta SNS se houver sinais vitais críticos
      if (alertasVitais.length > 0) {
        console.log(`🚨 Sinais vitais críticos detectados para paciente ${patient.id}`);
        
        const mensagem = `
⚠️ ALERTA DE SINAIS VITAIS CRÍTICOS - DSIM

Paciente: ${patient.nome}
ID: ${patient.id}
Data/Hora: ${new Date().toLocaleString('pt-BR')}

ALERTAS DETECTADOS:
${alertasVitais.join('\n')}

Sinais vitais atuais:
${sensorData.frequencia_cardiaca ? `• Frequência Cardíaca: ${sensorData.frequencia_cardiaca} bpm` : ''}
${sensorData.saturacao_oxigenio ? `• Saturação de O2: ${sensorData.saturacao_oxigenio}%` : ''}
${sensorData.temperatura ? `• Temperatura: ${sensorData.temperatura}°C` : ''}

⚠️ Verificação recomendada!

Contato de emergência: ${patient.contatoEmergencia?.telefone || 'Não cadastrado'}
        `.trim();

        try {
          await sendCustomAlert(
            `⚠️ SINAIS VITAIS CRÍTICOS - ${patient.nome}`,
            mensagem
          );
          
          emitAlert(patient.id, 'vital-critical', {
            patientId: patient.id,
            patientName: patient.nome,
            message: alertasVitais.join(', '),
            ...sensorData,
          });
        } catch (snsError) {
          console.error('Erro ao enviar alerta SNS de sinais vitais:', snsError);
        }
      }

      // Verificar status do dispositivo
      if (sensorData.status) {
        emitDeviceStatus(patient.id, sensorData.status);
      }

      res.json({ 
        message: 'Dados recebidos e processados com sucesso', 
        patientId: patient.id,
        alertas: alertasVitais.length > 0 ? alertasVitais : undefined
      });
    } catch (error) {
      console.error('❌ Erro ao processar dados do IoT:', error);
      res.status(500).json({ message: 'Erro ao processar dados do IoT' });
    }
  }
);

// Todas as rotas de pacientes ABAIXO requerem autenticação
router.use(authMiddleware);

// Listar todos os pacientes (filtrado por usuário)
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId; // ID do usuário autenticado

    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TABLES.PATIENTS,
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
    );

    const patients = result.Items || [];
    
    // Para cada paciente, verificar dados recentes do sensor para atualizar status
    const patientsWithStatus = await Promise.all(
      patients.map(async (patient) => {
        if (patient.deviceId) {
          try {
            // Buscar dados mais recentes do sensor (últimos 5 minutos)
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            const sensorResult = await dynamoDB.send(
              new ScanCommand({
                TableName: TABLES.SENSOR_DATA,
                FilterExpression: 'deviceId = :deviceId AND #ts > :timestamp',
                ExpressionAttributeNames: {
                  '#ts': 'timestamp',
                },
                ExpressionAttributeValues: {
                  ':deviceId': patient.deviceId,
                  ':timestamp': fiveMinutesAgo,
                },
                Limit: 1,
              })
            );
            
            // Se tem dados recentes, dispositivo está online
            if (sensorResult.Items && sensorResult.Items.length > 0) {
              patient.statusDispositivo = 'online';
              patient.status = sensorResult.Items[0].status || 'online';
            } else {
              patient.statusDispositivo = 'offline';
              patient.status = 'offline';
            }
          } catch (error) {
            console.error(`Erro ao verificar status do dispositivo ${patient.deviceId}:`, error);
            patient.statusDispositivo = 'offline';
          }
        } else {
          patient.statusDispositivo = 'desligada';
        }
        return patient;
      })
    );
    
    res.json(patientsWithStatus);
  } catch (error) {
    console.error('Erro ao listar pacientes:', error);
    res.status(500).json({ message: 'Erro ao listar pacientes' });
  }
});

// Buscar paciente por ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TABLES.PATIENTS,
        Key: { id },
      })
    );

    if (!result.Item) {
      res.status(404).json({ message: 'Paciente não encontrado' });
      return;
    }

    res.json(result.Item);
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    res.status(500).json({ message: 'Erro ao buscar paciente' });
  }
});

// Listar dispositivos disponíveis (não atribuídos a nenhum paciente)
router.get('/devices/available', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const iotClient = new IoTDataPlaneClient({ region: process.env.AWS_REGION });
    const iot = new IoTClient({ region: process.env.AWS_REGION });
    
    // Buscar todas as Things (dispositivos) do IoT Core
    let allDevices: string[] = [];
    try {
      const listThingsCommand = new ListThingsCommand({});
      const thingsResponse = await iot.send(listThingsCommand);
      allDevices = (thingsResponse.things || [])
        .map((thing: any) => thing.thingName)
        .filter((name: any): name is string => name !== undefined);
      
      console.log('Dispositivos IoT Core encontrados:', allDevices);
    } catch (iotError) {
      console.error('Erro ao buscar dispositivos do IoT Core:', iotError);
      // Se falhar, retornar lista vazia em vez de hardcoded
      allDevices = [];
    }
    
    // Buscar todos os pacientes para verificar quais dispositivos estão em uso
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TABLES.PATIENTS,
        ProjectionExpression: 'deviceId',
      })
    );

    const usedDevices = (result.Items || [])
      .map(item => item.deviceId)
      .filter(Boolean); // Remove valores undefined/null

    // Retornar dispositivos que não estão em uso
    const availableDevices = allDevices.filter(device => !usedDevices.includes(device));
    
    res.json({
      all: allDevices,
      used: usedDevices,
      available: availableDevices,
    });
  } catch (error) {
    console.error('Erro ao buscar dispositivos disponíveis:', error);
    res.status(500).json({ message: 'Erro ao buscar dispositivos disponíveis' });
  }
});

// Criar novo paciente
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientData = req.body;
    const userId = req.userId; // ID do usuário autenticado

    const newPatient: Patient = {
      id: uuidv4(),
      ...patientData,
      userId, // Associar paciente ao usuário
      vitals: patientData.vitals || {
        oxigenio: { value: 98, status: 'stable' },
        temperatura: { value: 36.5, status: 'stable' },
        batimentos: { value: 80, status: 'stable' },
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: TABLES.PATIENTS,
        Item: newPatient,
      })
    );

    // Subscrever responsável no SNS
    if (newPatient.contatoEmergencia) {
      await subscribeResponsavelSNS({
        email: newPatient.contatoEmergencia.email,
        telefone: newPatient.contatoEmergencia.telefone
      });
    }

    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    res.status(500).json({ message: 'Erro ao criar paciente' });
  }
});

// Atualizar paciente
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verificar se paciente existe e pertence ao usuário
    const existing = await dynamoDB.send(
      new GetCommand({
        TableName: TABLES.PATIENTS,
        Key: { id },
      })
    );

    if (!existing.Item) {
      res.status(404).json({ message: 'Paciente não encontrado' });
      return;
    }

    // Verificar se o paciente pertence ao usuário autenticado
    if (existing.Item.userId !== req.userId) {
      res.status(403).json({ message: 'Você não tem permissão para editar este paciente' });
      return;
    }

    // Construir expressão de atualização
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.keys(updates).forEach((key, index) => {
      if (key !== 'id') {
        updateExpressions.push(`#field${index} = :value${index}`);
        expressionAttributeNames[`#field${index}`] = key;
        expressionAttributeValues[`:value${index}`] = updates[key];
      }
    });

    updateExpressions.push(`#updatedAt = :updatedAt`);
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = Date.now();

    await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLES.PATIENTS,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );

    // Buscar paciente atualizado
    const updated = await dynamoDB.send(
      new GetCommand({
        TableName: TABLES.PATIENTS,
        Key: { id },
      })
    );

    // Subscrever responsável no SNS
    if (updated.Item && updated.Item.contatoEmergencia) {
      await subscribeResponsavelSNS({
        email: updated.Item.contatoEmergencia.email,
        telefone: updated.Item.contatoEmergencia.telefone
      });
    }

    res.json(updated.Item);
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    res.status(500).json({ message: 'Erro ao atualizar paciente' });
  }
});

// Deletar paciente
router.delete(
  '/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Verificar se paciente existe e pertence ao usuário
      const existing = await dynamoDB.send(
        new GetCommand({
          TableName: TABLES.PATIENTS,
          Key: { id },
        })
      );

      if (!existing.Item) {
        res.status(404).json({ message: 'Paciente não encontrado' });
        return;
      }

      // Verificar se o paciente pertence ao usuário autenticado
      if (existing.Item.userId !== req.userId) {
        res.status(403).json({ message: 'Você não tem permissão para deletar este paciente' });
        return;
      }

      await dynamoDB.send(
        new DeleteCommand({
          TableName: TABLES.PATIENTS,
          Key: { id },
        })
      );

      res.json({ message: 'Paciente deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar paciente:', error);
      res.status(500).json({ message: 'Erro ao deletar paciente' });
    }
  }
);

// Vincular dispositivo ao paciente
router.post(
  '/:id/device',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { deviceId } = req.body;

      if (!deviceId) {
        res.status(400).json({ message: 'deviceId é obrigatório' });
        return;
      }

      await dynamoDB.send(
        new UpdateCommand({
          TableName: TABLES.PATIENTS,
          Key: { id },
          UpdateExpression: 'SET deviceId = :deviceId, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':deviceId': deviceId,
            ':updatedAt': Date.now(),
          },
        })
      );

      res.json({ message: 'Dispositivo vinculado com sucesso' });
    } catch (error) {
      console.error('Erro ao vincular dispositivo:', error);
      res.status(500).json({ message: 'Erro ao vincular dispositivo' });
    }
  }
);

export default router;
