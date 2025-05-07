import imageCompression from 'browser-image-compression';
import React, { useEffect, useRef, useState } from 'react';
import styles from './ScanCloset.module.css';

function ScanCloset() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '', tags: '' });
  const [saveStatus, setSaveStatus] = useState('');
  const [stream, setStream] = useState(null);

  const userId = localStorage.getItem('authToken') || '67b31f23fb4864c43330f8ac';

  const startCamera = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
      setStream(videoStream);
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }

    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [capturedImage]);

  const handleCapture = () => {
    console.log("🎥 handleCapture clicked");
    setIsCapturing(true);
  
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
  
    if (!canvas || !context || !videoRef.current) {
      console.error("❌ Missing canvas/context/videoRef");
      setIsCapturing(false);
      return;
    }
  
    if (!videoRef.current.srcObject || !videoRef.current.srcObject.active) {
      console.error("❌ Video stream not active");
      setIsCapturing(false);
      return;
    }
  
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    console.log("🖼️ Image drawn to canvas");
  
    canvas.toBlob(async (blob) => {
      console.log("📦 Got blob:", blob);
      if (blob) {
        try {
          const compressedBlob = await imageCompression(blob, {
            maxSizeMB: 1,
            maxWidthOrHeight: 500,
            useWebWorker: true,
          });
  
          console.log("🗜️ Compressed blob:", compressedBlob);
  
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result;
            console.log("📡 Base64 result length:", base64data?.length);
            setCapturedImage(base64data);
            setIsCapturing(false);
            
            if (stream) {
              const tracks = stream.getTracks();
              tracks.forEach(track => track.stop());
              setStream(null);
            }
          };
          reader.readAsDataURL(compressedBlob);
        } catch (error) {
          console.error("❌ Error compressing image:", error);
          setIsCapturing(false);
        }
      } else {
        console.error("❌ Failed to get blob from canvas");
        setIsCapturing(false);
      }
    }, 'image/jpeg');
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !capturedImage) {
      setSaveStatus('נא למלא שם ולצלם תמונה');
      return;
    }

    setSaveStatus('שומר...');
    
    try {
      const response = await fetch("http://localhost:8080/api/clothes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({
          ...formData,
          image: capturedImage,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
        })
      });

      console.log("📤 Sending request with headers:", { "x-user-id": userId });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("⛔ Server response:", response.status, errorData);
        throw new Error(`שגיאה ${response.status}: ${errorData?.message || 'שגיאה בשמירת פריט'}`);
      }
      
      const data = await response.json();
      console.log("✅ Saved:", data);
      
      setFormData({ name: '', color: '', tags: '' });
      setCapturedImage(null);
      setSaveStatus('הפריט נשמר בהצלחה!');
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error("❌ Error saving data:", error);
      setSaveStatus(`שגיאה: ${error.message}`);
    }
  };

  return (
    <div className={styles.cameraContainer}>
      <h2>הוספת פריט לארון</h2>
      
      {!capturedImage ? (
        <>
          <video ref={videoRef} autoPlay className={styles.cameraPreview} />
          <button
            onClick={handleCapture}
            className={styles.captureButton}
            disabled={isCapturing}
          >
            {isCapturing ? 'מעבד...' : '📷 צלם תמונה'}
          </button>
        </>
      ) : (
        <div className={styles.capturedContainer}>
          <img src={capturedImage} alt="Captured" className={styles.capturedImage} />
          <button onClick={handleRetake} className={styles.retakeButton}>
            צלם שוב
          </button>
          
          <div className={styles.formContainer}>
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="שם הפריט (חובה)"
              onChange={handleChange}
              className={styles.input}
              required
            />
            <input
              type="text"
              name="color"
              value={formData.color}
              placeholder="צבע"
              onChange={handleChange}
              className={styles.input}
            />
            <input
              type="text"
              name="tags"
              value={formData.tags}
              placeholder="תגיות (מופרדות בפסיקים)"
              onChange={handleChange}
              className={styles.input}
            />
            <button
              onClick={handleSubmit}
              className={styles.saveButton}
              disabled={!formData.name}
            >
              שמור פריט
            </button>
            
            {saveStatus && (
              <div className={saveStatus.includes('שגיאה') ? styles.errorMessage : styles.successMessage}>
                {saveStatus}
              </div>
            )}
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />
    </div>
  );
}

export default ScanCloset;