import React from 'react';
import { Link } from 'react-router-dom'; 
import { Pacientes, VitalStatus } from '../../Types/PacientesType'; 
import styles from './PatientCard.module.css';
import { FaTint, FaThermometerHalf, FaHeartbeat } from 'react-icons/fa';

const statusStyles: Record<VitalStatus, string> = {
  stable: styles.stable,
  warning: styles.warning,
  danger: styles.danger,
};

interface PatientCardProps {
  patient: Pacientes; 
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  return (
    <div className={styles.card}>
      <img src={patient.imageUrl} alt={patient.nome} className={styles.patientImage} />
      <h3 className={styles.patientName}>{patient.nome}</h3>
      <div className={styles.vitals}>
        <div className={`${styles.vitalIcon} ${statusStyles[patient.vitals.oxegenio.status]}`}>
          <FaTint />
        </div>
        <div className={`${styles.vitalIcon} ${statusStyles[patient.vitals.temperatura.status]}`}>
          <FaThermometerHalf />
        </div>
        <div className={`${styles.vitalIcon} ${statusStyles[patient.vitals.batimentos.status]}`}>
          <FaHeartbeat />
        </div>
      </div>
      <Link to={`/pacientes/${patient.id}`} className={styles.viewButton}>
        Visualizar
      </Link>
    </div>
  );
};

export default PatientCard;