// src/page/HomePage/HomePage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import FirstButton from '../../components/common/FirstButton/FirstButton';
import Search from '../../components/Search/Search.jsx';
import LoadingAnimation from '../../components/common/LoadingAnimation/LoadingAnimation';

const HomePage = () => {
  const location = useLocation(); // השתמשו במשתנה "location" באופן עקבי
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

    // ניסיון לקבל את מזהה המשתמש והשם מ-location.state, ואם לא – מ-localStorage
    const userId = location.state?.id || localStorage.getItem("authToken");
    const userName = location.state?.name || localStorage.getItem("userName") || "משתמש";
  
    if (!userId) {
      return <div>❌ לא נמצא מידע על המשתמש. אנא התחבר מחדש.</div>;
    }
  const handleNavigation = (page) => {
    if (page === '/Scan-Camera') {
      navigate(page);
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      navigate(page);
      setIsAnimating(false);
    }, 2500);
  };

  return (
    <div>
      <LoadingAnimation shouldShow={isAnimating}>
        <main className={styles.main}>
          {/* שימוש ב-userName במקום בגישה ישירה ל-location.state.id */}
          <h1 className={styles.title}>Hello {userName} and welcome to the home</h1>
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
