import React from 'react';
import styles from './CapturedPreview.module.css';

function CapturedPreview({ capturedImage, formData, onChange, onRetake, onSubmit, aiStatus, saveStatus }) {
    return (
    <div className={styles.capturedContainer}>
        <img src={capturedImage} alt="Captured" className={styles.capturedImage} />
        <button onClick={onRetake} className={styles.retakeButton}>צלם מחדש</button>
        <div className={styles.formContainer}>
        <input name="name" value={formData.name} onChange={onChange} placeholder="שם (חובה)" required />
        <input name="color" value={formData.color} onChange={onChange} placeholder="צבע" />
        <input name="tags" value={formData.tags} onChange={onChange} placeholder="תגיות (פסיקים)" />
        {aiStatus && <div className={styles.aiMessage}>{aiStatus}</div>}
        <button onClick={onSubmit} disabled={!formData.name}>שמור פריט</button>
        {saveStatus && <div className={saveStatus.includes('שגיאה') ? styles.errorMessage : styles.successMessage}>{saveStatus}</div>}
        </div>
    </div>
    );
}

export default CapturedPreview;
