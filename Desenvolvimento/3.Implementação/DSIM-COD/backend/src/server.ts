import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import alarmsRoutes from './routes/alarms';
import authRoutes from './routes/auth';
import historicoRoutes from './routes/historico';
import pacientesRoutes from './routes/pacientes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9999;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Para suportar imagens em base64

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/alarms', alarmsRoutes);
app.use('/api/historico', historicoRoutes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
