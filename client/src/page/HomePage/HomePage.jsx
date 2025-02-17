import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import FirstButton from '../../components/common/FirstButton/FirstButton';
import { Search } from '../../components/Search/Search.jsx';
import LoadingAnimation from '../../components/common/LoadingAnimation/LoadingAnimation';

const HomePage = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (page) => {
    if (page === '/Scan-Camera') {
      navigate(page);
      return;
    }
    setIsAnimating(true);
    // המתנה לטעינת האנימציה לפני ניווט לדף הנבחר
    setTimeout(() => {
      navigate(page);
      setIsAnimating(false);
    }, 2500);
  };

  return (
    <div>
      <LoadingAnimation shouldShow={isAnimating}>
        <main className={styles.main}>
          <h1 className={styles.title}>ברוך הבא!</h1>
          <p className={styles.subtitle}>בחר פעולה להמשך:</p>
          <div className={styles.actions}>
            <FirstButton onClick={() => handleNavigation('/Scan-Camera')}>
              לסריקה
            </FirstButton>
            <FirstButton onClick={() => handleNavigation('/Sugges')}>
              ליצירת שילוב
            </FirstButton>
            <FirstButton onClick={() => handleNavigation('/clothes')}>
              לכל הבגדים
            </FirstButton>
          </div>
          <div className={styles.searchBox}>
            <Search />
          </div>
        </main>
      </LoadingAnimation>
    </div>
  );
};

export default HomePage;
