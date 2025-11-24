
export type VitalStatus = 'stable' | 'warning' | 'danger';

export interface Vital {
  value: number | string;
  status: VitalStatus; 
}

export interface Pacientes {
  id: string; 
  nome: string;
  imageUrl: string;
  dataNascimento: string;
  genero: string;
  relacionamento: string;
  telefone: string;
  deviceId?: string; // ⚠️ ID da pulseira IoT (opcional para retrocompatibilidade)
  escoreMEWS?: number; // Score MEWS calculado pela Lambda
  statusMEWS?: string; // Status: 'baixo', 'moderado', 'alto', 'crítico'
  bateria?: number; // Percentual de bateria da pulseira
  statusDispositivo?: 'online' | 'offline' | 'desligada'; // Status da pulseira
  panico_ativo?: boolean; // Indica se o botão de pânico foi acionado
  queda_detectada?: boolean; // Indica se foi detectada uma queda
  contatoEmergencia: {
    nome: string;
    telefone: string;
    email: string;
    parentesco: string; // ⚠️ Mudado de instagram para parentesco
  };
  informacaoMedica: {
    tipoSangue: string;
    possuiDeficiencia: string; // ⚠️ Mudado: "Sim" ou "Não"
    qualDeficiencia?: string; // ⚠️ Novo: Especifica qual deficiência (se Sim)
    ProblemaEspecifico: string;
  };
  vitals: {
    oxigenio: Vital;
    temperatura: Vital;
    batimentos: Vital;
  };

}