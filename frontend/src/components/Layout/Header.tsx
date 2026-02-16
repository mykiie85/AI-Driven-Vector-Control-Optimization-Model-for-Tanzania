import React from "react";
import styles from "./Header.module.css";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => (
  <header className={styles.header} role="banner">
    <div className={styles.brand}>
      <button
        className={styles.menuBtn}
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar navigation"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <div className={styles.logo} aria-hidden="true">VT</div>
      <div>
        <span className={styles.title}>VCOM-TZ</span>
        <span className={styles.subtitle}> &mdash; Vector Control Optimization</span>
      </div>
    </div>
    <nav className={styles.nav} aria-label="System status">
      <div className={styles.statusDot} aria-hidden="true" />
      <span className={styles.statusLabel}>System Online</span>
    </nav>
  </header>
);

export default Header;
