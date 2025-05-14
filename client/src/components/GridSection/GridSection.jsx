import React from 'react';
import items from '../../data/clothingItems.json';
import { useNavigate } from 'react-router-dom';
import styles from './GridSection.module.css';

const GridSection = () => {
  const navigate = useNavigate();

  const handleScanClick = () => {
    navigate('/Scan-Camera');
  };

  return (
    <div className={styles.gridContainer}>
      {items.map(({ id, image, text }) => (
        <div key={id} className={styles.gridItem}>
          <img src={image} alt={text} className={styles.gridImage} />
          <p className={styles.gridText}>{text}</p>
          <button className={styles.scanButton} onClick={handleScanClick}>
            לסריקה
          </button>
        </div>
      ))}
    </div>
  );
};

export default GridSection;
