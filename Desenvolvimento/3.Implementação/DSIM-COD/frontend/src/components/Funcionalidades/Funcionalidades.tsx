import React from 'react';
import styles from './Funcionalidades.module.css';
import SmartwacthImg from '../../assets/SmartWatcImg.png';


// Um array de objetos para criar uma lista mais organizada :)
const featuresData = [
  {
    title: 'Sinais Vitais',
    text: 'Acompanhamento contínuo de frequência cardíaca, oxigenação e temperatura corporal em tempo real.',
  },
  {
    title: 'Detecção de Quedas',
    text: 'Detecção automática de impactos, disparando alarmes mesmo sem consciência do usuário.',
  },
  {
    title: 'Botão de pânico',
    text: 'Acionamento manual para emergências, enviando alertas instantâneos a cuidadores e familiares.',
  },
 
];

const Funcionalidades: React.FC = () => {
  return (
    <section id="funcionalidades" className={styles.featuresSection}>
      <h2 className={styles.title}>Funcionalidades</h2>
      
      <div className={styles.container}>
        
        <div className={styles.timeline}>
          {featuresData.map((feature, index) => (
            <div key={index} className={styles.featureItem}>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.text}</p>
            </div>
          ))}
        </div>

        <div className={styles.imageContainer}>
          <img src={SmartwacthImg} alt="Smartwatch DSIM" className={styles.SmartwacthImg} />
        </div>
      </div>
    </section>
  );
};

export default Funcionalidades;