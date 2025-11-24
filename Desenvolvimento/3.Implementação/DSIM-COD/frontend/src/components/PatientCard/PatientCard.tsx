import React from 'react';
import { FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaEdit, FaExclamationTriangle, FaHeartbeat, FaPowerOff, FaThermometerHalf, FaTint, FaTrash, FaWifi } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../service/api';
import { Pacientes } from '../../Types/PacientesType';
import { getHeartRateStatus, getOxygenStatus, getStatusClassName, getTemperatureStatus } from '../../utils/vitalStatus';
import styles from './PatientCard.module.css';



interface PatientCardProps {
  patient: Pacientes;
  onDelete?: () => void; 
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/pacientes/editar/${patient.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o paciente ${patient.nome}?`)) {
      try {
        await apiClient.delete(`/api/pacientes/${patient.id}`);
        alert('Paciente excluído com sucesso!');
        if (onDelete) onDelete(); // Callback para atualizar a lista
      } catch (error) {
        console.error('Erro ao excluir paciente:', error);
        alert('Erro ao excluir paciente. Tente novamente.');
      }
    }
  };

  // Obter valores dos sinais vitais
  const oxygen = typeof patient.vitals?.oxigenio?.value === 'number' 
    ? patient.vitals.oxigenio.value 
    : parseFloat(patient.vitals?.oxigenio?.value as string) || 0;
  const temperature = typeof patient.vitals?.temperatura?.value === 'number'
    ? patient.vitals.temperatura.value
    : parseFloat(patient.vitals?.temperatura?.value as string) || 0;
  const heartRate = typeof patient.vitals?.batimentos?.value === 'number'
    ? patient.vitals.batimentos.value
    : parseFloat(patient.vitals?.batimentos?.value as string) || 0;

  // Calcular status das cores (pode usar limites de alarme personalizados se disponível)
  const oxygenStatus = getOxygenStatus(oxygen);
  const tempStatus = getTemperatureStatus(temperature);
  const heartStatus = getHeartRateStatus(heartRate);

  // Ícone de bateria baseado no percentual
  const getBatteryIcon = () => {
    const battery = patient.bateria || 0;
    if (battery > 50) return <FaBatteryFull />;
    if (battery > 20) return <FaBatteryHalf />;
    return <FaBatteryQuarter />;
  };

  const getBatteryColor = () => {
    const battery = patient.bateria || 0;
    if (battery > 50) return '#4caf50';
    if (battery > 20) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className={styles.card}>
      {/* Alertas visuais */}
      {patient.panico_ativo && (
        <div className={styles.alertBanner} style={{backgroundColor: '#f44336'}}>
          <FaExclamationTriangle /> PÂNICO ATIVADO
        </div>
      )}
      {patient.queda_detectada && (
        <div className={styles.alertBanner} style={{backgroundColor: '#ff9800'}}>
          <FaExclamationTriangle /> QUEDA DETECTADA
        </div>
      )}
      {patient.statusDispositivo === 'offline' && (
        <div className={styles.alertBanner} style={{backgroundColor: '#9e9e9e'}}>
          <FaPowerOff /> FORA DE ÁREA
        </div>
      )}
      {patient.statusDispositivo === 'desligada' && (
        <div className={styles.alertBanner} style={{backgroundColor: '#757575'}}>
          <FaPowerOff /> PULSEIRA DESLIGADA
        </div>
      )}

      <img src={patient.imageUrl || ''} alt={patient.nome} className={styles.patientImage} /> 
      <h3 className={styles.patientName}>{patient.nome}</h3>
      
      {/* Status e Bateria */}
      <div className={styles.deviceStatus}>
        <div className={styles.statusItem}>
          <FaWifi color={patient.statusDispositivo === 'online' ? '#4caf50' : '#9e9e9e'} />
          <span>{patient.statusDispositivo === 'online' ? 'Online' : 'Offline'}</span>
        </div>
        {patient.bateria !== undefined && (
          <div className={styles.statusItem} style={{color: getBatteryColor()}}>
            {getBatteryIcon()}
            <span>{patient.bateria}%</span>
          </div>
        )}
      </div>

      <div className={styles.vitals}>
        <div className={styles.vitalItem}>
          <div className={`${styles.vitalIcon} ${styles[getStatusClassName(oxygenStatus)]}`}> 
            <FaTint />
          </div>
          <span className={styles.vitalValue}>{oxygen}%</span>
        </div>
         <div className={styles.vitalItem}>
          <div className={`${styles.vitalIcon} ${styles[getStatusClassName(tempStatus)]}`}>
            <FaThermometerHalf />
          </div>
          <span className={styles.vitalValue}>{temperature}°C</span>
        </div>
         <div className={styles.vitalItem}>
          <div className={`${styles.vitalIcon} ${styles[getStatusClassName(heartStatus)]}`}>
            <FaHeartbeat />
          </div>
          <span className={styles.vitalValue}>{heartRate}bpm</span>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <Link to={`/pacientes/${patient.id}`} className={styles.viewButton}>
          Visualizar
        </Link>
        <button onClick={handleEdit} className={styles.editButton} title="Editar">
          <FaEdit /> Editar
        </button>
        <button onClick={handleDelete} className={styles.deleteButton} title="Excluir">
          <FaTrash /> Excluir
        </button>
      </div>
    </div>
  );
};

export default PatientCard;