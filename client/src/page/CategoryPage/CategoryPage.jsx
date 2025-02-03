import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./CategoryPage.module.css";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8080/api/clothes/search?query=${categoryName}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [categoryName]);

  return (
    <div className={styles.categoryPage}>
      <h2>קטגוריה: {categoryName}</h2>

      {loading && <div>⏳ טוען...</div>}
      {error && <div>❌ שגיאה: {error}</div>}

      <div className={styles.itemsGrid}>
        {items.map((item) => (
          <div key={item._id} className={styles.itemCard}>
            <img src={item.image} alt={item.name} />
            <p>{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
