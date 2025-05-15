import { useEffect, useState } from 'react';
import { analyzeImageFromAI } from '../../../api/aiService';

const compressImage = async (blob) => {
    try {

    return blob;
    } catch (error) {
    console.error("Image compression error:", error);
    return blob;
    }
};

const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
    });
};

export const useCamera = (videoRef, canvasRef, setFormData, setAiStatus, setCapturedImage, setShowCamera) => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [stream, setStream] = useState(null);

    const startCamera = async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            
            const videoStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" }
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = videoStream;
                videoRef.current.play().catch(err => console.error("Error playing video:", err));
            }
            
            setStream(videoStream);
            setShowCamera(true);
            console.log("Camera started successfully");
            
        } catch (err) {
            console.error("Error accessing camera: ", err);
            setShowCamera(true);
        }
    };

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const processAI = async (file) => {
        try {
            setAiStatus('⏳ מנתח את התמונה...');
            
            if (!file || !(file instanceof File || file instanceof Blob)) {
                throw new Error("קובץ לא תקין");
            }
            
            const aiResult = await analyzeImageFromAI(file);
            console.log("Raw AI Result:", aiResult);
            
            let parsed;
            if (typeof aiResult === 'string') {
                try {
                    parsed = JSON.parse(aiResult);
                } catch (parseError) {
                    console.error("JSON Parse Error:", parseError);
                    if (aiResult && aiResult.trim()) {
                        const textResponse = aiResult.trim();
                        const nameMatch = textResponse.match(/name[:\s]+([^\n,]+)/i);
                        const colorMatch = textResponse.match(/color[:\s]+([^\n,]+)/i);
                        const seasonMatch = textResponse.match(/season[:\s]+([^\n,]+)/i);
                        const eventMatch = textResponse.match(/event[:\s]+([^\n,]+)/i);
                        
                        parsed = {
                            name: nameMatch ? nameMatch[1].trim() : '',
                            color: colorMatch ? colorMatch[1].trim() : '',
                            season: seasonMatch ? seasonMatch[1].trim() : '',
                            event: eventMatch ? eventMatch[1].trim() : ''
                        };
                    } else {
                        throw new Error("תשובת AI לא תקינה");
                    }
                }
            } else if (aiResult && typeof aiResult === 'object') {
                parsed = aiResult;
            } else {
                throw new Error("פורמט תשובת AI לא מזוהה");
            }
            
            console.log("Processed AI Result:", parsed);
            
            if (parsed && typeof parsed === 'object') {
                const name = parsed.name || '';
                const color = parsed.color || '';
                const tagList = [];
                
                if (parsed.season) tagList.push(parsed.season);
                if (parsed.event) tagList.push(parsed.event);
                if (parsed.tags && Array.isArray(parsed.tags)) {
                    tagList.push(...parsed.tags);
                }
                const tags = tagList.join(',');
                
                setFormData(prevData => ({
                    ...prevData,
                    name,
                    color,
                    tags
                }));
                
                if (name || color || tags) {
                    setAiStatus('✅ פרטים זוהו ומולאו אוטומטית');
                } else {
                    setAiStatus('⚠️ לא זוהו פרטים מהתמונה - אנא מלא ידנית');
                }
            } else {
                throw new Error("מבנה תשובת AI לא תקין");
            }
        } catch (err) {
            console.error("AI Error:", err);
            setAiStatus('⚠️ ניתוח נכשל - אנא מלא את הפרטים ידנית');
        }
    };

    const handleCapture = () => {
        setIsCapturing(true);
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        
        if (!canvas || !context || !videoRef.current) {
            setIsCapturing(false);
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
            if (!blob) {
                setIsCapturing(false);
                return;
            }
            
            try {
                const compressed = await compressImage(blob);
                const base64 = await blobToBase64(compressed);
                
                setFormData(prevData => ({
                    ...prevData,
                    image: base64
                }));
                
                setCapturedImage(base64);
                setIsCapturing(false);
                setShowCamera(false);
                
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    setStream(null);
                }

                const file = new File([compressed], 'image.jpg', { type: 'image/jpeg' });
                await processAI(file);
            } catch (err) {
                console.error("שגיאה בעיבוד התמונה:", err);
                setAiStatus('⚠️ ניתוח התמונה נכשל');
                setIsCapturing(false);
            }
        }, 'image/jpeg', 0.85);
    };

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const compressed = await compressImage(file);
            const base64 = await blobToBase64(compressed);
            
            setFormData(prevData => ({
                ...prevData,
                image: base64,
                name: '', 
                color: '',
                tags: ''
            }));
            
            setCapturedImage(base64);
            setShowCamera(false);
            
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }

            setAiStatus('');
            await processAI(file);
        } catch (err) {
            console.error("שגיאה בהעלאת תמונה:", err);
            setAiStatus('⚠️ ניתוח התמונה נכשל');
        }
    };

    return { handleCapture, handleUpload, isCapturing, startCamera };
};