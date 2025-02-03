import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css'; // עדכן את הנתיב אם צריך

const Header = () => {
  return (
    <header className={styles.appHeader}>
      <nav className={styles.appNav}>
        <Link to="/about" className={styles.aboutUs}>
          <span className="about-us">עלינו</span>
        </Link>
        <Link to="/" className={styles.appLink}>
          <span className="material-icons">home</span>
        </Link>
      </nav>
    </header>
  );
}

export default Header;
