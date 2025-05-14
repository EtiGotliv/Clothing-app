import React from 'react';
import styles from './CameraView.module.css';

function CameraView({ videoRef, onCapture, isCapturing, onUpload }) {
    const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
        onUpload(file);
    }
    };

    return (
    <div className={styles.cameraControls}>
        <video ref={videoRef} autoPlay className={styles.cameraPreview} />

        <div className={styles.buttonRow}>
        <button onClick={onCapture} className={styles.captureButton} disabled={isCapturing}>
            {isCapturing ? 'מעבד...' : '📷 צלם תמונה'}
        </button>

        <label className={styles.uploadButton}>
            📁 העלה תמונה
            <input type="file" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
        </label>
        </div>
    </div>
    );
}

export default CameraView;

