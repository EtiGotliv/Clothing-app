import imageCompression from 'browser-image-compression';
import styles from './ScanCloset.module.css';
import React, { useRef, useState } from 'react';
import CameraView from '../../components/CameraView/CameraView';
import CapturedPreview from '../../components/CapturedPreview/CapturedPreview';
import ScanCanvas from '../../components/ScanCanvas/ScanCanvas';
import { useCamera } from './useCamera';
import { useFormHandlers } from './useFormHandlers';

function ScanCloset() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '', tags: '' });
  const [saveStatus, setSaveStatus] = useState('');
  const [aiStatus, setAiStatus] = useState('');

  const { handleCapture, handleUpload, isCapturing } = useCamera(
    videoRef,
    canvasRef,
    setFormData,
    setAiStatus,
    setCapturedImage
  );

  const { handleChange, handleRetake, handleSubmit } = useFormHandlers(
    formData,
    setFormData,
    setCapturedImage,
    setAiStatus,
    setSaveStatus
  );

  return (
    <div className={styles.cameraContainer}>
      <h2 className={styles.pageTitle}>?פריט חדש קנית</h2>
      {!capturedImage ? (
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
        />
      )}
      <ScanCanvas canvasRef={canvasRef} />
    </div>
  );
}

export default ScanCloset;
