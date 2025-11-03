import React from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { Pacientes } from '../../Types/PacientesType'; 
import styles from './PatientCard.module.css'; 
import { FaTint, FaThermometerHalf, FaHeartbeat } from 'react-icons/fa';


=======
import { Link } from 'react-router-dom'; 
import { Pacientes, VitalStatus } from '../../Types/PacientesType'; 
import styles from './PatientCard.module.css';
import { FaTint, FaThermometerHalf, FaHeartbeat } from 'react-icons/fa';

const statusStyles: Record<VitalStatus, string> = {
  stable: styles.stable,
  warning: styles.warning,
  danger: styles.danger,
};
>>>>>>> 6cb3298850116a63aa43f5d8d8b2feabfc52c032

interface PatientCardProps {
  patient: Pacientes; 
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
<<<<<<< HEAD

  return (
    <div className={styles.card}>
    <img src={patient.imageUrl || ''} alt={patient.nome} className={styles.patientImage} /> 
         <h3 className={styles.patientName}>{patient.nome}</h3>
      <div className={styles.vitals}>
        <div className={`${styles.vitalIcon} ${styles.stable}`}> 
          <FaTint />
        </div>
         <div className={`${styles.vitalIcon} ${styles.stable}`}>
          <FaThermometerHalf />
        </div>
         <div className={`${styles.vitalIcon} ${styles.stable}`}>
=======
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
>>>>>>> 6cb3298850116a63aa43f5d8d8b2feabfc52c032
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