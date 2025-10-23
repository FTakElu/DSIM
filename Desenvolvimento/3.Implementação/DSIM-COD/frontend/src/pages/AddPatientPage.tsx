import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pacientes, Vital } from '../Types/PacientesType'; 
import styles from './AddPatientPage.module.css';

/*
  AddPatientPage.tsx: Página de formulário para o cadastro de novos pacientes.
  É responsável por coletar todas as informações necessárias, gerenciar o estado
  dos dados do formulário (incluindo o upload de imagem) e, ao submeter,
  envia o novo paciente para ser adicionado ao estado global no App.tsx.
*/

interface PatientFormData {
  nome: string;
  dataNascimento: string;
  genero: string;
  relacionamento: string;
  telefone: string;
  imageUrl: string;
  contatoEmergencia: { nome: string; telefone: string; email: string; instagram: string; };
  informacaoMedica: {
    tipoSangue: string;
    Deficiencia: string;
    ProblemaEspecifico: string[];
  };
  vitals: {
    oxegenio: Vital;
    temperatura: Vital;
    batimentos: Vital;
  };
}

interface AddPatientPageProps {
  onAddPatient: (patient: Omit<Pacientes, 'id'>) => void;
}

const specificProblemsOptions = ["Diabetes", "Hipertensão", "Asma", "Artrite", "Colesterol Alto"];

const AddPatientPage: React.FC<AddPatientPageProps> = ({ onAddPatient }) => {
  const navigate = useNavigate();

  const initialFormData: PatientFormData = {
    nome: '',
    dataNascimento: '',
    genero: '',
    relacionamento: '',
    telefone: '',
    imageUrl: '',
    contatoEmergencia: { nome: '', telefone: '', email: '', instagram: '' },
    informacaoMedica: {
      tipoSangue: '',
      Deficiencia: '',
      ProblemaEspecifico: [],
    },
    vitals: {
      oxegenio: { value: 98, status: 'stable' },
      temperatura: { value: 36.5, status: 'stable' },
      batimentos: { value: 80, status: 'stable' },
    },
  };
  
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.') as [keyof typeof formData, string];
      setFormData(prev => {
        const parentObject = prev[parentKey];
        if (typeof parentObject === 'object' && parentObject !== null) {
          return {
            ...prev,
            [parentKey]: { ...(parentObject as object), [childKey]: value },
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentProblems = prev.informacaoMedica.ProblemaEspecifico;
      const newProblems = checked
        ? [...currentProblems, value]
        : currentProblems.filter(p => p !== value);
      return { ...prev, informacaoMedica: { ...prev.informacaoMedica, ProblemaEspecifico: newProblems } };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const patientDataToSubmit: Omit<Pacientes, 'id'> = {
      nome: formData.nome,
      genero: formData.genero,
      telefone: formData.telefone,
      relacionamento: formData.relacionamento,
      imageUrl: formData.imageUrl,
      dataNascimento: formData.dataNascimento,
      contatoEmergencial: formData.contatoEmergencia,
      vitals: formData.vitals,
      informacaoMedica: {
        tipoSangue: formData.informacaoMedica.tipoSangue,
        Deficiencia: formData.informacaoMedica.Deficiencia,
        ProblemaEspecifico: formData.informacaoMedica.ProblemaEspecifico.join(', ') || 'Nenhum',
      },
    };

    onAddPatient(patientDataToSubmit);
    navigate('/pacientes');
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Cadastrar Novo Paciente</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 4. ATUALIZAR OS 'name' DOS INPUTS */}
        <fieldset className={styles.photoFieldset}>
            {formData.imageUrl && <img src={formData.imageUrl} alt="Pré-visualização do perfil" className={styles.avatarPreview}/>}
            <label htmlFor="photo-upload" className={styles.uploadButton}>Escolher Foto</label>
            <input id="photo-upload" type="file" accept="image/*" onChange={handleImageChange} style={{display: 'none'}}/>
        </fieldset>
        <fieldset>
          <legend>Informações Pessoais</legend>
          <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome Completo" required />
          
          <label htmlFor='dataNascimento'>Data de Nascimento do paciente:</label>
          <input id="dataNascimento" name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} required />
          <select name="genero" value={formData.genero} onChange={handleChange} required>
            <option value="">Selecione o Gênero</option><option value="Homem">Homem</option><option value="Mulher">Mulher</option>
          </select>
          <select name="relacionamento" value={formData.relacionamento} onChange={handleChange} required>
            <option value="">Estado Civil</option><option value="Solteiro(a)">Solteiro(a)</option><option value="Casado(a)">Casado(a)</option><option value="Viúvo(a)">Viúvo(a)</option>
          </select>
          <input name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" required />
        </fieldset>
        <fieldset>
          <legend>Contato de Emergência</legend>
          <input name="contatoEmergencia.nome" value={formData.contatoEmergencia.nome} onChange={handleChange} placeholder="Nome do Contato" required />
          <input name="contatoEmergencia.telefone" value={formData.contatoEmergencia.telefone} onChange={handleChange} placeholder="Telefone do Contato" required />
          <input name="contatoEmergencia.email" type="email" value={formData.contatoEmergencia.email} onChange={handleChange} placeholder="Email do Contato" required />
          <input name="contatoEmergencia.instagram" value={formData.contatoEmergencia.instagram} onChange={handleChange} placeholder="Instagram do Contato" />
        </fieldset>
        <fieldset>
          <legend>Ficha Médica</legend>
          <select name="informacaoMedica.tipoSangue" value={formData.informacaoMedica.tipoSangue} onChange={handleChange} required>
            <option value="">Tipo Sanguíneo</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
          </select>
          <input name="informacaoMedica.Deficiencia" value={formData.informacaoMedica.Deficiencia} onChange={handleChange} placeholder="Possui alguma deficiência?" />
          <div className={styles.checkboxGroup}>
            <span>Problemas Específicos (selecione um ou mais):</span>
            <div className={styles.checkboxOptions}>
              {specificProblemsOptions.map(problem => (
                <div key={problem} className={styles.checkboxItem}>
                  <input type="checkbox" id={problem} value={problem} onChange={handleCheckboxChange} />
                  <label htmlFor={problem}>{problem}</label>
                </div>
              ))}
            </div>
          </div>
        </fieldset>
        <button type="submit" className={styles.submitButton}>Cadastrar Paciente</button>
      </form>
    </div>
  );
};

export default AddPatientPage;