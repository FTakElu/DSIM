import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
// e indo para o localhost 
const wss = new WebSocketServer({ server });
const clients = new Set(); 

wss.on('connection', (ws) => {
  console.log('Novo cliente WebSocket conectado');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('Erro no WebSocket:', error);
  });
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/temperatura', (req, res) => {
  const { temperatura } = req.body;

  if (typeof temperatura !== 'number') {
    return res.status(400).json({ error: "Temperatura inválida" });
  }

  console.log(`Temperatura recebida: ${temperatura}°C`);

  const payload = JSON.stringify({
    type: 'temperatura',
    data: temperatura,
    timestamp: new Date().toISOString()
  });

  clients.forEach(client => {
    if (client.readyState === client.OPEN) { 
      client.send(payload);
    }
  });

  res.status(200).json({ success: true, temperatura });
});
//Recomendo voce fazer as pastas com o mesmo nome que a minha,  mass se você não quiser é só mudar o nome aqui!
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});