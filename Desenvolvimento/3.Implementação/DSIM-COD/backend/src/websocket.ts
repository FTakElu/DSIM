import { Server, Socket } from 'socket.io';

let io: Server;

export function initializeWebSocket(socketServer: Server) {
  io = socketServer;

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Cliente WebSocket conectado: ${socket.id}`);

    // Cliente se inscreve para receber atualizações de um paciente específico
    socket.on('subscribe-patient', (patientId: string) => {
      socket.join(`patient-${patientId}`);
      console.log(`📡 Cliente ${socket.id} inscrito no paciente ${patientId}`);
    });

    // Cliente cancela inscrição
    socket.on('unsubscribe-patient', (patientId: string) => {
      socket.leave(`patient-${patientId}`);
      console.log(`📴 Cliente ${socket.id} desinscrito do paciente ${patientId}`);
    });

    // Cliente se inscreve para receber atualizações de todos os pacientes
    socket.on('subscribe-all-patients', () => {
      socket.join('all-patients');
      console.log(`📡 Cliente ${socket.id} inscrito em todos os pacientes`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Cliente WebSocket desconectado: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io não foi inicializado');
  }
  return io;
}

// Enviar atualização de sinais vitais para um paciente específico
export function emitVitalUpdate(patientId: string, data: any) {
  if (io) {
    io.to(`patient-${patientId}`).emit('vital-update', data);
    io.to('all-patients').emit('vital-update', data);
    console.log(`📤 Atualização de sinais vitais enviada para paciente ${patientId}`);
  }
}

// Enviar alerta (pânico, queda, etc.)
export function emitAlert(patientId: string, alertType: string, data: any) {
  if (io) {
    io.to(`patient-${patientId}`).emit('alert', { type: alertType, ...data });
    io.to('all-patients').emit('alert', { type: alertType, ...data });
    console.log(`🚨 Alerta ${alertType} enviado para paciente ${patientId}`);
  }
}

// Enviar atualização de status da pulseira (ligada/desligada/offline)
export function emitDeviceStatus(patientId: string, status: string) {
  if (io) {
    const data = { patientId, status, timestamp: Date.now() };
    io.to(`patient-${patientId}`).emit('device-status', data);
    io.to('all-patients').emit('device-status', data);
    console.log(`📟 Status do dispositivo ${status} enviado para paciente ${patientId}`);
  }
}


