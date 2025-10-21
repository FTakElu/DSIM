

import React from 'react';
import { useParams, Link, data } from 'react-router-dom';
import { Pacientes } from '../Types/PacientesType';
import styles from './DetalhesPacientePage.module.css';
import logoImage from '../assets/logo-dsim.png'; 
import { FaTint, FaThermometerHalf, FaHeartbeat } from 'react-icons/fa';
import HistoricoPaciente  from '../components/Historico/HistoricoPaciente';


/*
  DetalhesPacientePage.tsx: Página de visualização detalhada de um único paciente.
  É uma rota dinâmica que utiliza o ID do paciente presente na URL para encontrar
  e exibir todas as suas informações específicas, como dados pessoais,
  contato de emergência, ficha médica e sinais vitais.
*/

function calIdade(dataNascimento: string): number{

 if(!data) return 0; 

const DataHoje = new Date();
const DataNasci = new  Date(dataNascimento);

let idade = DataHoje.getFullYear() - DataNasci.getFullYear();
const mes = DataHoje.getMonth() - DataNasci.getMonth();

  if(mes<0 || (mes == 0 && DataHoje.getDate() < DataNasci.getDate()))
    {
      idade--;
    }
return idade;
}


const DetailHeader: React.FC = () => (
  <header className={styles.header}>
    <Link to="/pacientes">
      <img src={logoImage} alt="DSIM Logo" className={styles.logoImage} />
    </Link>
  </header>
);

interface PatientDetailPageProps {
  patients: Pacientes[];
}

const DetalhesPacientes: React.FC<PatientDetailPageProps> = ({ patients }) => {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  
  
  const paciente = patients.find(p => p.id === parseInt(pacienteId!));

  if (!paciente) {
    return (
      <div className={styles.containerVazio}>  {/* Adicionei um container vazio para adição de um espaçemento melhor entre o texto e o botão  */} 
        <h1 className={styles.tituloVazio}>Paciente não encontrado.</h1>
        <Link to="/pacientes" className={styles.linkVoltar}>
          Voltar para a lista
        </Link> 
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <DetailHeader />
      <main className={styles.container}>
        
        {/*INFORMAÇÕES DOS PACIENTES */}
        <section className={styles.infoGrid}>
          <div className={styles.mainInfo}>
            <img src={paciente.imageUrl} alt={paciente.nome} className={styles.patientPhoto} />
            <div className={styles.contactInfo}>
              <strong>Contato emergência</strong>
              <p>Celular: {paciente.contatoEmergencial.telefone}</p>
              <p>Gmail: {paciente.contatoEmergencial.email}</p>
              <p>Instagram: {paciente.contatoEmergencial.instagram}</p>
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
            <strong style={{color:"var(--dark-blue)"}}>Ficha médica</strong>
            <p><strong>Sangue:</strong> {paciente.informacaoMedica.tipoSangue}</p>
            <p><strong>Deficiência:</strong> {paciente.informacaoMedica.Deficiencia}</p>
            <p><strong>Problemas específicos:</strong> {paciente.informacaoMedica.ProblemaEspecifico}</p>
          </div>
        </section>

      {/*INFORMAÇÕES DOS sinais vitais */}
        <section className={styles.vitalsSection}>
          <h2>Dados vitais</h2>
          <div className={styles.vitalsGrid}>
            <div className={styles.vitalCard}>
              <p className={styles.vitalValue}>{paciente.vitals.oxegenio.value}%</p>
              <FaTint className={styles.vitalIcon} />
            </div>
            <div className={styles.vitalCard}>
              <p className={styles.vitalValue}>{paciente.vitals.temperatura.value}°</p>
              <FaThermometerHalf className={styles.vitalIcon} />
            </div>
            <div className={styles.vitalCard}>
              <p className={styles.vitalValue}>{paciente.vitals.batimentos.value}bpm</p>
              <FaHeartbeat className={styles.vitalIcon} />
            </div>
          </div>
        </section>


          {/*INFORMAÇÕES Do histórico DO PACIENTE*/}
           <HistoricoPaciente />

      </main>
    </div>
  );
};

export default DetalhesPacientes;