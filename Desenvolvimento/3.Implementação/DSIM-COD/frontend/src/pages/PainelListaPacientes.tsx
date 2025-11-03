
<<<<<<< HEAD

import React, { useState, useEffect } from "react"; 
import { Link } from "react-router-dom";
import PatientCard from "../components/PatientCard/PatientCard";
import { Pacientes } from "../Types/PacientesType"; 
import styles from "./PainelListaPacientes.module.css";
import logo from "../assets/logo-dsim.png"; 
import api from '../service/api'; 


 /*
=======
import React from "react";
import { Link } from "react-router-dom";
import PatientCard from "../components/PatientCard/PatientCard";
import { Pacientes } from "../Types/PacientesType";
import styles from "./PainelListaPacientes.module.css";
import logo from "../assets/logo-dsim.png"

/*
>>>>>>> 6cb3298850116a63aa43f5d8d8b2feabfc52c032
  PainelListaPacientes.tsx: Página principal do painel de controle.
  Exibe a lista de todos os pacientes cadastrados em formato de cards.
  Esta página recebe a lista de pacientes do App.tsx e serve
  como ponto central para navegar para os detalhes de um paciente específico
  ou para a página de adicionar um novo paciente.
*/

const PatientListHeader = () => (
  <header className={styles.header}>
    <Link to="/">
      <img src={logo} alt="DSIM Logo" className={styles.logoImage} />
    </Link>
    <Link to="/pacientes/adicionar" className={styles.addButton}>
      Adicionar
    </Link>
  </header>
);

<<<<<<< HEAD
const PainelListaPacientes: React.FC = () => {

  const [patients, setPatients] = useState<Pacientes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchPacientes(); 
  }, []); 
  
  if (loading) {
    return <div className={styles.message}>Carregando pacientes...</div>;
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

=======
interface PatientListPageProps {
  patients: Pacientes[];
}

const PatientListPage: React.FC<PatientListPageProps> = ({ patients }) => {
>>>>>>> 6cb3298850116a63aa43f5d8d8b2feabfc52c032
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
<<<<<<< HEAD
            {patients.map((paciente) => (
              <PatientCard key={paciente.id} patient={paciente} />
=======
            {patients.map((Pacientes) => (
              <PatientCard key={Pacientes.id} patient={Pacientes} />
>>>>>>> 6cb3298850116a63aa43f5d8d8b2feabfc52c032
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

<<<<<<< HEAD
export default PainelListaPacientes;
=======
export default PatientListPage;
>>>>>>> 6cb3298850116a63aa43f5d8d8b2feabfc52c032
