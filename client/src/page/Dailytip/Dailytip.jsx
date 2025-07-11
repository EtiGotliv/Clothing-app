import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './DailyTip.module.css';
import AddTipForm from './AddTipForm';

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed(array, rng) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 💡 מחושב לפי כמות הטיפים בתחילת היום בלבד (לא מושפע מתוספות במהלך היום)
function getStableTipIndex(allTips, storageKey = 'tipCycleReference') {
  const startDate = new Date('2025-07-01');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  let saved = JSON.parse(localStorage.getItem(storageKey) || '{}');

  // אם התאריך שמור לא תואם להיום – שמור כמות חדשה
  if (saved.date !== todayStr || !saved.length) {
    saved = { date: todayStr, length: allTips.length };
    localStorage.setItem(storageKey, JSON.stringify(saved));
  }

  const refLength = saved.length;
  const indexList = shuffleWithSeed([...Array(refLength).keys()], mulberry32(42));
  const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const index = indexList[diffDays % refLength];

  return index;
}

export default function DailyTip() {
  const [tip, setTip] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsAdmin(role === "admin");

    async function loadTips() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_API_URL}/api/tips`);
        const tipsFromDB = res.data;

        if (tipsFromDB.length === 0) {
          setTip({ text: "אין עדיין טיפים במערכת", category: "כללי" });
          return;
        }

        const index = getStableTipIndex(tipsFromDB);
        setTip(tipsFromDB[index]);
      } catch (error) {
        console.warn("⚠️ שגיאה בטעינת טיפים מהשרת.");
        setTip({ text: "שגיאה בטעינת טיפ", category: "כללי" });
      }
    }

    loadTips();
  }, []);

  if (!tip) return <div>טוען טיפ...</div>;

  return (
    <>
      <div className={styles.tipCard}>
        <h2 className={styles.tipTitle}>הטיפ של היום</h2>
        <p className={styles.tipText}>{tip.text}</p>
        <div className={styles.tipCategory}>קטגוריה: {tip.category}</div>
      </div>

      {isAdmin && (
        <div className={styles.adminContainer}>
          <AddTipForm />
        </div>
      )}
    </>
  );
}
