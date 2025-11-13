export interface User {
  userId: string;
  nome: string;
  email: string;
  senha: string;
  role: 'admin' | 'medico' | 'enfermeiro';
  createdAt: number;
}

export interface Patient {
  id: string;
  deviceId?: string;
  nome: string;
  imageUrl: string;
  dataNascimento: string;
  genero: string;
  relacionamento: string;
  telefone: string;
  contatoEmergencia: {
    nome: string;
    telefone: string;
    email: string;
    instagram: string;
  };
  informacaoMedica: {
    tipoSangue: string;
    Deficiencia: string;
    ProblemaEspecifico: string;
  };
  vitals: {
    oxigenio: Vital;
    temperatura: Vital;
    batimentos: Vital;
  };
  createdAt: number;
  updatedAt: number;
}

export type VitalStatus = 'stable' | 'warning' | 'danger';

export interface Vital {
  value: number | string;
  status: VitalStatus;
}

export interface SensorData {
  deviceId: string;
  timestamp: number;
  batimentos: number;
  oxigenio: number;
  temperatura: number;
  escoreMEWS?: number;
  statusMEWS?: VitalStatus;
}

export interface AlarmConfig {
  pacienteId: string;
  batimentos_min: number;
  batimentos_max: number;
  oxigenio_min: number;
  temperatura_max: number;
  updatedAt: number;
}

import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}
