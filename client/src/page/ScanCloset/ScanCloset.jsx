import imageCompression from 'browser-image-compression';

function ScanCloset() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '', tags: '' });
  const [saveStatus, setSaveStatus] = useState('');

  const userId = localStorage.getItem('authToken') || '67b31f23fb4864c43330f8ac';

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Error accessing camera: ", err));
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

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
  
    // שמירה של התמונה כ-Blob
    canvas.toBlob((blob) => {
      if (blob) {
        // דחיסת התמונה
        imageCompression(blob, {
          maxSizeMB: 1,
          maxWidthOrHeight: 500,
          useWebWorker: true,
        }).then((compressedBlob) => {
          const dataUrl = URL.createObjectURL(compressedBlob); // יצירת DataURL מה-BLOB הדחוס
          setCapturedImage(dataUrl);
          setIsCapturing(false);
        }).catch((error) => {
          console.error("Error compressing image:", error);
          setIsCapturing(false);
        });
      }
    }, 'image/jpeg');
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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