import { useState, useEffect } from 'react';
import styles from './MyClothe.module.css';
import useApi from '../../hooks/useApi.jsx';

const MyClothe = () => {
  const url = `${import.meta.env.VITE_SERVER_API_URL}/api/clothes`;
  console.log(`📡 Fetching from: ${url}`); // בדיקת ה-URL

  const { data: clothes, loading, error } = useApi(url);

  if (loading) return <div>⏳ טוען...</div>;
  if (error) return <div>❌ שגיאה: {error.message}</div>;

  console.log('👕 Clothes Data:', clothes); // בדיקת הנתונים מה-DB

  return (
    <div className={styles.home}>
      <h1 className={styles.headline}>הבגדים שלי</h1>
      <div className={styles.clothingGrid}>
        {(!clothes || clothes.length === 0) ? (
          <p>👕 לא נמצאו בגדים להציג</p>
        ) : (
          clothes.map((item) => {
            return (
              <div key={item._id} className={styles.clothingItem}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className={styles.clothingImage}
                  onError={(e) => e.target.src = "/Image/placeholder.jpg"} // תמונת ברירת מחדל במקרה של שגיאה
                />
                <h3>{item.name}</h3>
                <p>🎨 צבע: {item.color}</p>
                {item.tags && item.tags.length > 0 && (
                  <p>🏷️ תגיות: {item.tags.join(', ')}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyClothe;
