import React from 'react';
import styles from './PageShell.module.css';

type Props = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const PageShell: React.FC<Props> = ({ title, subtitle, actions, children }) => {
  return (
    <div className={styles.page}>
      <main className={styles.container}>
        {(title || subtitle || actions) && (
          <div style={{ marginBottom: 16 }}>
            {title && <h2 className={styles.pageTitle}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {actions && <div className={styles.gridActions}>{actions}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default PageShell;
