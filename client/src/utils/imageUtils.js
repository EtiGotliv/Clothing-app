import imageCompression from 'browser-image-compression';

export const compressImage = async (blob) => {
    return await imageCompression(blob, {
    maxSizeMB: 1,
    maxWidthOrHeight: 500,
    useWebWorker: true,
    });
};

export const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
    });
};
