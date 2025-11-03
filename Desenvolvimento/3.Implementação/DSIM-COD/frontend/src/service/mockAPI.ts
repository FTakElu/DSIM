import MockAdapter from 'axios-mock-adapter';
import apiClient from './api';
import * as db from './mockData'; 
import { Pacientes } from '../Types/PacientesType';



console.log("--- MODO DE SIMULAÇÃO (MOCK API) ATIVADO ---");

const mock = new MockAdapter(apiClient, { delayResponse: 500 }); 

// --- ROTAS DE AUTENTICAÇÃO (Login) ---
mock.onPost('/api/auth/login').reply(config => {
  console.log('MOCK: /api/auth/login', config.data);
  const { email, senha } = JSON.parse(config.data);
  const usuario = db.findUserByEmail(email);

  if (usuario && usuario.senha === senha) {
    return [200, {
      message: "Login (mock) com sucesso!",
      token: "fake-jwt-token-from-mock-adapter",
      role: usuario.cargo,
    }];
  } else {
    return [401, { message: "Credenciais inválidas (mock)" }];
  }
});

mock.onPost('/api/auth/register').reply(config => {
  console.log('MOCK: /api/auth/register', config.data);
  const data = JSON.parse(config.data);
  if (db.findUserByEmail(data.email)) {
    return [400, { message: "Email já cadastrado (mock)" }];
  }
  db.saveUser(data);
  return [201, { message: "Usuário registrado com sucesso (mock)" }];
});

// --- ROTAS DE PACIENTES  ---
mock.onGet('/api/pacientes').reply(() => {
  console.log('MOCK: /api/pacientes (GET)');
  const pacientes = db.findAllPacientes();
  
  return [200, pacientes];
});

mock.onPost('/api/pacientes').reply(config => {
  console.log('MOCK: /api/pacientes (POST)', config.data);
  const data = JSON.parse(config.data);
  const novoPaciente = db.savePaciente(data);
  return [201, novoPaciente];
});

mock.onGet(/\/api\/pacientes\/.+/).reply(config => {
  console.log('MOCK: /api/pacientes/:id (GET)', config.url);
  const id = config.url?.split('/').pop() || '';
  
  
  const paciente = db.findPacienteById(id);

  if (paciente) {

    return [200, paciente];
  } else {
    return [404, { message: "Paciente não encontrado (mock)" }];
  }
});

// --- ROTA DE ALARMES ---
mock.onPost(/\/api\/alarms\/.+/).reply(config => {
  const pacienteId = config.url?.split('/').pop() || '';
  const data = JSON.parse(config.data);
  console.log(`MOCK: /api/alarms/${pacienteId} (POST)`, data);
  
   db.saveAlarme(pacienteId, data);
  
  return [200, { message: 'Alarme salvo (simulação)' }];
});

mock.onGet(/\/api\/alarms\/.+/).reply(config => {
  const pacienteId = config.url?.split('/').pop() || '';
  console.log(`MOCK: /api/alarms/${pacienteId} (GET)`);
  
  const alarmeConfig = db.findAlarmeByPacienteId(pacienteId);
  
  if (alarmeConfig) {
    return [200, alarmeConfig];
  } else {
    return [404, { message: "Nenhum alarme configurado (mock)" }];
  }
});