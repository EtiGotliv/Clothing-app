// src/page/HomePage/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import FirstButton from '../../components/common/FirstButton/FirstButton';
import Search from '../../components/Search/Search.jsx';
import LoadingAnimation from '../../components/common/LoadingAnimation/LoadingAnimation';

const HomePage = () => {
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const navigate = useNavigate();

  // Get user ID and name from location state or localStorage
  const userId = location.state?.id || localStorage.getItem("authToken");
  const userName = location.state?.name || localStorage.getItem("userName") || "משתמש";
  
  // Fetch user profile picture from email
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      // Use Gravatar service to fetch profile picture
      const gravatarHash = md5(userEmail.toLowerCase().trim());
      setUserProfilePic(`https://www.gravatar.com/avatar/${gravatarHash}?d=mp&s=200`);
    }
  }, []);

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

  const openEmailClient = () => {
    window.location.href = 'mailto:123@gmail.com';
  };

  return (
    <div className={styles.homePageContainer}>
      <LoadingAnimation shouldShow={isAnimating}>
        <main className={styles.main}>
          {userProfilePic && (
            <div className={styles.profilePicContainer}>
              <img 
                src={userProfilePic} 
                alt="Profile" 
                className={styles.profilePic} 
              />
            </div>
          )}
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
      
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2025 נבנה בידי פרידי ברזילי ואתי גוטליב. כל הזכויות שמורות.</p>
          <div className={styles.footerLinks}>
            <a 
              href="mailto:123@gmail.com" 
              onClick={openEmailClient} 
              className={styles.footerLink}
            >
              השאר פניה
            </a>
            <a 
              href="https://www.instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.footerLink}
            >
              Instagram
            </a>
            <a 
              href="https://www.facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.footerLink}
            >
              Facebook
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;