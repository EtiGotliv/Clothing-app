import React, { useRef, useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import styles from './ScanCloset.module.css';
//import Header from '../../components/common/Header/Header';


function ScanCloset() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Error accessing camera: ", err));
    }
  }, []);

  const handleCapture = () => {
    console.log('Capturing photo...');
    setIsCapturing(true);

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    setCapturedImage(canvas.toDataURL()); 
    
    setTimeout(() => setIsCapturing(false), 500); 
  };

  const handleUpload = () => {
    console.log('Opening file upload...');
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
    }
  };

  return (
    <div className={styles.cameraContainer}>
      <div className={styles.preview}>
        {/* Camera Preview */}
        <video ref={videoRef} autoPlay className={styles.cameraPreview} />
        <div className={styles.previewText}>
          <span>Camera Preview</span>
        </div>

        <div className={styles.gridOverlay}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={styles.gridCell} />
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <button onClick={handleUpload} className={styles.uploadButton}>
          <Upload className={styles.uploadIcon} />
        </button>

        <button
          onClick={handleCapture}
          className={`${styles.captureButton} ${isCapturing ? styles.captureButtonActive : ""}`}
        >
          <div className={styles.captureButtonInner} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={handleFileChange}
        />

        <div className={styles.placeholder} />
      </div>

      {capturedImage && (
        <div className={styles.capturedImageContainer}>
          <img src={capturedImage} alt="Captured" className={styles.capturedImage} />
        </div>
      )}

      <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />
    </div>
  );
}

export default ScanCloset;
