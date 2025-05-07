import imageCompression from 'browser-image-compression';
import React, { useEffect, useRef, useState } from 'react';
import styles from './ScanCloset.module.css';
import { analyzeImageFromAI } from '../../../api/aiService';

function ScanCloset() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '', tags: '' });
  const [saveStatus, setSaveStatus] = useState('');
  const [aiStatus, setAiStatus] = useState('');
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
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage]);

  const handleCapture = () => {
    setIsCapturing(true);
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!canvas || !context || !videoRef.current) {
      console.error("❌ Missing canvas/context/videoRef");
      setIsCapturing(false);
      return;
    }

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("❌ Failed to get blob from canvas");
        setIsCapturing(false);
        return;
      }

      try {
        const compressedBlob = await imageCompression(blob, {
          maxSizeMB: 1,
          maxWidthOrHeight: 500,
          useWebWorker: true,
        });

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result;
          setCapturedImage(base64data);
          setIsCapturing(false);

          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
          }

          try {
            // Send image to AI for analysis
            const file = new File([compressedBlob], 'image.jpg', { type: 'image/jpeg' });
            const aiResult = await analyzeImageFromAI(file);
            
            // בדוק אם התוצאה היא כבר אובייקט
            const parsed = typeof aiResult === 'string' ? JSON.parse(aiResult) : aiResult;

            console.log("AI Result:", parsed); // הוסף לוג לדיבוג

            if (parsed && typeof parsed === 'object') {
              // הוסף בדיקות מקיפות יותר
              const name = parsed.name || '';
              const color = parsed.color || '';
              // צור רשימת תגים מהעונה והאירוע, רק אם הם קיימים
              const tagList = [];
              if (parsed.season) tagList.push(parsed.season);
              if (parsed.event) tagList.push(parsed.event);
              const tags = tagList.join(',');

              setFormData({
                name: name, // הוסף את שם הפריט אם קיים
                color,
                tags
              });

              // הודע למשתמש על הצלחה מלאה או חלקית
              if (name || color || tags) {
                setAiStatus('✅ פרטים זוהו ומולאו אוטומטית');
              } else {
                setAiStatus('⚠️ לא זוהו פרטים מהתמונה - אנא מלא ידנית');
              }
            } else {
              throw new Error("פורמט AI לא תקין");
            }
          } catch (err) {
            console.warn("⚠️ AI נכשל או החזיר נתונים לא תקינים:", err);
            setAiStatus('⚠️ ניתוח הפריט נכשל - אנא מלא את הפרטים ידנית');
          }
        };
        reader.readAsDataURL(compressedBlob);
      } catch (error) {
        console.error("❌ שגיאה בדחיסת התמונה:", error);
        setIsCapturing(false);
      }
    }, 'image/jpeg');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setFormData({ name: '', color: '', tags: '' });
    setAiStatus('');
  };

  const handleSubmit = async () => {
    if (!formData.name || !capturedImage) {
      setSaveStatus('אנא הוסף שם וצלם תמונה');
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`שגיאה ${response.status}: ${errorData?.message || 'שמירת הפריט נכשלה'}`);
      }

      const data = await response.json();
      setFormData({ name: '', color: '', tags: '' });
      setCapturedImage(null);
      setSaveStatus('הפריט נשמר בהצלחה!');
      setAiStatus('');

      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error("❌ שגיאה בשמירת הנתונים:", error);
      setSaveStatus(`שגיאה: ${error.message}`);
    }
  };

  return (
    <div className={styles.cameraContainer}>
      <h2>הוסף פריט לארון</h2>

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
            צלם מחדש
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
              placeholder="תגיות (מופרדות בפסיק)"
              onChange={handleChange}
              className={styles.input}
            />

            {aiStatus && (
              <div className={styles.aiMessage}>{aiStatus}</div>
            )}

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