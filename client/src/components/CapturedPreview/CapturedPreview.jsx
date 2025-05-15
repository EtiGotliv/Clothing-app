import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onNewUpload(e);
    }
  };

  const isItemSaved = saveStatus.includes('✅') || saveStatus.includes('נשמר') || saveStatus.includes('נשמר בהצלחה');

  const goToClothes = () => {
    navigate('/clothes');
  };

  return (
    <div className={styles.capturedContainer}>
      {!isItemSaved && (
        <>
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

            <div className={styles.actionButtons}>
              <button
                onClick={onSubmit}
                className={styles.saveButton}
                disabled={!formData.name}
              >
                📥 שמור פריט
              </button>

              <button
                onClick={onNewCapture}
                className={styles.newCaptureButton}
              >
                📷 צלם תמונה חדשה
              </button>
            </div>
          </div>
        </>
      )}

      {isItemSaved && (
        <div className={styles.successContainer}>
          <div className={styles.successMessage}>
            ✅ הפריט נשמר בהצלחה!
          </div>

          <div className={styles.afterSaveButtons}>
            <button
              onClick={goToClothes}
              className={styles.goToClothesButton}
            >
              👗 עבור לבגדים שלי
            </button>

            <button
              onClick={onNewCapture}
              className={styles.addNewItemButton}
            >
              ➕ הוסף פריט חדש
            </button>
          </div>
        </div>
      )}

      <input
        id="newFileUpload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className={styles.fileInput}
      />
    </div>
  );
};

export default CapturedPreview;
