
export type VitalStatus = 'stable' | 'warning' | 'danger';

export interface Vital {
  value: number | string;
  status: VitalStatus;
}

export interface Pacientes {
  id: number;
  nome: string;
  imageUrl: string;
  dataNascimento: string;
  genero: string;
  relacionamento: string;
  telefone: string;
  contatoEmergencial: {
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
    oxegenio: Vital;
    temperatura: Vital;
    batimentos: Vital;
  };
}