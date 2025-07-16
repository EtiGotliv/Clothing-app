import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AddTipForm.module.css';

export default function AddTipForm() {
  const [category, setCategory] = useState('');
  const [text, setText] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsAdmin(role === 'admin');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("לא מחוברת");

    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_API_URL}/api/tips/add`,
        { category, text },
        { headers: { "x-user-id": userId } }
      );
      if (res.data.success) {
        setMessage("🎉 הטיפ נוסף בהצלחה!");
        setCategory('');
        setText('');
      }
    } catch (error) {
      setMessage("❌ שגיאה: אין הרשאה או בעיית שרת");
    }
  };

  if (!isAdmin) return null;

  return (
    <form onSubmit={handleSubmit} className={styles.tipForm}>
      <h2 className={styles.formTitle}>הוספת טיפ חדש</h2>

      <label className={styles.label}>קטגוריה:</label>
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
        className={styles.input}
      />

      <label className={styles.label}>תוכן הטיפ:</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        rows={4}
        className={styles.textarea}
      />

      <button type="submit" className={styles.button}>הוסיפי טיפ</button>

      {message && <p className={styles.message}>{message}</p>}
    </form>
  );
}
