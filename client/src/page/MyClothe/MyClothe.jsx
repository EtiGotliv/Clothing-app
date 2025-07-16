import React, { useState } from 'react';
import LoadingAnimation from '../../components/common/LoadingAnimation/LoadingAnimation.jsx';
import ClothingItem from '../../components/ClothingItem/ClothingItem.jsx';
import ClothingFilters from '../../components/ClothingFilters/ClothingFilters.jsx';
import styles from './MyClothe.module.css';
import { useClothes } from './useClothes';

const MyClothe = () => {
  const url = `${import.meta.env.VITE_SERVER_API_URL}/api/clothes`;
  const { clothes, loading, error } = useClothes(url);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: [], color: [], event: [] });

  const toggleFilters = () => setShowFilters(prev => !prev);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => setFilters({ type: [], color: [], event: [] });

  const getUniqueNames = () => [...new Set(clothes.map(item => item.name).filter(Boolean))];

  const getUniqueColors = () => {
    const allColors = clothes.flatMap(item => item.color?.split(',') || []);
    return [...new Set(allColors.map(c => c.trim()).filter(Boolean))];
  };

  const getUniqueEvents = () => {
    const validEvents = ['elegant', 'casual', 'אלגנט', 'קז\'ואל'];
    return [...new Set(
      clothes
        .flatMap(item => item.tags || [])
        .filter(tag => validEvents.includes(tag.toLowerCase()))
    )];
  };

  const types = getUniqueNames();
  const rawColors = getUniqueColors();
  const events = getUniqueEvents();

  const filteredClothes = clothes.filter((item) => {
    const itemName = item.name;
    const itemColors = item.color?.toLowerCase().split(',').map(c => c.trim()) || [];
    const itemTags = item.tags || [];

    return (
      (filters.type.length === 0 || filters.type.includes(itemName)) &&
      (filters.color.length === 0 || filters.color.some(c => itemColors.includes(c))) &&
      (filters.event.length === 0 || filters.event.some(e => itemTags.map(t => t.toLowerCase()).includes(e)))
    );
  });

  if (loading) return <LoadingAnimation shouldShow={loading} />;
  if (error) return <div>❌ Error: {error.message}</div>;

  return (
    <div className={`${styles.home} ${showFilters ? styles.withSidebar : ''}`}>
      <div className={styles.headerRow}>
        <h1 className={styles.headline}>הבגדים שלי</h1>
        <button className={styles.filterToggle} onClick={toggleFilters}>☰</button>
      </div>

      <ClothingFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={clearFilters}
        isOpen={showFilters}
        onToggle={toggleFilters}
        types={types}
        colors={rawColors}
        events={events}
      />

      <div className={styles.content}>
        <div className={styles.clothingGrid}>
          {filteredClothes.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>לא נמצאו בגדים להציג</p>
              <p className={styles.emptySubtext}>!התחיל/י להוסיף בגדים לארון שלך</p>
            </div>
          ) : (
            filteredClothes.map((item) => (
              <ClothingItem key={item._id} item={item} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyClothe;
