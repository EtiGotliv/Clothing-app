import React from 'react';
import styles from './CapturedPreview.module.css';

const CapturedPreview = ({
  capturedImage,
  formData,
  onChange,
  onRetake,
  onSubmit,
  aiStatus,
  saveStatus,
  onNewCapture,
  onNewUpload
}) => {
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onNewUpload(e);
    }
  };

  return (
    <div className={styles.capturedContainer}>
      <img src={capturedImage} alt="Captured" className={styles.capturedImage} />
      
      <div className={styles.formContainer}>
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="שם הפריט (חובה)"
          onChange={onChange}
          className={styles.input}
          required
        />
        <input
          type="text"
          name="color"
          value={formData.color}
          placeholder="צבע"
          onChange={onChange}
          className={styles.input}
        />
        <input
          type="text"
          name="tags"
          value={formData.tags}
          placeholder="תגיות (מופרדות בפסיק)"
          onChange={onChange}
          className={styles.input}
        />

        {aiStatus && (
          <div className={styles.aiMessage}>{aiStatus}</div>
        )}

        <button
          onClick={onSubmit}
          className={styles.saveButton}
          disabled={!formData.name}
        >
          שמור פריט
        </button>

        {saveStatus && (
          <div className={saveStatus.includes('שגיאה') || saveStatus.includes('❌') ? 
            styles.errorMessage : 
            styles.successMessage}>
            {saveStatus}
          </div>
        )}
        
        <div className={styles.newItemOptions}>
          <h3>רוצה להוסיף פריט {saveStatus.includes('✅') ? 'נוסף' : 'אחר'}?</h3>
          <div className={styles.newItemButtons}>
            <button
              onClick={onNewCapture}
              className={styles.captureButton}
            >
              📷 צלם תמונה חדשה
            </button>
            
            <button 
              onClick={() => document.getElementById('newFileUpload').click()} 
              className={styles.captureButton}
              style={{ backgroundColor: '#5c6bc0' }}
            >
              🖼️ העלה תמונה חדשה
            </button>
            <input
              id="newFileUpload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapturedPreview;