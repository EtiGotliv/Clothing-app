import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingAnimation from "../../components/common/LoadingAnimation/LoadingAnimation.jsx";
import styles from "./CategoryPage.module.css";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    fetch(`http://localhost:8080/api/clothes/search?query=${encodeURIComponent(categoryName)}`, {
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
        setItems(Array.isArray(data) ? data : data ? [data] : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [categoryName]);

  if (loading) return <LoadingAnimation shouldShow={true} />;
  if (error) return <div className={styles.error}>❌ שגיאה: {error}</div>;

  if (!items || items.length === 0)
    return (
      <div className={styles.noResults}>
        <span role="img" aria-label="no-clothes" className={styles.noResultsIcon}>😥</span>
        <p>אין בגדים להצגה</p>
        <small>נסו לחפש קטגוריה אחרת</small>
        <button className={styles.backButton} onClick={() => navigate('/home')}>
          חזרה לדף הבית
        </button>
      </div>
    );

  return (
    <div className={styles.categoryPage}>
      <h2 className={styles.categoryTitle}>
        קטגוריה: <span>{categoryName}</span>
      </h2>
      <ul className={styles.itemsGrid}>
        {items.map((item) => (
          <li key={item._id} className={styles.itemCard}>
            <div className={styles.imageWrapper}>
              <img src={item.image} alt={item.name} />
            </div>
            <p className={styles.itemName}>{item.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryPage;
