import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import styles from './OutSugges.module.css';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa'; 

function OutSugges() {
  const [looks, setLooks] = useState([]);
  const [selectedLook, setSelectedLook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clothesCount, setClothesCount] = useState(null);
  const [stylePreference, setStylePreference] = useState("casual");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const checkClothesCount = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/clothes", {
          headers: { "x-user-id": userId }
        });
        const clothes = await res.json();
        setClothesCount(clothes.length);
      } catch (err) {
        console.error("שגיאה בבדיקת בגדים:", err);
        setClothesCount(0);
      }
    };

    const fetchLooks = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/looks/all", {
          headers: { "x-user-id": userId }
        });
        const data = await res.json();
        if (res.ok) setLooks(data.looks || []);
      } catch (err) {
        console.error("שגיאה בטעינת לוקים:", err);
      }
    };

    checkClothesCount();
    fetchLooks();
  }, [userId]);

  const handleSuggest = async () => {
    if (!userId) {
      alert("לא נמצא מזהה משתמש. נא להתחבר מחדש.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/looks/smart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({ stylePreference })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "שגיאה בשרת");
        return;
      }

      if (data.look) {
        setLooks([data.look, ...looks]);
        setSelectedLook(null);
      } else {
        alert("לא נמצאה הצעת לוק שלמה מהפריטים הקיימים.");
      }
    } catch (err) {
      console.error("שגיאה בבקשה:", err);
      alert("שגיאה בלתי צפויה מהשרת");
    } finally {
      setLoading(false);
    }
  };

  const handleLookClick = (look) => setSelectedLook(look);

  const handleFavoriteToggle = async (lookId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/looks/${lookId}/favorite`, {
        method: "PATCH",
        headers: { "x-user-id": userId }
      });
      const data = await res.json();
      if (res.ok) {
        setLooks(prev =>
          prev.map(l => l._id === lookId ? { ...l, favorited: data.favorited } : l)
        );
        if (selectedLook && selectedLook._id === lookId) {
          setSelectedLook({ ...selectedLook, favorited: data.favorited });
        }
      }
    } catch (err) {
      console.error("שגיאה בסימון מועדף:", err);
    }
  };

  const sortItemsForDisplay = (items) => {
    const orderMap = {
      top: 1,
      bottom: 2,
      dress: 3,
      shoes: 4,
      other: 5
    };
    const normalize = (cat) => {
      const c = (cat || "").toLowerCase();
      if (["shirt", "blouse", "t-shirt", "top", "sweater", "hoodie", "jacket", "pullover"].includes(c)) return "top";
      if (["pants", "jeans", "shorts", "skirt"].includes(c)) return "bottom";
      if (["dress", "robe"].includes(c)) return "dress";
      if (["shoes", "boots", "sneakers", "heels", "sandals"].includes(c)) return "shoes";
      return "other";
    };
    return [...items].sort((a, b) =>
      orderMap[normalize(a.category || a.name)] - orderMap[normalize(b.category || b.name)]
    );
  };

  const renderStackLook = (items) => (
    <div className={styles.lookStackContainer}>
      {sortItemsForDisplay(items).map((item, i) => (
        <div key={item._id || i} className={styles.stackItem}>
          <img
            src={item.image}
            alt=""
            className={styles.stackImage}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <Header />
      <div className={styles.wrapper}>

        <Link to="/favorites" className={styles.suggestButton}>
          💖 הצג את הלוקים המועדפים שלי
        </Link>

        {!userId ? (
          <div className={styles.warningBox}>
            <p>לא נמצא משתמש. נא להתחבר מחדש.</p>
          </div>
        ) : clothesCount === 0 ? (
          <div className={styles.warningBox}>
            <p>הארון שלך ריק<br />הוסף בגדים כדי לקבל הצעות לוק.</p>
          </div>
        ) : null}

        <div className={styles.controls}>
          <label htmlFor="style-select">בחרי סגנון:</label>
          <select
            id="style-select"
            value={stylePreference}
            onChange={(e) => setStylePreference(e.target.value)}
          >
            <option value="casual">ליום יום</option>
            <option value="elegant">לאירוע</option>
          </select>

          <button
            onClick={handleSuggest}
            disabled={loading || !userId || clothesCount === 0}
            className={styles.suggestButton}
          >
            {loading ? 'חושב על השילוב המושלם...' : 'הצע לי שילוב מהארון שלי'}
          </button>
        </div>

        <div className={styles.resultArea}>
          {selectedLook ? (
            <div className={styles.lookPreviewBox}>
              <h3>לוק מוצג</h3>
              <p>עונה: {selectedLook.season} | סגנון: {selectedLook.style}</p>
              {renderStackLook(selectedLook.items)}

              <button
                onClick={() => handleFavoriteToggle(selectedLook._id)}
                className={`${styles.favoriteIcon} ${selectedLook.favorited ? styles.active : ""}`}
                aria-label="הוסף למועדפים"
              >
                <FaHeart />
              </button>

              <button
                onClick={() => setSelectedLook(null)}
                className={styles.closeButton}
              >
                סגור תצוגה
              </button>
            </div>
          ) : (
            <div className={styles.lookGrid}>
              {looks.length === 0 && (
                <div className={styles.emptyState}>
                  עדיין לא יצרת לוקים. לחצי על הכפתור למעלה.
                </div>
              )}
              {looks.map((look, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLookClick(look)}
                  className={styles.lookCard}
                >
                  <p>עונה: {look.season}</p>
                  <p>סגנון: {look.style}</p>
                  <div className={styles.imageRow}>
                    {sortItemsForDisplay(look.items).slice(0, 3).map((item, i) => (
                      <img
                        key={i}
                        src={item.image}
                        alt=""
                        className={styles.thumb}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OutSugges;
