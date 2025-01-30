import { useState, useEffect } from 'react';
import styles from './MyClothe.module.css';

const MyClothe = () => {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // בדיקת משתנה סביבה מה-ENV
  const API_URL = import.meta.env.VITE_SERVER_API_URL;
  if (!API_URL) {
    console.error('❌ Missing VITE_SERVER_API_URL in .env file');
  }

  useEffect(() => {
    const fetchClothes = async () => {
      try {
        const response = await fetch(`${API_URL}/api/clothing`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setClothes(data);
      } catch (error) {
        console.error('Error fetching clothes:', error);
        setError('טעינה נכשלה, נסה שוב מאוחר יותר.');
      } finally {
        setLoading(false);
      }
    };

    fetchClothes();
  }, [API_URL]);

  if (loading) return <div>טוען...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.home}>
      <h1 className={styles.headline}>הבגדים שלי</h1>
      <div className={styles.clothingGrid}>
        {clothes.map((item) => (
          <div key={item.id} className={styles.clothingItem}>
            <img 
              src={item.image} 
              alt={item.name} 
              className={styles.clothingImage}
            />
            <h3>{item.name}</h3>
            <p>צבע: {item.color}</p>
            {item.tags && item.tags.length > 0 && (
              <p>תגיות: {item.tags.join(', ')}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyClothe;
