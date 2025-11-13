import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Response, Router } from 'express';
import { dynamoDB, TABLES } from '../config/aws';
import { authMiddleware } from '../middleware/auth';
import { AlarmConfig, AuthRequest } from '../types';

const router = Router();

// Todas as rotas de alarmes requerem autenticação
router.use(authMiddleware);

// Valores padrão para alarmes
const DEFAULT_ALARM_CONFIG = {
  batimentos_min: 50,
  batimentos_max: 110,
  oxigenio_min: 92,
  temperatura_max: 38.0,
};

// Obter configuração de alarme de um paciente
router.get(
  '/:pacienteId',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { pacienteId } = req.params;

      const result = await dynamoDB.send(
        new GetCommand({
          TableName: TABLES.ALARMS,
          Key: { pacienteId },
        })
      );

      if (!result.Item) {
        // Retornar valores padrão se não houver configuração personalizada
        res.json({
          pacienteId,
          ...DEFAULT_ALARM_CONFIG,
          updatedAt: Date.now(),
        });
        return;
      }

      res.json(result.Item);
    } catch (error) {
      console.error('Erro ao buscar configuração de alarme:', error);
      res
        .status(500)
        .json({ message: 'Erro ao buscar configuração de alarme' });
    }
  }
);

// Criar ou atualizar configuração de alarme
router.post(
  '/:pacienteId',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { pacienteId } = req.params;
      const { batimentos_min, batimentos_max, oxigenio_min, temperatura_max } =
        req.body;

      // Validação
      if (
        batimentos_min == null ||
        batimentos_max == null ||
        oxigenio_min == null ||
        temperatura_max == null
      ) {
        res.status(400).json({
          message: 'Todos os parâmetros de alarme são obrigatórios',
        });
        return;
      }

      if (batimentos_min >= batimentos_max) {
        res.status(400).json({
          message:
            'batimentos_min deve ser menor que batimentos_max',
        });
        return;
      }

      const alarmConfig: AlarmConfig = {
        pacienteId,
        batimentos_min,
        batimentos_max,
        oxigenio_min,
        temperatura_max,
        updatedAt: Date.now(),
      };

      await dynamoDB.send(
        new PutCommand({
          TableName: TABLES.ALARMS,
          Item: alarmConfig,
        })
      );

      res.json({
        message: 'Configuração de alarme salva com sucesso',
        config: alarmConfig,
      });
    } catch (error) {
      console.error('Erro ao salvar configuração de alarme:', error);
      res.status(500).json({ message: 'Erro ao salvar configuração de alarme' });
    }
  }
);

export default router;
