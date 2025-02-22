// src/page/CategoryPage/CategoryPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./CategoryPage.module.css";
import LoadingAnimation from "../../components/common/LoadingAnimation/LoadingAnimation.jsx";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        // נוודא שהתשובה היא מערך
        setItems(Array.isArray(data) ? data : data ? [data] : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [categoryName]);

  if (loading) return <LoadingAnimation shouldShow={true} />;
  if (error) return <div>❌ Error: {error}</div>;
  if (!items || items.length === 0) return <div>אין בגדים להצגה</div>;

  return (
    <div className={styles.categoryPage}>
      <h2>קטגוריה: {categoryName}</h2>
      <ul className={`${styles.itemsGrid} results-list`}>
        {items.map((item) => (
          <li key={item._id} className={styles.itemCard}>
            <img src={item.image} alt={item.name} />
            <p>{item.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryPage;
