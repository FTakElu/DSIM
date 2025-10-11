
import React from "react";
import { Link } from "react-router-dom";
import PatientCard from "../components/PatientCard/PatientCard";
import { Pacientes } from "../Types/PacientesType";
import styles from "./PainelListaPacientes.module.css";
import logo from "../assets/logo-dsim.png"

/*
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

interface PatientListPageProps {
  patients: Pacientes[];
}

const PatientListPage: React.FC<PatientListPageProps> = ({ patients }) => {
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
            {patients.map((Pacientes) => (
              <PatientCard key={Pacientes.id} patient={Pacientes} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientListPage;
