import React from 'react';
import looks from '../../data/lookCombinations.json'; // קובץ חדש שמכיל שילובים
import { useNavigate } from 'react-router-dom';
import styles from './GridSection.module.css';

const GridSection = () => {
  const navigate = useNavigate();

  const handleScanClick = () => {
    navigate('/Scan-Camera');
  };

  return (
    <div className={styles.gridContainer}>
      {looks.map(({ id, items }) => (
        <div key={id} className={styles.gridItem}>
          <div className={styles.lookImages}>
            {items.map(({ image, text }, index) => (
              <div key={index} className={styles.lookItem}>
                <img src={image} alt={text} className={styles.gridImage} />
                <p className={styles.gridText}>{text}</p>
              </div>
            ))}
          </div>
          <button className={styles.scanButton} onClick={handleScanClick}>
            לסריקה
          </button>
        </div>
      ))}
    </div>
  );
};

export default GridSection;
