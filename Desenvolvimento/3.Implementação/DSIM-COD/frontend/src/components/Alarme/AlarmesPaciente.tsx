import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AlarmesPaciente.module.css';
import { FaHeartbeat, FaTemperatureHigh, FaWind } from 'react-icons/fa'; 
import { AlarmeConfig } from '../../service/mockData'; 

interface Props {
  config: AlarmeConfig;
  pacienteId: string;
}

const AlarmesPaciente: React.FC<Props> = ({ config, pacienteId }) => {
  return (
    <section className={styles.alarmesContainer}>
      <h2 className={styles.titulo}>Alarmes Ativos</h2>
      
      <div className={styles.listaAlarmes}>
        {/* Alarme de Batimentos */}
        <div className={styles.alarmeItem}>
          <FaHeartbeat className={styles.icone} />
          <div className={styles.info}>
            <strong>Batimentos Cardíacos</strong>
            <span className={styles.detalhes}>
              Alerta se: &lt; {config.batimentos_min} ou &gt; {config.batimentos_max} bpm
            </span>
          </div>
        </div>

        {/* Alarme de Oxigênio */}
        <div className={styles.alarmeItem}>
          <FaWind className={styles.icone} /> {/* Ícone de Vento/Ar */}
          <div className={styles.info}>
            <strong>Oxigenação (SpO2)</strong>
            <span className={styles.detalhes}>
              Alerta se: &lt; {config.oxigenio_min}%
            </span>
          </div>
        </div>

        {/* Alarme de Temperatura */}
        <div className={styles.alarmeItem}>
          <FaTemperatureHigh className={styles.icone} />
          <div className={styles.info}>
            <strong>Temperatura Corporal</strong>
            <span className={styles.detalhes}>
              Alerta se: &gt; {config.temperatura_max}°C
            </span>
          </div>
        </div>
      </div>

      <div className={styles.footerAcoes}>
        <Link to={`/pacientes/${pacienteId}/configurar-alarme`} className={styles.configButton}>
          Editar Limites
        </Link>
      </div>
    </section>
  );
};

export default AlarmesPaciente;