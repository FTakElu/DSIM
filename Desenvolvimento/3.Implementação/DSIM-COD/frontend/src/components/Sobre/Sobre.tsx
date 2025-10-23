import React from 'react';
import styles from './Sobre.module.css';
import sensorImg from '../../assets/sensor-img.png';
import healthcareImg from '../../assets/healthcare-img.png';
import biotechImg from '../../assets/biotech.png';

const CardSobre: React.FC<{ imgSrc: string; title: string; text: string }> = ({ imgSrc, title, text }) => (
  <div className={styles.card}>
    <img src={imgSrc} alt={title} className={styles.cardImage} />
    <h3 className={styles.cardTitle}>{title}</h3>
    <p className={styles.cardText}>{text}</p>
  </div>
);



const Sobre: React.FC = () => {
  return (
    <section id="sobre" className={styles.Sobre}>
      <div className={styles.container}>
        <h2 className={styles.Titulo}>O que é?</h2>
        <div className={styles.CaracteristicasGrid}>
          <CardSobre 
            imgSrc={sensorImg}
            title="Sensores"
            text="Coletam sinais vitais e a partir desta tecnologia de sensoriamento identificamos anomalias."
          />
          <CardSobre 
            imgSrc={healthcareImg}
            title="Healthcare"
            text="Dispositivo que contribui para o monitoramento de pacientes em tempo real."
          />
          <CardSobre 
            imgSrc={biotechImg}
            title="BioTech"
            text="Explorando o uso de tecnologias vestíveis não invasivas."
          />
        </div>
      </div>
    </section>
  );

};


export default Sobre;