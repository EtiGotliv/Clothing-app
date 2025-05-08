// src/page/MyClothe/MyClothe.jsx
import React, { useEffect, useState } from 'react';
import LoadingAnimation from '../../components/common/LoadingAnimation/LoadingAnimation.jsx';
import ClothingItem from '../../components/ClothingItem/ClothingItem.jsx';
import styles from './MyClothe.module.css';

const MyClothe = () => {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const url = `${import.meta.env.VITE_SERVER_API_URL}/api/clothes`;

  const fetchClothes = () => {
    const token = localStorage.getItem("authToken");
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": token,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setClothes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClothes();
  }, [url]);

  if (loading) return <LoadingAnimation shouldShow={loading} />;
  if (error) return <div>❌ Error: {error.message}</div>;

  return (
    <div className={styles.home}>
      <h1 className={styles.headline}>הבגדים שלי</h1>
      <div className={styles.clothingGrid}>
        {clothes.length === 0 ? (
          <p>👕 לא נמצאו בגדים להציג</p>
        ) : (
          clothes.map((item) => (
            <ClothingItem key={item._id} item={item} refreshItems={fetchClothes} />
          ))
        )}
      </div>
    </div>
  );
};

export default MyClothe;
