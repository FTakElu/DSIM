import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/logo-dsim.png'; 

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src={logo} alt="DSIM Logo" /> 
          
        </div>
        <nav className={styles.nav}>
          <a href="#sobre">O que é?</a>
          <a href="#funcionalidades">Funcionalidades</a>
        </nav>
        <Link to="pacientes" className={styles.ctaButton}>Entrar</Link>
      </div>
    </header>
  );
};

export default Header;