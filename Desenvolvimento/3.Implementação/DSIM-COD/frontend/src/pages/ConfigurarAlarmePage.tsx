import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import api from '../service/api'; 
import theme from '../styles/Theme.module.css';
import styles from './DetalhesPacientePage.module.css'; 
import logoImage from '../assets/logo-dsim.png'; 

const ConfigHeader: React.FC = () => (
  <header className={styles.header}>
    <Link to="/pacientes">
      <img src={logoImage} alt="DSIM Logo" className={styles.logoImage} />
    </Link>
  </header>
);

const ConfigurarAlarmePage: React.FC = () => {
  const { pacienteId } = useParams<{ pacienteId: string }>(); 
  const navigate = useNavigate();
  
  const [resp, setResp] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultValues = { fcMin: 50, fcMax: 110, spo2Min: 92, tempMax: 38.0 };

  const [fcMin, setFcMin] = useState(defaultValues.fcMin);
  const [fcMax, setFcMax] = useState(defaultValues.fcMax);
  const [spo2Min, setSpo2Min] = useState(defaultValues.spo2Min);
  const [tempMax, setTempMax] = useState(defaultValues.tempMax);

  
  useEffect(() => {
    const fetchConfig = async () => {
      if (!pacienteId) return;
      try {
        const response = await api.get(`/api/alarms/${pacienteId}`);
        const config = response.data;
        setFcMin(config.batimentos_min);
        setFcMax(config.batimentos_max);
        setSpo2Min(config.oxigenio_min);
        setTempMax(config.temperatura_max);
      } catch (error) {
        console.log("Nenhum alarme personalizado, usando padrões.");
      }
    };
    fetchConfig();
  }, [pacienteId]);

  const salvar = async () => {
    setLoading(true);
    setResp('');
    try {
      const payload = {
        batimentos_min: fcMin,
        batimentos_max: fcMax,
        oxigenio_min: spo2Min,
        temperatura_max: tempMax,
      };
      
      await api.post(`/api/alarms/${pacienteId}`, payload); 
      
      setResp('Parâmetros salvos com sucesso.');
      setTimeout(() => navigate(`/pacientes/${pacienteId}`), 1000);

    } catch (e: any) {
      setResp('Erro ao salvar parâmetros: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <ConfigHeader />
    <PageShell title="Configurar Alarme (MEWS)" subtitle="Defina limites para alertas de sinais vitais">
      <div className={theme.card} style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className={theme.field}>
          <label>Frequência Cardíaca Min</label>
          <input className={theme.input} type="number" value={fcMin} onChange={(e)=>setFcMin(Number(e.target.value))} />
        </div>
        <div className={theme.field}>
          <label>Frequência Cardíaca Máx</label>
          <input className={theme.input} type="number" value={fcMax} onChange={(e)=>setFcMax(Number(e.target.value))} />
        </div>
        <div className={theme.field}>
          <label>SpO2 Mínima</label>
          <input className={theme.input} type="number" value={spo2Min} onChange={(e)=>setSpo2Min(Number(e.target.value))} />
        </div>
        <div className={theme.field}>
          <label>Temperatura Máx (°C)</label>
          <input className={theme.input} type="number" step="0.1" value={tempMax} onChange={(e)=>setTempMax(Number(e.target.value))} />
        </div>
        <button className={`${theme.btn} ${theme.primary}`} onClick={salvar} style={{ marginTop:12 }}>Salvar</button>
        {resp && <p style={{ marginTop:8 }}>{resp}</p>}
      </div>
    </PageShell>
    </>
  );
};

export default ConfigurarAlarmePage;