import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';

dotenv.config();

const PORT = process.env.WS_PORT || 8080;

// Criar servidor HTTP
const server = createServer();

// Criar WebSocket Server
const wss = new WebSocketServer({ server });

// Armazenar conexões ativas
const connections = new Map<string, WebSocket>();

wss.on('connection', (ws: WebSocket, req) => {
  const clientId = req.headers['sec-websocket-key'] || Math.random().toString();
  
  console.log(`Cliente conectado: ${clientId}`);
  connections.set(clientId.toString(), ws);

  // Enviar mensagem de boas-vindas
  ws.send(
    JSON.stringify({
      type: 'connection',
      message: 'Conectado ao servidor de alertas DSIM',
      timestamp: Date.now(),
    })
  );

  // Receber mensagens do cliente
  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Mensagem recebida:', message);

      // Aqui você pode processar mensagens específicas
      // Por exemplo, registrar o pacienteId do cliente
      if (message.type === 'register' && message.pacienteId) {
        connections.set(message.pacienteId, ws);
        ws.send(
          JSON.stringify({
            type: 'registered',
            pacienteId: message.pacienteId,
            timestamp: Date.now(),
          })
        );
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });

  // Lidar com desconexão
  ws.on('close', () => {
    console.log(`Cliente desconectado: ${clientId}`);
    connections.delete(clientId.toString());
  });

  ws.on('error', (error) => {
    console.error(`Erro WebSocket:`, error);
  });
});

// Função para enviar alerta para um paciente específico
export function sendAlert(pacienteId: string, alert: any) {
  const ws = connections.get(pacienteId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(alert));
    return true;
  }
  return false;
}

// Função para broadcast de alertas
export function broadcastAlert(alert: any) {
  let sent = 0;
  connections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(alert));
      sent++;
    }
  });
  return sent;
}

// Iniciar servidor WebSocket
server.listen(PORT, () => {
  console.log(`🔌 WebSocket Server rodando na porta ${PORT}`);
});

export { server, wss };

