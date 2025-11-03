
export type VitalStatus = 'stable' | 'warning' | 'danger';

export interface Vital {
  value: number | string;
<<<<<<< HEAD
  status: VitalStatus; 
}

export interface Pacientes {
  id: string; 
=======
  status: VitalStatus;
}

export interface Pacientes {
  id: number;
>>>>>>> 6cb3298850116a63aa43f5d8d8b2feabfc52c032
  nome: string;
  imageUrl: string;
  dataNascimento: string;
  genero: string;
  relacionamento: string;
  telefone: string;
<<<<<<< HEAD
  contatoEmergencia: {
=======
  contatoEmergencial: {
>>>>>>> 6cb3298850116a63aa43f5d8d8b2feabfc52c032
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
<<<<<<< HEAD
    oxigenio: Vital;
    temperatura: Vital;
    batimentos: Vital;
  };

=======
    oxegenio: Vital;
    temperatura: Vital;
    batimentos: Vital;
  };
>>>>>>> 6cb3298850116a63aa43f5d8d8b2feabfc52c032
}