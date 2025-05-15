export const useFormHandlers = (
    formData,
    setFormData,
    setCapturedImage,
    setAiStatus,
    setSaveStatus
    ) => {
    const userId = localStorage.getItem('authToken') || '67b31f23fb4864c43330f8ac';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setFormData({ name: '', color: '', tags: '', image: null });
        setAiStatus('');
        setSaveStatus('');
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.image) {
            setSaveStatus('❌ אנא הוסף שם ותמונה');
            return;
        }

        setSaveStatus('שומר...');
        try {
            const tagsArray = formData.tags 
                ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
                : [];
                
            const response = await fetch("http://localhost:8080/api/clothes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId
                },
                body: JSON.stringify({
                    ...formData,
                    tags: tagsArray,
                    image: formData.image
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "שמירה נכשלה");
            }
            
            setSaveStatus('✅ נשמר בהצלחה');
            
            const currentImage = formData.image;
            setFormData({
                name: '',
                color: '',
                tags: '',
                image: currentImage
            });
        } catch (error) {
            console.error(error);
            setSaveStatus(`❌ ${error.message}`);
        }
    };

    return { handleChange, handleRetake, handleSubmit };
};