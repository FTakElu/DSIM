
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../assets/logo-dsim.png";
import PatientCard from "../components/PatientCard/PatientCard";
import UserMenu from "../components/UserMenu/UserMenu";
import { useWebSocket } from "../hooks/useWebSocket";
import api from '../service/api';
import theme from "../styles/Theme.module.css";
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
        <Link to="/pacientes/adicionar" className={`${theme.btn} ${theme.outlineLight}`}>
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

  // Configurar WebSocket com Socket.io
  const { isConnected, lastUpdate, lastAlert } = useWebSocket({
    autoConnect: true,
    subscribeToAllPatients: true,
    onVitalUpdate: (data) => {
      console.log('📊 Atualização de sinais vitais recebida:', data);
      
      // Atualizar paciente específico na lista
      setPatients(prevPatients => 
        prevPatients.map(p => 
          p.id === data.patientId 
            ? {
                ...p,
                vitals: {
                  temperatura: { value: data.temperatura || p.vitals?.temperatura?.value || 0, status: 'stable' },
                  batimentos: { value: data.frequencia_cardiaca || p.vitals?.batimentos?.value || 0, status: 'stable' },
                  oxigenio: { value: data.saturacao_oxigenio || p.vitals?.oxigenio?.value || 0, status: 'stable' },
                },
                bateria: data.bateria,
                status: data.status,
              }
            : p
        )
      );
    },
    onAlert: (alert) => {
      console.log('🚨 Alerta recebido:', alert);
      
      if (alert.type === 'panic') {
        toast.error(`🚨 ALERTA DE PÂNICO: ${alert.patientName}!`, {
          position: 'top-center',
          autoClose: false,
          closeOnClick: false,
        });
      } else if (alert.type === 'fall') {
        toast.warning(`⚠️ QUEDA DETECTADA: ${alert.patientName}!`, {
          position: 'top-center',
          autoClose: 10000,
        });
      }
    },
    onDeviceStatus: (status) => {
      console.log('📟 Status do dispositivo atualizado:', status);
      
      // Atualizar status do paciente
      setPatients(prevPatients => 
        prevPatients.map(p => 
          p.id === status.patientId 
            ? { ...p, status: status.status }
            : p
        )
      );
    },
  });

  useEffect(() => {
    fetchPacientes(); 
  }, []); 

  useEffect(() => {
    if (lastUpdate) {
      console.log('🔄 Última atualização:', lastUpdate);
    }
  }, [lastUpdate]);

  useEffect(() => {
    if (lastAlert) {
      console.log('🚨 Último alerta:', lastAlert);
    }
  }, [lastAlert]);

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
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginTop: '8px',
          fontSize: '14px',
          color: isConnected ? '#22c55e' : '#ef4444'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#22c55e' : '#ef4444',
            animation: isConnected ? 'pulse 2s infinite' : 'none'
          }} />
          {isConnected ? '🔌 Tempo real ativo' : '❌ Tempo real desconectado'}
        </div>
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
