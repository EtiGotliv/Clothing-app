import React from 'react';
import styles from './CameraView.module.css';

const CameraView = ({ videoRef, onCapture, onUpload, isCapturing }) => {
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e);
    }
  };

  return (
    <div className={styles.cameraViewContainer}>
      <video ref={videoRef} autoPlay className={styles.cameraPreview} />
      
      <div className={styles.captureOptions}>
        <button
          onClick={onCapture}
          className={styles.captureButton}
          disabled={isCapturing}
        >
          {isCapturing ? 'מעבד...' : '📷 צלם תמונה'}
        </button>
        
        <div className={styles.uploadContainer}>
          <button 
            onClick={() => document.getElementById('fileUpload').click()} 
            className={styles.captureButton}
            style={{ backgroundColor: '#5c6bc0' }}
          >
            🖼️ העלה תמונה
          </button>
          <input
            id="fileUpload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
        </div>
      </div>
    </div>
  );
};

export default CameraView;