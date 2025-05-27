import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import axios from 'axios';
import styles from './Favorites.module.css';
import { FaHeart } from 'react-icons/fa';

function Favorites() {
  const [looks, setLooks] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/looks/favorites", {
          headers: { "x-user-id": userId }
        });
        setLooks(res.data.looks || []);
      } catch (err) {
        console.error("❌ שגיאה בטעינת מועדפים:", err);
      }
    };

    if (userId) {
      fetchFavs();
    }
  }, [userId]);

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h2 className={styles.title}>הלוקים האהובים עליי 💖</h2>

        {looks.length === 0 ? (
          <p className={styles.empty}>אין עדיין לוקים מועדפים 😢</p>
        ) : (
          <div className={styles.grid}>
            {looks.map((look, idx) => (
              <div key={idx} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.season}>{look.season}</span>
                  <FaHeart className={styles.heartIcon} />
                </div>
                <div className={styles.style}>סגנון: {look.style}</div>
                <div className={styles.images}>
                  {look.items.map((item, i) => (
                    <img
                      key={i}
                      src={item.image}
                      alt={`פריט ${i + 1}`}
                      className={styles.thumb}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;
