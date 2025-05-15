import React, { useRef, useState } from 'react';
import styles from './ScanCloset.module.css';
import CameraView from '../../components/CameraView/CameraView';
import CapturedPreview from '../../components/CapturedPreview/CapturedPreview';
import ScanCanvas from '../../components/ScanCanvas/ScanCanvas';
import { useCamera } from './useCamera';
import { useFormHandlers } from './useFormHandlers';

function ScanCloset() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '', tags: '', image: null });
  const [saveStatus, setSaveStatus] = useState('');
  const [aiStatus, setAiStatus] = useState('');
  const [showCamera, setShowCamera] = useState(true);

  const { handleCapture, handleUpload, isCapturing, startCamera } = useCamera(
    videoRef,
    canvasRef,
    setFormData,
    setAiStatus,
    setCapturedImage,
    setShowCamera
  );

  const { handleChange, handleRetake, handleSubmit } = useFormHandlers(
    formData,
    setFormData,
    setCapturedImage,
    setAiStatus,
    setSaveStatus
  );
  
  const handleNewCapture = () => {
    setFormData({ name: '', color: '', tags: '', image: null });
    setSaveStatus('');
    setAiStatus('');
    setCapturedImage(null);
    setShowCamera(true);
    
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const handleNewUpload = (e) => {
    setFormData({ name: '', color: '', tags: '', image: null });
    setSaveStatus('');
    setAiStatus('');
    handleUpload(e);
  };

  return (
    <div className={styles.cameraContainer}>
      <h2 className={styles.pageTitle}>?פריט חדש קנית</h2>
      {showCamera && !capturedImage ? (
        <CameraView
          videoRef={videoRef}
          onCapture={handleCapture}
          onUpload={handleUpload}
          isCapturing={isCapturing}
        />
      ) : (
        <CapturedPreview
          capturedImage={capturedImage}
          formData={formData}
          onChange={handleChange}
          onRetake={handleRetake}
          onSubmit={handleSubmit}
          aiStatus={aiStatus}
          saveStatus={saveStatus}
          onNewCapture={handleNewCapture}
          onNewUpload={handleNewUpload}
        />
      )}
      <ScanCanvas canvasRef={canvasRef} />
    </div>
  );
}

export default ScanCloset;