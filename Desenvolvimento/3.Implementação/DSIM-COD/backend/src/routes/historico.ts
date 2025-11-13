import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Response, Router } from 'express';
import { dynamoDB, TABLES } from '../config/aws';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest, SensorData } from '../types';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Buscar histórico de sinais vitais de um paciente
router.get(
  '/:pacienteId',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { pacienteId } = req.params;
      const { periodo = 'dia' } = req.query;

      // Primeiro, buscar o deviceId do paciente
      const patientResult = await dynamoDB.send(
        new GetCommand({
          TableName: TABLES.PATIENTS,
          Key: { id: pacienteId },
        })
      );

      if (!patientResult.Item || !patientResult.Item.deviceId) {
        res.status(404).json({
          message: 'Paciente não encontrado ou sem dispositivo vinculado',
        });
        return;
      }

      const deviceId = patientResult.Item.deviceId;

      // Calcular o timestamp de início baseado no período
      const now = Date.now();
      let startTimestamp: number;

      switch (periodo) {
        case 'dia':
          startTimestamp = now - 24 * 60 * 60 * 1000; // 24 horas
          break;
        case 'mes':
          startTimestamp = now - 30 * 24 * 60 * 60 * 1000; // 30 dias
          break;
        case 'ano':
          startTimestamp = now - 365 * 24 * 60 * 60 * 1000; // 365 dias
          break;
        default:
          startTimestamp = now - 24 * 60 * 60 * 1000;
      }

      // Buscar dados do sensor
      const result = await dynamoDB.send(
        new QueryCommand({
          TableName: TABLES.SENSOR_DATA,
          KeyConditionExpression:
            'deviceId = :deviceId AND #ts >= :startTimestamp',
          ExpressionAttributeNames: {
            '#ts': 'timestamp',
          },
          ExpressionAttributeValues: {
            ':deviceId': deviceId,
            ':startTimestamp': startTimestamp,
          },
          ScanIndexForward: true, // Ordem crescente (mais antigo primeiro)
        })
      );

      const sensorData = (result.Items || []) as SensorData[];

      res.json({
        pacienteId,
        deviceId,
        periodo,
        startTimestamp,
        endTimestamp: now,
        count: sensorData.length,
        data: sensorData,
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({ message: 'Erro ao buscar histórico' });
    }
  }
);

// Buscar dados mais recentes de um paciente
router.get(
  '/:pacienteId/latest',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { pacienteId } = req.params;

      // Buscar deviceId do paciente
      const patientResult = await dynamoDB.send(
        new GetCommand({
          TableName: TABLES.PATIENTS,
          Key: { id: pacienteId },
        })
      );

      if (!patientResult.Item || !patientResult.Item.deviceId) {
        res.status(404).json({
          message: 'Paciente não encontrado ou sem dispositivo vinculado',
        });
        return;
      }

      const deviceId = patientResult.Item.deviceId;

      // Buscar último dado
      const result = await dynamoDB.send(
        new QueryCommand({
          TableName: TABLES.SENSOR_DATA,
          KeyConditionExpression: 'deviceId = :deviceId',
          ExpressionAttributeValues: {
            ':deviceId': deviceId,
          },
          ScanIndexForward: false, // Ordem decrescente (mais recente primeiro)
          Limit: 1,
        })
      );

      if (!result.Items || result.Items.length === 0) {
        res.status(404).json({
          message: 'Nenhum dado encontrado para este paciente',
        });
        return;
      }

      res.json(result.Items[0]);
    } catch (error) {
      console.error('Erro ao buscar dados mais recentes:', error);
      res.status(500).json({ message: 'Erro ao buscar dados mais recentes' });
    }
  }
);

export default router;
