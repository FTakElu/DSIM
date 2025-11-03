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
<<<<<<< HEAD
        <Link to="/login" className={styles.ctaButton}>Entrar</Link>
=======
        <Link to="pacientes" className={styles.ctaButton}>Entrar</Link>
>>>>>>> 6cb3298850116a63aa43f5d8d8b2feabfc52c032
      </div>
    </header>
  );
};

export default Header;