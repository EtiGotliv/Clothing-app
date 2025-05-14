import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import items from '../../data/clothingItems.json';
import styles from './HomePage.module.css';
import md5 from 'md5';

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userProfilePic, setUserProfilePic] = useState(null);

  const userId = location.state?.id || localStorage.getItem('authToken');
  const userName = location.state?.name || localStorage.getItem('userName') || "משתמש יקר";

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      const gravatarHash = md5(userEmail.toLowerCase().trim());
      setUserProfilePic(`https://www.gravatar.com/avatar/${gravatarHash}?d=mp&s=200`);
    }
  }, []);

  const handleNavigation = (page) => {
    navigate(page);
  };

  return (
    <div className={styles.homePageContainer}>
      <main className={styles.mainContent}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.welcomeText}>
              <h2 className={styles.greeting}>ברוכה הבאה, {userName}!</h2>
              <p className={styles.introText}>
                בואי נגלה יחד איך להפוך כל בגד בארון שלך לסטייל מנצח ✨
              </p>
              <button
                className={styles.scanButton}
                onClick={() => handleNavigation('/Scan-Camera')}
              >
                התחל/י סריקה
              </button>
            </div>
            <div className={styles.heroImageContainer}>
              <img
                src="/Image/unnamed.png"
                alt="Wardrobe Inspiration"
                className={styles.heroImage}
              />
            </div>
          </div>
        </section>

        <section className={styles.clothingSection}>
          <h2 className={styles.sectionTitle}>בחרי קטגוריה להתחיל איתה</h2>
          <div className={styles.gridContainer}>
            {items.map(({ id, image, text, link }) => (
              <div key={id} className={styles.gridItem}>
                <div className={styles.imageWrapper}>
                  <img src={image} alt={text} className={styles.gridImage} />
                  <div className={styles.imageOverlay}></div>
                  <button
                    className={styles.gridButton}
                    onClick={() => navigate(link)}
                  >
                    {text}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2025 נוצר באהבה על ידי פרידי ברזילי ואתי גוטליב | כל הזכויות שמורות</p>
          <div className={styles.footerLinks}>
            <a href="mailto:bonitique.customer.service@gmail.com" className={styles.footerLink}>
              צור קשר
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
              Instagram
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
              Facebook
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
