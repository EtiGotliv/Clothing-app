// src/page/MyClothe/MyClothe.jsx
import React, { useState, useEffect } from 'react';
import styles from './MyClothe.module.css';
import LoadingAnimation from '../../components/common/LoadingAnimation/LoadingAnimation.jsx';

const MyClothe = () => {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ודאי שהכתובת נכונה
  const url = `${import.meta.env.VITE_SERVER_API_URL}/api/clothes`;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log("Token:", token);

    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": token,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched clothes:", data);
        setClothes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err);
        setLoading(false);
      });
  }, [url]);

  if (loading) return <LoadingAnimation shouldShow={loading} />;
  if (error) return <div>❌ שגיאה: {error.message}</div>;

  return (
    <div className={styles.home}>
      <h1 className={styles.headline}>הבגדים שלי</h1>
      <div className={styles.clothingGrid}>
        {clothes.length === 0 ? (
          <p>👕 לא נמצאו בגדים להציג</p>
        ) : (
          clothes.map((item) => (
            <div key={item._id} className={styles.clothingItem}>
              <img
                src={item.image}
                alt={item.name}
                className={styles.clothingImage}
                onError={(e) => (e.target.src = "/Image/placeholder.jpg")}
              />
              <h3>{item.name}</h3>
              <p>🎨 צבע: {item.color}</p>
              {item.tags && item.tags.length > 0 && (
                <p>🏷️ תגיות: {item.tags.join(", ")}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyClothe;
