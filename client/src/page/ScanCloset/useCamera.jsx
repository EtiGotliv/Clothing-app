import { useEffect, useState } from 'react';
import { compressImage, blobToBase64 } from '../../utils/imageUtils';
import { analyzeImageFromAI } from '../../../api/aiService';

export const useCamera = (videoRef, canvasRef, setFormData, setAiStatus, setCapturedImage) => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [stream, setStream] = useState(null);

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
    startCamera();
    return () => {
        if (stream) {
        stream.getTracks().forEach(track => track.stop());
        }
    };
    }, []);

    const processAI = async (file) => {
        const aiResult = await analyzeImageFromAI(file);
        const parsed = typeof aiResult === 'string' ? JSON.parse(aiResult) : aiResult;
        const name = parsed.name || '';
        const color = parsed.color || '';
        const tags = [parsed.season, parsed.event].filter(Boolean).join(',');
        setFormData({ name, color, tags });
        setAiStatus(name || color || tags ? '✅ פרטים זוהו' : '⚠️ לא זוהו פרטים');
    };

    const handleCapture = () => {
    setIsCapturing(true);
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !videoRef.current) {
        setIsCapturing(false);
        return;
    }

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
        if (!blob) return setIsCapturing(false);
        try {
        const compressed = await compressImage(blob);
        const base64 = await blobToBase64(compressed);
        setCapturedImage(base64);
        setIsCapturing(false);
        stream?.getTracks().forEach(track => track.stop());
        setStream(null);

        const file = new File([compressed], 'image.jpg', { type: 'image/jpeg' });
        await processAI(file);
        } catch (err) {
        console.warn("AI error:", err);
        setAiStatus('⚠️ ניתוח נכשל');
        setIsCapturing(false);
        }
    }, 'image/jpeg');
    };

    const handleUpload = async (file) => {
    try {
        const compressed = await compressImage(file);
        const base64 = await blobToBase64(compressed);
        setCapturedImage(base64);
        await processAI(file);
    } catch (err) {
        console.error("שגיאה בהעלאת תמונה:", err);
        setAiStatus('⚠️ ניתוח נכשל');
    }
    };

    return { handleCapture, handleUpload, isCapturing };
};
