// src/components/ClothingItem/ClothingItem.jsx
import React, { useState } from 'react';
import axios from 'axios';
import styles from './ClothingItem.module.css';

const ClothingItem = ({ item, refreshItems }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: item.name,
    color: item.color,
    image: item.image,
    tags: item.tags.join(', ')
  });

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8080/api/clothes/delete/${item._id}`, {
          headers: { 'x-user-id': localStorage.getItem('authToken') },
        });
        alert('Item deleted successfully!');
        refreshItems();
      } catch (error) {
        alert('Delete failed: ' + error.message);
      }
    }
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://localhost:8080/api/clothes/update/${item._id}`, {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim())
      }, {
        headers: { 'x-user-id': localStorage.getItem('authToken') },
      });
      alert('Item updated successfully!');
      setIsEditing(false);
      refreshItems();
    } catch (error) {
      alert('Update failed: ' + error.message);
    }
  };

  return (
    <div className={styles.clothingItem}>
      <img
        src={item.image}
        alt={item.name}
        className={styles.image}
        onClick={() => setExpanded(!expanded)}
      />

      {expanded && !isEditing && (
        <div className={styles.details}>
          <h3>{item.name}</h3>
          <p>🎨 Color: {item.color}</p>
          {item.tags.length > 0 && <p>🏷️ Tags: {item.tags.join(', ')}</p>}
          <button onClick={() => setIsEditing(true)}>Edit ✏️</button>
          <button onClick={handleDelete}>Delete 🗑️</button>
        </div>
      )}

      {expanded && isEditing && (
        <div className={styles.editForm}>
          <label>Name:</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

          <label>Color:</label>
          <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />

          <label>Tags (comma-separated):</label>
          <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />

          <button onClick={handleEditSubmit}>Update ✅</button>
          <button onClick={() => setIsEditing(false)}>Cancel ❌</button>
        </div>
      )}
    </div>
  );
};

export default ClothingItem;
