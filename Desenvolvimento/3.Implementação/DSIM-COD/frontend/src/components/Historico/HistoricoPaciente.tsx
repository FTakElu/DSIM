import React, { useEffect, useState } from "react";
import styles from "./HistoricoPaciente.module.css";
//  Bibliotec Recharts. 
// Instalação: npm install recharts
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

// DEPOIS trocar pelos dados do dispositvo
const dadosExemploGrafico = {
  dia: [
    { hora: "08:00", batimentos: 80, oxigenio: 98, temperatura: 36.5 },
    { hora: "09:00", batimentos: 82, oxigenio: 97, temperatura: 36.8 },
    { hora: "10:00", batimentos: 90, oxigenio: 95, temperatura: 37.2 }, // Alerta
    { hora: "11:00", batimentos: 85, oxigenio: 96, temperatura: 36.9 },
  ],
  mes: [
    { dia: "01/10", batimentos: 85, oxigenio: 97, temperatura: 36.7 },
    { dia: "02/10", batimentos: 82, oxigenio: 98, temperatura: 36.5 },
    { dia: "03/10", batimentos: 88, oxigenio: 96, temperatura: 37.0 },
  ],
  ano: [
    { mes: "Jan", batimentos: 88, oxigenio: 96, temperatura: 36.8 },
    { mes: "Fev", batimentos: 85, oxigenio: 97, temperatura: 36.6 },
    { mes: "Mar", batimentos: 87, oxigenio: 98, temperatura: 36.7 },
  ],
};

const dadosExemploLista = [
  { hora: "10:03", texto: "Alerta de Queda Detectada" },
  { hora: "09:58", texto: "Sinal Vital: Batimentos em 120bpm (danger)" },
  { hora: "08:15", texto: "Botão de Pânico acionado" },
];

type Periodo = "dia" | "mes" | "ano";

const HistoricoPaciente: React.FC = () => {
  const [periodo, setPeriodo] = useState<Periodo>("dia");
  const [dadosGrafico, setDadosGrafico] = useState(dadosExemploGrafico);
  const [eventos, setEventos] = useState(dadosExemploLista);

  useEffect(() => {
    // WebSocket para atualização em tempo real do histórico
    const ws = new WebSocket('ws://localhost:9999');
    
    ws.onopen = () => {
      console.log('WebSocket conectado ao histórico');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Dados histórico recebidos via WebSocket:', data);
      
      // Atualiza gráfico quando receber novos dados vitais
      if (data.type === 'vital-update') {
        // TODO: Integrar com dados reais do backend
        // Exemplo: adicionar novo ponto ao gráfico
        const novoHorario = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const novoDado = {
          hora: novoHorario,
          batimentos: data.vitals?.batimentos || 0,
          oxigenio: data.vitals?.oxigenio || 0,
          temperatura: data.vitals?.temperatura || 0
        };
        
        setDadosGrafico(prev => ({
          ...prev,
          dia: [...prev.dia, novoDado].slice(-10) // Mantém últimos 10 pontos
        }));
      }

      // Atualiza lista de eventos quando receber alertas
      if (data.type === 'alarm-triggered' || data.type === 'event') {
        const novoEvento = {
          hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          texto: data.message || 'Novo evento detectado'
        };
        
        setEventos(prev => [novoEvento, ...prev].slice(0, 10)); // Mantém últimos 10 eventos
      }
    };

    ws.onerror = (error) => {
      console.error('Erro no WebSocket do histórico:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket do histórico desconectado');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <section className={styles.historicoContainer}>
      <h2>Histórico</h2>

      <div className={styles.controles}>
        <div className={styles.botoesPeriodo}>
          <button
            className={periodo === "dia" ? styles.ativo : ""}
            onClick={() => setPeriodo("dia")}
          >
            Dia
          </button>
          <button
            className={periodo === "mes" ? styles.ativo : ""}
            onClick={() => setPeriodo("mes")}
          >
            Mês
          </button>
          <button
            className={periodo === "ano" ? styles.ativo : ""}
            onClick={() => setPeriodo("ano")}
          >
            Ano
          </button>
        </div>
      </div>

      <div className={styles.boxConteudo}>
        <h3 className={styles.subtitulo}>Sinais Vitais ({periodo})</h3>
        <div className={styles.graficoWrapper}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosGrafico[periodo]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={
                  periodo === "dia" ? "hora" : periodo === "mes" ? "dia" : "mes"
                }
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="batimentos"
                stroke="#dc3545"
                name="Batimentos (bpm)"
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="oxigenio" 
                stroke="#007bff"
                name="Oxigenação (%)"
              />
              <Line 
                type="monotone" 
                dataKey="temperatura" 
                stroke="#ff9800"
                name="Temperatura (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <h3 className={styles.subtitulo}>Eventos Recentes</h3>
        <ul className={styles.listaEventos}>
          {eventos.map((evento, index) => (
            <li key={index}>
              <span className={styles.horaEvento}>{evento.hora}</span>
              <span className={styles.textoEvento}>{evento.texto}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HistoricoPaciente;
