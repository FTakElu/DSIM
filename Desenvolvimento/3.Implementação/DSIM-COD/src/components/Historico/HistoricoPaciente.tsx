import React, { useState, useEffect } from "react";
import styles from "./HistoricoPaciente.module.css";
//  Bibliotec Recharts. Instalação: npm install recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// DEPOIS trocar pelos dados do dispositvo
const dadosExemploGrafico = {
  dia: [
    { hora: "08:00", batimentos: 80, oxigenio: 98 },
    { hora: "09:00", batimentos: 82, oxigenio: 97 },
    { hora: "10:00", batimentos: 90, oxigenio: 95 }, // Alerta
    { hora: "11:00", batimentos: 85, oxigenio: 96 },
  ],
  mes: [
    { dia: "01/10", batimentos: 85, oxigenio: 97 },
    { dia: "02/10", batimentos: 82, oxigenio: 98 },
    { dia: "03/10", batimentos: 88, oxigenio: 96 },
  ],
  ano: [
    { mes: "Jan", batimentos: 88, oxigenio: 96 },
    { mes: "Fev", batimentos: 85, oxigenio: 97 },
    { mes: "Mar", batimentos: 87, oxigenio: 98 },
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
            <LineChart data={dadosExemploGrafico[periodo]}>
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
                activeDot={{ r: 8 }}
              />
              <Line type="monotone" dataKey="oxigenio" stroke="#007bff" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <h3 className={styles.subtitulo}>Eventos Recentes</h3>
        <ul className={styles.listaEventos}>
          {dadosExemploLista.map((evento, index) => (
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
