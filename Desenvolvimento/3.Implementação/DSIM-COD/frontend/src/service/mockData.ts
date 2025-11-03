import { Pacientes } from '../Types/PacientesType';

// --- TIPO DE USUÁRIO  ---
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  cargo: 'ADMINISTRADOR';
}

// --- "BANCO DE DADOS" EM MEMÓRIA ---
let mockUsers: Usuario[] = [];
let mockPacientes: Pacientes[] = [];

// --- FUNÇÕES DE USUÁRIO ---
export const findUserByEmail = (email?: string): Usuario | undefined => {
  return mockUsers.find(u => u.email === email);
};

export const saveUser = (data: any): Usuario => {
  const novoUsuario: Usuario = {
    id: `user-${Date.now()}`,
    nome: data.nome,
    email: data.email,
    senha: data.senha,
    cargo: 'ADMINISTRADOR', // Cargo fixo 
  };

  mockUsers.push(novoUsuario);
  console.log('[MOCK DB] Usuário salvo:', novoUsuario);
  console.log('[MOCK DB] Todos usuários:', mockUsers);
  return novoUsuario;
};

// --- FUNÇÕES DE PACIENTE ---
export const findAllPacientes = (): Pacientes[] => {
  console.log('[MOCK DB] Buscando todos os pacientes...');
  return mockPacientes;
};

export const findPacienteById = (id: string): Pacientes | undefined => {
  console.log(`[MOCK DB] Buscando paciente por ID: ${id}`);
  return mockPacientes.find(p => p.id === id);
};

export const savePaciente = (data: any): Pacientes => {
  const novoPaciente: Pacientes = {
    ...data, 
    id: `paciente-${Date.now()}`, 
  };
  mockPacientes.push(novoPaciente);
  console.log('[MOCK DB] Paciente salvo:', novoPaciente);
  return novoPaciente;
};


// --- DEFINIÇÃO DE TIPO DE ALARME ---
export interface AlarmeConfig {
  pacienteId: string;
  batimentos_min: number;
  batimentos_max: number;
  oxigenio_min: number;
  temperatura_max: number;
}

// --- "BANCO DE DADOS" DE ALARMES ---
const mockAlarmes = new Map<string, AlarmeConfig>();

// --- FUNÇÕES DE ALARME ---
export const saveAlarme = (pacienteId: string, config: Omit<AlarmeConfig, 'pacienteId'>): AlarmeConfig => {
  const novoAlarme: AlarmeConfig = { pacienteId, ...config };
  mockAlarmes.set(pacienteId, novoAlarme);
  console.log(`[MOCK DB] Alarme salvo para ${pacienteId}:`, novoAlarme);
  return novoAlarme;
};

export const findAlarmeByPacienteId = (pacienteId: string): AlarmeConfig | null => {
  const alarme = mockAlarmes.get(pacienteId);
  if (alarme) {
    console.log(`[MOCK DB] Alarme encontrado para ${pacienteId}`, alarme);
    return alarme;
  }
  console.log(`[MOCK DB] Nenhum alarme personalizado para ${pacienteId}`);
  return null; 
};