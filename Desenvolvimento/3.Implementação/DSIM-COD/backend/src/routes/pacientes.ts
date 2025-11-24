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
import { AuthRequest, Patient } from '../types';
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

// Todas as rotas de pacientes requerem autenticação
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
    res.json(patients);
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
    // Lista de todos os dispositivos IoT cadastrados
    const allDevices = ['Pulseira_DSIM', 'Pulseira_02', 'Pulseira_03'];
    
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
