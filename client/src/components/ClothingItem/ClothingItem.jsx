// src/components/ClothingItem/ClothingItem.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ClothingItem.module.css';

const ClothingItem = ({ item }) => {
  const navigate = useNavigate();

  const handleItemClick = () => {
    navigate(`/clothing-details/${item._id}`);
  };

  return (
    <div className={styles.clothingItem} onClick={handleItemClick}>
      <img
        src={item.image}
        alt={item.name}
        className={styles.image}
      />
      <div className={styles.overlay}>
        <h3 className={styles.itemName}>{item.name}</h3>
        <p className={styles.itemColor}>{item.color}</p>
      </div>
    </div>
  );
};

export default ClothingItem;