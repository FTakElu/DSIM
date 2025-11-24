import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import alarmsRoutes from './routes/alarms';
import authRoutes from './routes/auth';
import historicoRoutes from './routes/historico';
import pacientesRoutes from './routes/pacientes';
import { initializeWebSocket } from './websocket';

dotenv.config();

// Debug AWS credentials
console.log('🔑 AWS Credentials Check:');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'PRESENT' : 'MISSING');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'PRESENT' : 'MISSING');
console.log('AWS_SESSION_TOKEN:', process.env.AWS_SESSION_TOKEN ? 'PRESENT' : 'MISSING');

const app = express();
const PORT = process.env.PORT || 9999;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://main.d2cq9un5umdfmy.amplifyapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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

// Criar servidor HTTP
const httpServer = createServer(app);

// Inicializar WebSocket
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://main.d2cq9un5umdfmy.amplifyapp.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

initializeWebSocket(io);

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP rodando na porta ${PORT}`);
  console.log(`🔌 WebSocket disponível na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
export { io };

