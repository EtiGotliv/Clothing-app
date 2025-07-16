import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClothingFilters from "../../components/ClothingFilters/ClothingFilters.jsx";
import LoadingAnimation from "../../components/common/LoadingAnimation/LoadingAnimation.jsx";
import styles from "./CategoryPage.module.css";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ color: [], event: [] });
  const [showFilters, setShowFilters] = useState(false);

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
        if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        const loaded = Array.isArray(data) ? data : data ? [data] : [];
        setItems(loaded);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [categoryName]);

  const getUniqueColors = () => {
    const all = items.flatMap(item => item.color?.split(',') || []);
    return [...new Set(all.map(c => c.trim().toLowerCase()).filter(Boolean))];
  };

  const getUniqueEvents = () => {
    const validEvents = ['elegant', 'casual', 'אלגנט', 'קז\'ואל'];
    return [...new Set(
      items.flatMap(item => item.tags || []).filter(tag => validEvents.includes(tag.toLowerCase()))
    )];
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => setFilters({ color: [], event: [] });

  const filteredItems = items.filter((item) => {
    const itemColors = item.color?.toLowerCase().split(',').map(c => c.trim()) || [];
    const itemTags = item.tags || [];

    return (
      (filters.color.length === 0 || filters.color.some(c => itemColors.includes(c))) &&
      (filters.event.length === 0 || filters.event.some(e => itemTags.map(t => t.toLowerCase()).includes(e)))
    );
  });

  if (loading) return <LoadingAnimation shouldShow={true} />;
  if (error) return <div className={styles.error}>❌ שגיאה: {error}</div>;

  return (
    <div className={`${styles.categoryPage} ${showFilters ? styles.withSidebar : ''}`}>
      <div className={styles.headerRow}>
        <h2 className={styles.categoryTitle}>קטגוריה: <span>{categoryName}</span></h2>
        <button className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>☰</button>
      </div>

      <ClothingFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={clearFilters}
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
        types={[]} // לא צריך להציג סוג
        colors={getUniqueColors()}
        events={getUniqueEvents()}
      />

      <div className={styles.content}>
        {filteredItems.length === 0 ? (
          <div className={styles.noResults}>
            <span role="img" aria-label="no-clothes" className={styles.noResultsIcon}>😥</span>
            <p>אין בגדים להצגה</p>
            <small>נסי לחפש קטגוריה אחרת</small>
            <button className={styles.backButton} onClick={() => navigate('/home')}>חזרה</button>
          </div>
        ) : (
          <ul className={styles.itemsGrid}>
            {filteredItems.map((item) => (
              <li key={item._id} className={styles.itemCard}>
                <div className={styles.imageWrapper}>
                  <img src={item.image} alt={item.name} className={styles.img} />
                </div>
                <p className={styles.itemName}>{item.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
