import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:9999';

interface VitalUpdate {
  patientId: string;
  patientName: string;
  deviceId: string;
  temperatura?: number;
  frequencia_cardiaca?: number;
  saturacao_oxigenio?: number;
  bateria?: number;
  status?: string;
  timestamp: number;
}

interface Alert {
  type: 'panic' | 'fall';
  patientId: string;
  patientName: string;
  message: string;
  timestamp?: number;
}

interface DeviceStatus {
  patientId: string;
  status: 'ligado' | 'desligado' | 'offline';
  timestamp: number;
}

interface UseWebSocketOptions {
  onVitalUpdate?: (data: VitalUpdate) => void;
  onAlert?: (alert: Alert) => void;
  onDeviceStatus?: (status: DeviceStatus) => void;
  autoConnect?: boolean;
  subscribeToAllPatients?: boolean;
  patientIds?: string[];
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onVitalUpdate,
    onAlert,
    onDeviceStatus,
    autoConnect = true,
    subscribeToAllPatients = true,
    patientIds = [],
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<VitalUpdate | null>(null);
  const [lastAlert, setLastAlert] = useState<Alert | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    // Criar conexão Socket.io usando apenas polling (HTTPS compatível)
    const socket = io(WS_URL, {
      transports: ['polling'], // Apenas polling para compatibilidade HTTPS
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Event listeners
    socket.on('connect', () => {
      console.log('🔌 WebSocket conectado');
      setIsConnected(true);

      // Inscrever-se nos pacientes desejados
      if (subscribeToAllPatients) {
        socket.emit('subscribe-all-patients');
      }

      patientIds.forEach((patientId) => {
        socket.emit('subscribe-patient', patientId);
      });
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket desconectado');
      setIsConnected(false);
    });

    socket.on('vital-update', (data: VitalUpdate) => {
      console.log('📊 Atualização de sinais vitais:', data);
      setLastUpdate(data);
      onVitalUpdate?.(data);
    });

    socket.on('alert', (alert: Alert) => {
      console.log('🚨 Alerta recebido:', alert);
      setLastAlert(alert);
      onAlert?.(alert);
    });

    socket.on('device-status', (status: DeviceStatus) => {
      console.log('📟 Status do dispositivo:', status);
      onDeviceStatus?.(status);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error);
    });

    // Cleanup
    return () => {
      console.log('🔌 Fechando conexão WebSocket');
      socket.disconnect();
    };
  }, [autoConnect, subscribeToAllPatients, patientIds.join(',')]);

  // Métodos para controle manual
  const subscribeToPatient = (patientId: string) => {
    socketRef.current?.emit('subscribe-patient', patientId);
  };

  const unsubscribeFromPatient = (patientId: string) => {
    socketRef.current?.emit('unsubscribe-patient', patientId);
  };

  const subscribeToAll = () => {
    socketRef.current?.emit('subscribe-all-patients');
  };

  const disconnect = () => {
    socketRef.current?.disconnect();
  };

  const reconnect = () => {
    socketRef.current?.connect();
  };

  return {
    isConnected,
    lastUpdate,
    lastAlert,
    subscribeToPatient,
    unsubscribeFromPatient,
    subscribeToAll,
    disconnect,
    reconnect,
    socket: socketRef.current,
  };
}
