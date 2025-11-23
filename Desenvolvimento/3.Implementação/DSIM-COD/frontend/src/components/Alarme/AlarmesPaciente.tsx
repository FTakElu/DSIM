import React, { useEffect, useState } from 'react';
import { FaHeartbeat, FaTemperatureHigh, FaWind } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { AlarmeConfig } from '../../service/mockData';
import { WS_BASE_URL } from '../../service/api';
import styles from './AlarmesPaciente.module.css';

interface Props {
  config: AlarmeConfig;
  pacienteId: string;
}

const AlarmesPaciente: React.FC<Props> = ({ config, pacienteId }) => {
  const [alarmesAtivos, setAlarmesAtivos] = useState<string[]>([]);
  const [ultimoAlerta, setUltimoAlerta] = useState<string | null>(null);

  useEffect(() => {
    // WebSocket para receber alertas de alarmes em tempo real
    const ws = new WebSocket(WS_BASE_URL);
    
    ws.onopen = () => {
      console.log('WebSocket conectado aos alarmes');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Alarme recebido via WebSocket:', data);
      
      // Quando um alarme for disparado
      if (data.type === 'alarm-triggered' && data.pacienteId === pacienteId) {
        setAlarmesAtivos(prev => {
          if (!prev.includes(data.alarmType)) {
            return [...prev, data.alarmType];
          }
          return prev;
        });
        
        setUltimoAlerta(data.message || 'Alarme disparado');
        
        // Remove o alerta da lista após 5 segundos
        setTimeout(() => {
          setUltimoAlerta(null);
        }, 5000);
      }

      // Quando um alarme for resolvido
      if (data.type === 'alarm-resolved' && data.pacienteId === pacienteId) {
        setAlarmesAtivos(prev => prev.filter(a => a !== data.alarmType));
      }
    };

    ws.onerror = (error) => {
      console.error('Erro no WebSocket dos alarmes:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket dos alarmes desconectado');
    };

    return () => {
      ws.close();
    };
  }, [pacienteId]);

  return (
    <section className={styles.alarmesContainer}>
      <h2 className={styles.titulo}>Alarmes Ativos</h2>
      
      {ultimoAlerta && (
        <div className={styles.alertaBanner} style={{
          backgroundColor: '#ff4444',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '15px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          ⚠️ {ultimoAlerta}
        </div>
      )}
      
      <div className={styles.listaAlarmes}>
        {/* Alarme de Batimentos */}
        <div className={`${styles.alarmeItem} ${alarmesAtivos.includes('batimentos') ? styles.ativo : ''}`}>
          <FaHeartbeat className={styles.icone} />
          <div className={styles.info}>
            <strong>Batimentos Cardíacos</strong>
            <span className={styles.detalhes}>
              Alerta se: &lt; {config.batimentos_min} ou &gt; {config.batimentos_max} bpm
            </span>
            {alarmesAtivos.includes('batimentos') && (
              <span className={styles.statusAtivo}>🔴 ATIVO</span>
            )}
          </div>
        </div>

        {/* Alarme de Oxigênio */}
        <div className={`${styles.alarmeItem} ${alarmesAtivos.includes('oxigenio') ? styles.ativo : ''}`}>
          <FaWind className={styles.icone} /> {/* Ícone de Vento/Ar */}
          <div className={styles.info}>
            <strong>Oxigenação (SpO2)</strong>
            <span className={styles.detalhes}>
              Alerta se: &lt; {config.oxigenio_min}%
            </span>
            {alarmesAtivos.includes('oxigenio') && (
              <span className={styles.statusAtivo}>🔴 ATIVO</span>
            )}
          </div>
        </div>

        {/* Alarme de Temperatura */}
        <div className={`${styles.alarmeItem} ${alarmesAtivos.includes('temperatura') ? styles.ativo : ''}`}>
          <FaTemperatureHigh className={styles.icone} />
          <div className={styles.info}>
            <strong>Temperatura Corporal</strong>
            <span className={styles.detalhes}>
              Alerta se: &gt; {config.temperatura_max}°C
            </span>
            {alarmesAtivos.includes('temperatura') && (
              <span className={styles.statusAtivo}>🔴 ATIVO</span>
            )}
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