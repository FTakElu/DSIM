import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../service/api';
import { Pacientes, Vital } from '../Types/PacientesType';
import styles from './AddPatientPage.module.css';

interface PatientFormData {
  nome: string;
  dataNascimento: string;
  genero: string;
  relacionamento: string;
  telefone: string;
  imageUrl: string;
  deviceId: string;
  contatoEmergencia: { 
    nome: string; 
    telefone: string; 
    email: string; 
    parentesco: string; // ⚠️ Mudado de instagram
  };
  informacaoMedica: {
    tipoSangue: string;
    possuiDeficiencia: string; // ⚠️ "Sim" ou "Não"
    qualDeficiencia: string; // ⚠️ Especifica qual (se Sim)
    ProblemaEspecifico: string[];
  };
  vitals: {
    oxigenio: Vital;
    temperatura: Vital;
    batimentos: Vital;
  };
}

const specificProblemsOptions = ["Diabetes", "Hipertensão", "Asma", "Artrite", "Colesterol Alto"];
const parentescoOptions = ["Pai", "Mãe", "Filho(a)", "Cônjuge", "Irmão(ã)", "Avô(ó)", "Tio(a)", "Primo(a)", "Amigo(a)", "Outro"];

const AddPatientPage: React.FC = () => {
  const navigate = useNavigate();
  
  const initialFormData: PatientFormData = {
    nome: '', dataNascimento: '', genero: '', relacionamento: '', telefone: '', imageUrl: '', deviceId: '',
    contatoEmergencia: { nome: '', telefone: '', email: '', parentesco: '' },
    informacaoMedica: { tipoSangue: '', possuiDeficiencia: 'Não', qualDeficiencia: '', ProblemaEspecifico: [] },
    vitals: {
      oxigenio: { value: 98, status: 'stable' },
      temperatura: { value: 36.5, status: 'stable' },
      batimentos: { value: 80, status: 'stable' },
    },
  };
  
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar pulseiras disponíveis
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await api.get('/api/pacientes/devices/available');
        // Usar todos os dispositivos (não apenas os disponíveis) para permitir reatribuição
        setAvailableDevices(response.data.all || []);
      } catch (e) {
        console.error('Erro ao buscar dispositivos:', e);
        // Se falhar, deixar lista vazia
        setAvailableDevices([]);
      }
    };
    fetchDevices();
  }, []);

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


 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const patientDataToSubmit: Omit<Pacientes, 'id' | 'escoreMEWS' | 'statusMEWS'> = {
      nome: formData.nome,
      genero: formData.genero,
      telefone: formData.telefone,
      relacionamento: formData.relacionamento,
      imageUrl: formData.imageUrl,
      dataNascimento: formData.dataNascimento,
      deviceId: formData.deviceId,
      contatoEmergencia: formData.contatoEmergencia,
      vitals: formData.vitals,
      informacaoMedica: {
        tipoSangue: formData.informacaoMedica.tipoSangue,
        possuiDeficiencia: formData.informacaoMedica.possuiDeficiencia,
        qualDeficiencia: formData.informacaoMedica.qualDeficiencia,
        ProblemaEspecifico: formData.informacaoMedica.ProblemaEspecifico.join(', ') || 'Nenhum',
      },
    };

    try {
   
      await api.post('/api/pacientes', patientDataToSubmit);
    
      navigate('/pacientes');

    } catch (e: any) {
      console.error('Erro ao cadastrar paciente:', e);
      setError(e.response?.data?.message || e.message || 'Falha ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Cadastrar Novo Paciente</h1>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <fieldset className={styles.photoFieldset}>
            {formData.imageUrl && <img src={formData.imageUrl} alt="Pré-visualização do perfil" className={styles.avatarPreview}/>}
            <label htmlFor="photo-upload" className={styles.uploadButton}>Escolher Foto</label>
            <input id="photo-upload" type="file" accept="image/*" onChange={handleImageChange} style={{display: 'none'}}/>
        </fieldset>
        <fieldset>
          <legend>Informações Pessoais</legend>
          
          <label htmlFor='nome'>Nome Completo:</label>
          <input id="nome" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome Completo" required />
          
          <label htmlFor='dataNascimento'>Data de Nascimento:</label>
          <input id="dataNascimento" name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} required />
          
          <label htmlFor='genero'>Gênero:</label>
          <select id="genero" name="genero" value={formData.genero} onChange={handleChange} required>
            <option value="">Selecione o Gênero</option>
            <option value="Homem">Homem</option>
            <option value="Mulher">Mulher</option>
          </select>
          
          <label htmlFor='relacionamento'>Estado Civil:</label>
          <select id="relacionamento" name="relacionamento" value={formData.relacionamento} onChange={handleChange} required>
            <option value="" disabled>Estado Civil</option>
            <option value="Solteiro(a)">Solteiro(a)</option>
            <option value="Casado(a)">Casado(a)</option>
            <option value="Divorciado(a)">Divorciado(a)</option>
            <option value="União Estável">União Estável</option>
            <option value="Viúvo(a)">Viúvo(a)</option>
          </select>
          
          <label htmlFor='telefone'>Telefone:</label>
          <input id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" required />
          
          <label htmlFor='deviceId' style={{marginTop: '16px', fontWeight: 'bold', color: '#2563eb'}}>ID da Pulseira IoT:</label>
          <select 
            id="deviceId" 
            name="deviceId" 
            value={formData.deviceId} 
            onChange={handleChange} 
            required 
            style={{borderColor: '#2563eb', borderWidth: '2px'}}
          >
            <option value="">Selecione uma pulseira</option>
            {availableDevices.map(device => (
              <option key={device} value={device}>{device}</option>
            ))}
          </select>
          <small style={{color: '#6b7280', fontSize: '0.875rem'}}>⚠️ Este ID deve corresponder ao deviceId da pulseira física</small>
        </fieldset>
        <fieldset>
          <legend>Contato de Emergência</legend>
          
          <label htmlFor='contatoNome'>Nome do Contato:</label>
          <input id="contatoNome" name="contatoEmergencia.nome" value={formData.contatoEmergencia.nome} onChange={handleChange} placeholder="Nome do Contato" required />
          
          <label htmlFor='contatoTelefone'>Telefone do Contato:</label>
          <input id="contatoTelefone" name="contatoEmergencia.telefone" value={formData.contatoEmergencia.telefone} onChange={handleChange} placeholder="Telefone do Contato" required />
          
          <label htmlFor='contatoEmail'>Email do Contato:</label>
          <input id="contatoEmail" name="contatoEmergencia.email" type="email" value={formData.contatoEmergencia.email} onChange={handleChange} placeholder="Email do Contato" required />
          
          <label htmlFor='parentesco'>Parentesco:</label>
          <select 
            id="parentesco" 
            name="contatoEmergencia.parentesco" 
            value={formData.contatoEmergencia.parentesco} 
            onChange={handleChange} 
            required
          >
            <option value="">Selecione o parentesco</option>
            {parentescoOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </fieldset>
        <fieldset>
          <legend>Ficha Médica</legend>
          
          <label htmlFor='tipoSangue'>Tipo Sanguíneo:</label>
           <select id="tipoSangue" name="informacaoMedica.tipoSangue" value={formData.informacaoMedica.tipoSangue} onChange={handleChange} required>
            <option value="">Tipo Sanguíneo</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            </select>          <label htmlFor='possuiDeficiencia'>Possui alguma deficiência?</label>
          <select 
            id="possuiDeficiencia" 
            name="informacaoMedica.possuiDeficiencia" 
            value={formData.informacaoMedica.possuiDeficiencia} 
            onChange={handleChange} 
            required
          >
            <option value="Não">Não</option>
            <option value="Sim">Sim</option>
          </select>
          
          {formData.informacaoMedica.possuiDeficiencia === 'Sim' && (
            <input 
              name="informacaoMedica.qualDeficiencia" 
              value={formData.informacaoMedica.qualDeficiencia} 
              onChange={handleChange} 
              placeholder="Qual deficiência?" 
              required 
            />
          )}
          
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
        
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar Paciente'}
          </button>
          <button type="button" onClick={() => navigate('/pacientes')} className={styles.cancelButton}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPatientPage;