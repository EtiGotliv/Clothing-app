import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../../page/MyClothe/MyClothe.module.css';

const ClothingFilters = ({ filters, onChange, onClear, isOpen, onToggle, types, colors, events }) => {
  const [showMore, setShowMore] = useState({
    type: false,
    color: false,
    event: false,
  });

  const toggleShowMore = (field) => {
    setShowMore((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleMultiSelect = (field, value) => {
    const current = filters[field];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ target: { name: field, value: updated } });
  };

  const renderTagList = (items, field) => {
    const visibleItems = showMore[field] ? items : items.slice(0, 4);
    return (
      <>
        <div className={styles.tagList}>
          {visibleItems.map((item) => (
            <div
              key={item}
              className={`${styles.tag} ${filters[field].includes(item) ? styles.selected : ''}`}
              onClick={() => handleMultiSelect(field, item)}
            >
              {item} {filters[field].includes(item) && <span className={styles.x}>×</span>}
            </div>
          ))}
        </div>
        {items.length > 4 && (
          <button className={styles.toggleExtraBtn} onClick={() => toggleShowMore(field)}>
            {showMore[field] ? 'הסתר' : 'עוד'}
          </button>
        )}
      </>
    );
  };

  const uniqueColors = Array.from(new Set(
    colors
      .flatMap(color => color.split(',').map(c => c.trim().toLowerCase()))
      .filter(Boolean)
  ));

  return (
    <div className={`${styles.filterPanel} ${isOpen ? styles.open : ''}`}>
      <h3>סוג בגד</h3>
      {renderTagList(types, 'type')}

      <h3>צבע</h3>
      {renderTagList(uniqueColors, 'color')}

      <h3>אירוע</h3>
      {renderTagList(events, 'event')}

      <button onClick={onClear} className={styles.clearBtn}>נקה פילטרים</button>
    </div>
  );
};

ClothingFilters.propTypes = {
  filters: PropTypes.shape({
    type: PropTypes.arrayOf(PropTypes.string).isRequired,
    color: PropTypes.arrayOf(PropTypes.string).isRequired,
    event: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  events: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ClothingFilters;
