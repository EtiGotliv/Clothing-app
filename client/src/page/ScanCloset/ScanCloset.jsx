import React, { useRef, useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import styles from './ScanCloset.module.css';

function ScanCloset() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '', tags: '' });

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
    setIsCapturing(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/clothes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: capturedImage, tags: formData.tags.split(',') })
      });
      const data = await response.json();
      console.log("Saved:", data);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <div className={styles.cameraContainer}>
      <video ref={videoRef} autoPlay className={styles.cameraPreview} />
      <button onClick={handleCapture} className={styles.captureButton}>📷 Capture</button>

      {capturedImage && (
        <div>
          <img src={capturedImage} alt="Captured" className={styles.capturedImage} />
          <div>
            <input type="text" name="name" placeholder="Name" onChange={handleChange} />
            <input type="text" name="color" placeholder="Color" onChange={handleChange} />
            <input type="text" name="tags" placeholder="Tags (comma separated)" onChange={handleChange} />
            <button onClick={handleSubmit}>Save</button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />
    </div>
  );
}

export default ScanCloset;
