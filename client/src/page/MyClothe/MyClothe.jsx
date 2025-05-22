// src/page/MyClothe/MyClothe.jsx
import React from 'react';
import LoadingAnimation from '../../components/common/LoadingAnimation/LoadingAnimation.jsx';
import ClothingItem from '../../components/ClothingItem/ClothingItem.jsx';
import styles from './MyClothe.module.css';
import { useClothes } from './useClothes';

const MyClothe = () => {
  const url = `${import.meta.env.VITE_SERVER_API_URL}/api/clothes`;
  const { clothes, loading, error } = useClothes(url);

  if (loading) return <LoadingAnimation shouldShow={loading} />;
  if (error) return <div>❌ Error: {error.message}</div>;

  return (
    <div className={styles.home}>
      <h1 className={styles.headline}>הבגדים שלי</h1>
      <div className={styles.clothingGrid}>
        {clothes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👕</div>
            <p className={styles.emptyText}>לא נמצאו בגדים להציג</p>
            <p className={styles.emptySubtext}>התחילי להוסיף בגדים לארון שלך!</p>
          </div>
        ) : (
          clothes.map((item) => (
            <ClothingItem key={item._id} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

export default MyClothe;