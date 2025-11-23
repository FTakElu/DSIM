
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo-dsim.png";
import PatientCard from "../components/PatientCard/PatientCard";
import UserMenu from "../components/UserMenu/UserMenu";
import api from '../service/api';
import { Pacientes } from "../Types/PacientesType";
import styles from "./PainelListaPacientes.module.css";


 /*
  PainelListaPacientes.tsx: Página principal do painel de controle.
  Exibe a lista de todos os pacientes cadastrados em formato de cards.
  Esta página recebe a lista de pacientes do App.tsx e serve
  como ponto central para navegar para os detalhes de um paciente específico
  ou para a página de adicionar um novo paciente.
*/

const PatientListHeader = () => {
  const userName = localStorage.getItem('userName') || 'Usuário';

  return (
    <header className={styles.header}>
      <Link to="/">
        <img src={logo} alt="DSIM Logo" className={styles.logoImage} />
      </Link>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link to="/pacientes/adicionar" className={styles.addButton}>
          Adicionar Paciente
        </Link>
        <UserMenu userName={userName} />
      </div>
    </header>
  );
};

const PainelListaPacientes: React.FC = () => {

  const [patients, setPatients] = useState<Pacientes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPacientes(); 

    // TODO: WebSocket desabilitado temporariamente até configurar SSL/WSS
    /* const ws = new WebSocket(WS_BASE_URL);
    
    ws.onopen = () => {
      console.log('WebSocket conectado ao painel de pacientes');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Dados recebidos via WebSocket:', data);
      
      // Atualiza a lista de pacientes quando receber novos dados
      if (data.type === 'vital-update' || data.type === 'patient-update') {
        fetchPacientes();
      }
    };

    ws.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket desconectado');
    };

    // Cleanup: fecha o WebSocket ao desmontar o componente
    return () => {
      ws.close();
    }; */
  }, []); 

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/api/pacientes');

      setPatients(response.data); 

    } catch (e: any) {
      console.error("Falha ao buscar pacientes:", e);
      const errorMsg = e.response?.data?.message || e.message || "Não foi possível carregar os pacientes.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className={styles.message}>Carregando pacientes...</div>;
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  return (
    <div className={styles.page}>
      <PatientListHeader />
      <section className={styles.titleSection}>
        <h1>Lista de pacientes</h1>
        <p>Autonomia para quem usa, tranquilidade para quem ama</p>
      </section>
      <main className={styles.gridContainer}>
        {patients.length === 0 ? (
          <p className={styles.emptyMessage}>
            Nenhum paciente cadastrado ainda. Clique em "Adicionar" para
            começar.
          </p>
        ) : (
          <div className={styles.patientGrid}>
            {patients.map((paciente) => (
              <PatientCard 
                key={paciente.id} 
                patient={paciente} 
                onDelete={fetchPacientes}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PainelListaPacientes;
