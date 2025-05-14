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
        setFormData({ name: '', color: '', tags: '' });
        setAiStatus('');
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.image) {
        setSaveStatus('אנא הוסף שם ותמונה');
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
            tags: formData.tags.split(',').map(t => t.trim())
            })
        });

        if (!response.ok) throw new Error("שמירה נכשלה");
        setFormData({ name: '', color: '', tags: '' });
        setCapturedImage(null);
        setSaveStatus('✅ נשמר בהצלחה');
        setAiStatus('');
        setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
        console.error(error);
        setSaveStatus(`❌ ${error.message}`);
        }
    };

    return { handleChange, handleRetake, handleSubmit };
    };
