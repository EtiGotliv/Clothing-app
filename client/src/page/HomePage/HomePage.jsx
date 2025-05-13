// src/page/HomePage/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import items from '../../data/clothingItems.json';
import styles from './HomePage.module.css';

const HomePage = () => {
  const location = useLocation();
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

  const handleNavigation = (page) => {
    navigate(page);
  };

  return (
    <div className={styles.homePageContainer}>
      {/* Header - Fixed Navbar */}
      <header className={styles.navbar}>
        <div className={styles.navbarContent}>
          <div className={styles.logoContainer}>
            <img src="/logo.png" alt="Logo" className={styles.logo} />
            <h1 className={styles.brandName}>Bonitique</h1>
          </div>
          
          <div className={styles.searchContainer}>
            <input 
              type="text" 
              placeholder="חיפוש..." 
              className={styles.searchInput} 
            />
            <button className={styles.searchButton}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* Hero Section with Welcome */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.welcomeText}>
              <h2 className={styles.greeting}>שלום {userName}, מה נשמע?</h2>
              <button 
                className={styles.scanButton}
                onClick={() => handleNavigation('/Scan-Camera')}
              >
                לסריקה
              </button>
            </div>
            <div className={styles.heroImageContainer}>
              <img 
                src="../../public/Image/unnamed.png" 
                alt="Wardrobe" 
                className={styles.heroImage} 
              />
            </div>
          </div>
        </section>

        {/* Clothing Items Grid */}
        <section className={styles.clothingSection}>
          <div className={styles.gridContainer}>
            {items.map(({ id, image, text }) => (
              <div 
                key={id} 
                className={styles.gridItem}
                onClick={() => handleNavigation('/Scan-Camera')}
              >
                <img src={image} alt={text} className={styles.gridImage} />
                <p className={styles.gridText}>{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2025 נבנה בידי פרידי ברזילי ואתי גוטליב. כל הזכויות שמורות.</p>
          <div className={styles.footerLinks}>
            <a 
              href="mailto:bonitique.customer.service@gmail.com" 
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