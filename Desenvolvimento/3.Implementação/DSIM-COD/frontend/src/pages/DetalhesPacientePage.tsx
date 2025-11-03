
import React, { useState, useEffect } from 'react'; 
import { useParams, Link } from 'react-router-dom';
import { Pacientes } from '../Types/PacientesType'; 
import styles from './DetalhesPacientePage.module.css';
import logoImage from '../assets/logo-dsim.png';
import { FaTint, FaThermometerHalf, FaHeartbeat } from 'react-icons/fa';
import HistoricoPaciente from '../components/Historico/HistoricoPaciente';
import api from '../service/api'; 
import { AlarmeConfig } from '../service/mockData';
import AlarmesPaciente from '../components/Alarme/AlarmesPaciente';

/*
  DetalhesPacientePage.tsx: Página de visualização detalhada de um único paciente.
  É uma rota dinâmica que utiliza o ID do paciente presente na URL para encontrar
  e exibir todas as suas informações específicas, como dados pessoais,
  contato de emergência, ficha médica e sinais vitais.
*/


function calIdade(dataNascimento: string): number {
  if (!dataNascimento || typeof dataNascimento !== 'string') return 0; 
  try {
    const hoje = new Date();
    const [ano, mes, dia] = dataNascimento.split('-').map(Number);
    const nasc = new Date(ano, mes - 1, dia);
    if (isNaN(nasc.getTime())) return 0;
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mesDiff = hoje.getMonth() - nasc.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return Math.max(0, idade);
  } catch (e) { return 0; }
}

interface DetailHeaderProps { pacienteId: string; }
const DetailHeader: React.FC<DetailHeaderProps> = ({ pacienteId }) => (
  <header className={styles.header}>
    <Link to="/pacientes">
      <img src={logoImage} alt="DSIM Logo" className={styles.logoImage} />
    </Link>
    <Link 
      to={`/pacientes/${pacienteId}/configurar-alarme`} 
      className={styles.configButton}
    >
      Configurar Alarme
    </Link>
    
  </header>
);

const DetalhesPacientePage: React.FC = () => { 
  const { pacienteId } = useParams<{ pacienteId: string }>();

  const [paciente, setPaciente] = useState<Pacientes | null>(null); 
  const [alarmeConfig, setAlarmeConfig] = useState<AlarmeConfig | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);       
  const [error, setError] = useState<string | null>(null);     

 useEffect(() => {
    if (!pacienteId) {  }

    const fetchTudo = async () => {
      setLoading(true);
      setError(null);
      try {
        const pacienteResponse = await api.get(`/api/pacientes/${pacienteId}`);
        if (!pacienteResponse.data) throw new Error('Paciente não encontrado.');
        setPaciente(pacienteResponse.data);

        try {
          const alarmeResponse = await api.get(`/api/alarms/${pacienteId}`);
          setAlarmeConfig(alarmeResponse.data);
        } catch (alarmeError) {
          console.log("Nenhum alarme personalizado encontrado.");
          setAlarmeConfig(null); 
        }

      } catch (e: any) {
        setError(e.response?.data?.message || e.message || "Erro ao buscar dados.");
      } finally {
        setLoading(false); 
      }
    };
    fetchTudo();
  }, [pacienteId]);

  if (loading) {
    return (
      <div className={styles.page}>
         <header className={styles.header}>
            <Link to="/pacientes"><img src={logoImage} alt="DSIM Logo" className={styles.logoImage} /></Link>
         </header>
         <div className={styles.message}>Carregando dados do paciente...</div>
      </div>
    );
  }
  if (error) {
     return (
       <div className={styles.page}>
         <header className={styles.header}>
            <Link to="/pacientes"><img src={logoImage} alt="DSIM Logo" className={styles.logoImage} /></Link>
         </header>
         <div className={styles.containerVazio}>
            <h1 className={styles.tituloVazio}>{error}</h1>
            <Link to="/pacientes" className={styles.linkVoltar}>Voltar para a lista</Link>
         </div>
      </div>
    );
  }
  if (!paciente) return <div>Erro inesperado. Paciente não carregado.</div>; 

  return (
    <div className={styles.page}>
      <DetailHeader pacienteId={pacienteId!} /> 
      <main className={styles.container}>
        <section className={styles.infoGrid}>
           <div className={styles.mainInfo}>
             <img src={paciente.imageUrl || ''} alt={paciente.nome} className={styles.patientPhoto} />
             <div className={styles.contactInfo}>
               <strong>Contato emergência</strong>
               <p>Celular: {paciente.contatoEmergencia?.telefone || 'N/A'}</p> 
               <p>Gmail: {paciente.contatoEmergencia?.email || 'N/A'}</p>
               <p>Instagram: {paciente.contatoEmergencia?.instagram || 'N/A'}</p>
             </div>
           </div>
           <div className={styles.personalDetails}>
             <h1>{paciente.nome}</h1>
             <p className={styles.description}>Descrição paciente</p>
             <p><strong>Idade:</strong> {calIdade(paciente.dataNascimento)} anos</p>
             <p><strong>Gênero:</strong> {paciente.genero}</p>
             <p><strong>Relação:</strong> {paciente.relacionamento}</p>
             <p><strong>Telefone:</strong> {paciente.telefone}</p>
           </div>
           <div className={styles.medicalInfo}>
             <strong style={{ color: "var(--dark-blue)" }}>Ficha médica</strong>
             <p><strong>Sangue:</strong> {paciente.informacaoMedica?.tipoSangue || 'N/A'}</p>
             <p><strong>Deficiência:</strong> {paciente.informacaoMedica?.Deficiencia || 'N/A'}</p>
             <p><strong>Problemas:</strong> {paciente.informacaoMedica?.ProblemaEspecifico || 'N/A'}</p>
           </div>
        </section>

        <section className={styles.vitalsSection}>
           <h2>Dados vitais</h2>
           <div className={styles.vitalsGrid}>
             <div className={styles.vitalCard}>
               <p className={styles.vitalValue}>{paciente.vitals?.oxigenio?.value || '--'}%</p>
               <FaTint className={styles.vitalIcon} />
             </div>
             <div className={styles.vitalCard}>
               <p className={styles.vitalValue}>{paciente.vitals?.temperatura?.value || '--'}°</p>
               <FaThermometerHalf className={styles.vitalIcon} />
             </div>
             <div className={styles.vitalCard}>
               <p className={styles.vitalValue}>{paciente.vitals?.batimentos?.value || '--'}bpm</p>
               <FaHeartbeat className={styles.vitalIcon} />
             </div>
           </div>
        </section>
       
       {alarmeConfig && (
          <AlarmesPaciente config={alarmeConfig} pacienteId={pacienteId!} />
        )}

        <HistoricoPaciente />
      </main>
    </div>
  );
};

export default DetalhesPacientePage;
