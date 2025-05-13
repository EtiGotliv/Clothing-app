import React from 'react';
import items from '../../data/clothingItems.json';
import styles from './GridSection.module.css';

const GridSection = () => (
  <div className={styles.gridContainer}>
    {items.map(({ id, image, text }) => (
      <div key={id} className={styles.gridItem}>
        <img src={image} alt={text} className={styles.gridImage} />
        <p>{text}</p>
      </div>
    ))}
  </div>
);

export default GridSection;
