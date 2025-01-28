import React from 'react';
import styles from './HomePage.module.css';
import Header from '../../components/common/Header/Header';
import FirstButton from '../../components/common/FirstButton/FirstButton';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>ברוך הבא!</h1>
        <p className={styles.subtitle}>בחר פעולה להמשך:</p>
        <div className={styles.actions}>
          <Link to="/Scan-Camera">
            <FirstButton disabled={false}>
              לסריקה
            </FirstButton>
          </Link>
          <Link to="/Sugges">
            <FirstButton disabled={false}>
              ליצירת שילוב
            </FirstButton>
          </Link>
          <Link to="/clothes">
            <FirstButton disabled={false}>
              לכל הבגדים
            </FirstButton>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
