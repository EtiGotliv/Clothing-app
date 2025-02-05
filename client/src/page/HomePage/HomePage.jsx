import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import Header from '../../components/Header/Header';
import FirstButton from '../../components/common/FirstButton/FirstButton';
import { Search } from '../../components/Search/Search.jsx';
import LoadingAnimation from '../../components/common/LoadingAnimation/LoadingAnimation'; // רכיב האנימציה

const HomePage = () => {
  const [isAnimating, setIsAnimating] = useState(false); // מצב לשליטה על האנימציה
  const navigate = useNavigate();

  const handleNavigation = (page) => {
    if(page == '/Scan-Camera') 
    {
      navigate(page); // ניווט לדף שנבחר
    }
    setIsAnimating(true); // הפעלת האנימציה
    // המתן 500ms לפני המעבר לדף כדי לאפשר לאנימציה להיטען
    setTimeout(() => {
      navigate(page); // ניווט לדף שנבחר
      setIsAnimating(false); // סיום האנימציה לאחר המעבר
    }, 2500); // 0.5 שניות
  };

  return (
    <div>
      <Header />
      <LoadingAnimation shouldShow={isAnimating}> {/* הצגת האנימציה רק אם היא פעילה */}
        <main className={styles.main}>
          <h1 className={styles.title}>ברוך הבא!</h1>
          <p className={styles.subtitle}>בחר פעולה להמשך:</p>
          <div className={styles.actions}>
            <FirstButton onClick={() => handleNavigation('/Scan-Camera')}>לסריקה</FirstButton>
            <FirstButton onClick={() => handleNavigation('/Sugges')}>ליצירת שילוב</FirstButton>
            <FirstButton onClick={() => handleNavigation('/clothes')}>לכל הבגדים</FirstButton>
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
