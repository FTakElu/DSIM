import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../service/api';
import { Pacientes, Vital } from '../Types/PacientesType';
import styles from './AddPatientPage.module.css'; // Reusa os mesmos estilos

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
    parentesco: string;
  };
  informacaoMedica: {
    tipoSangue: string;
    possuiDeficiencia: string;
    qualDeficiencia: string;
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

const EditPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
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

  // Buscar dados do paciente
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/pacientes/${id}`);
        const patient: Pacientes = response.data;
        
        // Preencher o formulário com os dados existentes
        setFormData({
          nome: patient.nome || '',
          dataNascimento: patient.dataNascimento || '',
          genero: patient.genero || '',
          relacionamento: patient.relacionamento || '',
          telefone: patient.telefone || '',
          imageUrl: patient.imageUrl || '',
          deviceId: patient.deviceId || '',
          contatoEmergencia: {
            nome: patient.contatoEmergencia?.nome || '',
            telefone: patient.contatoEmergencia?.telefone || '',
            email: patient.contatoEmergencia?.email || '',
            parentesco: patient.contatoEmergencia?.parentesco || '',
          },
          informacaoMedica: {
            tipoSangue: patient.informacaoMedica?.tipoSangue || '',
            possuiDeficiencia: patient.informacaoMedica?.possuiDeficiencia || 'Não',
            qualDeficiencia: patient.informacaoMedica?.qualDeficiencia || '',
            ProblemaEspecifico: typeof patient.informacaoMedica?.ProblemaEspecifico === 'string' 
              ? patient.informacaoMedica.ProblemaEspecifico.split(',').map(s => s.trim())
              : (patient.informacaoMedica?.ProblemaEspecifico || []),
          },
          vitals: patient.vitals || {
            oxigenio: { value: 98, status: 'stable' },
            temperatura: { value: 36.5, status: 'stable' },
            batimentos: { value: 80, status: 'stable' },
          },
        });
      } catch (e: any) {
        console.error('Erro ao buscar paciente:', e);
        setError(e.response?.data?.message || 'Erro ao carregar dados do paciente');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchPatient();
  }, [id]);

  // Buscar dispositivos disponíveis
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await api.get('/api/pacientes/devices/available');
        // Usar todos os dispositivos para permitir reatribuição
        setAvailableDevices(response.data.all || ['Pulseira_DSIM', 'Pulseira_02', 'Pulseira_03']);
      } catch (e) {
        console.error('Erro ao buscar dispositivos:', e);
        // Fallback para lista hardcoded
        setAvailableDevices(['Pulseira_DSIM', 'Pulseira_02', 'Pulseira_03']);
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
      const current = prev.informacaoMedica.ProblemaEspecifico;
      return {
        ...prev,
        informacaoMedica: {
          ...prev.informacaoMedica,
          ProblemaEspecifico: checked ? [...current, value] : current.filter(p => p !== value),
        },
      };
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
    setError(null);

    try {
      setLoading(true);
      
      const patientDataToSubmit: Partial<Pacientes> = {
        nome: formData.nome,
        dataNascimento: formData.dataNascimento,
        genero: formData.genero,
        relacionamento: formData.relacionamento,
        telefone: formData.telefone,
        imageUrl: formData.imageUrl,
        deviceId: formData.deviceId,
        contatoEmergencia: {
          nome: formData.contatoEmergencia.nome,
          telefone: formData.contatoEmergencia.telefone,
          email: formData.contatoEmergencia.email,
          parentesco: formData.contatoEmergencia.parentesco,
        },
        informacaoMedica: {
          tipoSangue: formData.informacaoMedica.tipoSangue,
          possuiDeficiencia: formData.informacaoMedica.possuiDeficiencia,
          qualDeficiencia: formData.informacaoMedica.qualDeficiencia,
          ProblemaEspecifico: formData.informacaoMedica.ProblemaEspecifico.join(', '),
        },
        vitals: formData.vitals,
      };

      await api.put(`/api/pacientes/${id}`, patientDataToSubmit);
      alert('Paciente atualizado com sucesso!');
      navigate('/pacientes');
    } catch (err: any) {
      console.error('Erro ao atualizar paciente:', err);
      setError(err.response?.data?.message || 'Falha ao atualizar paciente');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.nome) {
    return <div className={styles.loading}>Carregando dados do paciente...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Editar Paciente</h1>
        <button type="button" onClick={() => navigate('/pacientes')} className={styles.cancelButton}>
          Voltar
        </button>
      </header>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <fieldset className={styles.photoFieldset}>
          {formData.imageUrl && <img src={formData.imageUrl} alt="Foto do paciente" className={styles.avatarPreview}/>}
          <label htmlFor="photo-upload" className={styles.uploadButton}>Alterar Foto</label>
          <input id="photo-upload" type="file" accept="image/*" onChange={handleImageChange} style={{display: 'none'}}/>
        </fieldset>

        <fieldset>
          <legend>Dados Pessoais</legend>
          
          <label htmlFor='nome'>Nome Completo:</label>
          <input id="nome" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome Completo" required />
          
          <label htmlFor='dataNascimento'>Data de Nascimento:</label>
          <input id="dataNascimento" name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} required />
          
          <label htmlFor="genero">Gênero:</label>
          <select id="genero" name="genero" value={formData.genero} onChange={handleChange} required>
            <option value="">Selecione o gênero</option>
            <option value="Homem">Homem</option>
            <option value="Mulher">Mulher</option>
          </select>
          
          <label htmlFor="relacionamento">Estado Civil:</label>
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
          <legend>Informação Médica</legend>
          
          <label htmlFor='tipoSangue'>Tipo Sanguíneo:</label>
          <select id="tipoSangue" name="informacaoMedica.tipoSangue" value={formData.informacaoMedica.tipoSangue} onChange={handleChange} required>
            <option value="">Selecione o tipo</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          
          <label htmlFor='possuiDeficiencia'>Possui alguma deficiência?</label>
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
                  <input 
                    type="checkbox" 
                    id={`problem-${problem}`} 
                    value={problem} 
                    checked={formData.informacaoMedica.ProblemaEspecifico.includes(problem)}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor={`problem-${problem}`}>{problem}</label>
                </div>
              ))}
            </div>
          </div>
        </fieldset>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Salvando...' : 'Atualizar Paciente'}
          </button>
          <button type="button" onClick={() => navigate('/pacientes')} className={styles.cancelButton}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPatientPage;
