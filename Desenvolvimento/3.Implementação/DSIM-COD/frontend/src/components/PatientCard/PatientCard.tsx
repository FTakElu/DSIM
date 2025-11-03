import React from 'react';
import { Link } from 'react-router-dom';
import { Pacientes } from '../../Types/PacientesType'; 
import styles from './PatientCard.module.css'; 
import { FaTint, FaThermometerHalf, FaHeartbeat } from 'react-icons/fa';



interface PatientCardProps {
  patient: Pacientes; 
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {

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