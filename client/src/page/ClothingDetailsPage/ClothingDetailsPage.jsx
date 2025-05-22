// src/page/ClothingDetailsPage/ClothingDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingAnimation from '../../components/common/LoadingAnimation/LoadingAnimation.jsx';
import styles from './ClothingDetailsPage.module.css';

const ClothingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '',
    image: '',
    tags: ''
  });

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/clothes/${id}`, {
        headers: { 'x-user-id': localStorage.getItem('authToken') },
      });
      setItem(response.data);
      setFormData({
        name: response.data.name,
        color: response.data.color,
        image: response.data.image,
        tags: response.data.tags.join(', ')
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching item:', error);
      toast.error('שגיאה בטעינת הפריט');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("האם את בטוחה שברצונך למחוק פריט זה?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8080/api/clothes/delete/${item._id}`, {
          headers: { 'x-user-id': localStorage.getItem('authToken') },
        });
        toast.success('הפריט נמחק בהצלחה!');
        navigate('/clothes');
      } catch (error) {
        toast.error('שגיאה במחיקה: ' + error.message);
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
      toast.success('הפריט עודכן בהצלחה!');
      setIsEditing(false);
      fetchItem(); // רענון הנתונים
    } catch (error) {
      toast.error('שגיאה בעדכון: ' + error.message);
    }
  };

  const handleBack = () => {
    navigate('/clothes');
  };

  if (loading) return <LoadingAnimation shouldShow={loading} />;
  if (!item) return <div className={styles.error}>הפריט לא נמצא</div>;

  return (
    <div className={styles.container}>
      <button onClick={handleBack} className={styles.backButton}>
        ← חזרה לבגדים
      </button>
      
      <div className={styles.content}>
        <div className={styles.imageSection}>
          <img src={item.image} alt={item.name} className={styles.mainImage} />
        </div>

        <div className={styles.detailsSection}>
          {!isEditing ? (
            <div className={styles.viewMode}>
              <h1 className={styles.title}>{item.name}</h1>
              <div className={styles.detail}>
                <span className={styles.label}>🎨 צבע:</span>
                <span className={styles.value}>{item.color}</span>
              </div>
              {item.tags.length > 0 && (
                <div className={styles.detail}>
                  <span className={styles.label}>🏷️ תגיות:</span>
                  <div className={styles.tags}>
                    {item.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={styles.actions}>
                <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                  ✏️ עריכה
                </button>
                <button onClick={handleDelete} className={styles.deleteButton}>
                  🗑️ מחיקה
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.editMode}>
              <h1>עריכת פריט</h1>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>שם:</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>צבע:</label>
                <input 
                  type="text" 
                  value={formData.color} 
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>תגיות (מופרדות בפסיק):</label>
                <input 
                  type="text" 
                  value={formData.tags} 
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.editActions}>
                <button onClick={handleEditSubmit} className={styles.saveButton}>
                  ✅ שמירה
                </button>
                <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>
                  ❌ ביטול
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClothingDetailsPage;