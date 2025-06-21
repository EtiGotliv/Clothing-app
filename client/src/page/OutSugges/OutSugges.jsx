import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import styles from './OutSugges.module.css';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegThumbsDown, FaRegThumbsUp, FaTrash } from 'react-icons/fa';

function OutSugges() {
  const [looks, setLooks] = useState([]);
  const [selectedLook, setSelectedLook] = useState(null);
  const [suggestedLook, setSuggestedLook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clothesCount, setClothesCount] = useState(null);
  const [stylePreference, setStylePreference] = useState("casual");
  const [userStats, setUserStats] = useState(null);

  const userId = localStorage.getItem("userId");
  const fetchUserStats = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/looks/stats", {
      headers: { "x-user-id": userId }
    });
    const data = await res.json();
    if (res.ok) setUserStats(data.stats);
  } catch (err) {
    console.error("שגיאה בטעינת סטטיסטיקות:", err);
  }
};

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
    fetchUserStats();
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
        setSuggestedLook(data.look);
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

  const handleLookFeedback = async (feedback) => {
    if (!suggestedLook) return;
    
    try {
      const res = await fetch("http://localhost:8080/api/looks/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({ 
          lookId: suggestedLook._id, 
          feedback: feedback 
        })
      });

      if (res.ok) {
        if (feedback === 'like' || feedback === 'love') {
          setLooks([suggestedLook, ...looks]);
        }

        setSuggestedLook(null);
        fetchUserStats();
        if (typeof refreshPreferenceStats === 'function') {
          refreshPreferenceStats();
        }
      }
    } catch (err) {
      console.error("שגיאה בשמירת פידבק:", err);
      alert("שגיאה בשמירת הפידבק");
    }
  };
  const renderUserStats = () => {
  if (!userStats || userStats.totalFeedbacks === 0) return null;
  
  const topColors = Object.entries(userStats.preferredColors)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
    return (
    <div className={styles.statsBox}>
      <h4>📊 ההעדפות שלך</h4>
      <div className={styles.statsGrid}>
        <div>
          <span>💖 לוקים שאהבת: {userStats.likes}</span>
        </div>
        <div>
          <span>👎 לוקים שלא אהבת: {userStats.dislikes}</span>
        </div>
        {topColors.length > 0 && (
          <div>
            <span>🎨 צבעים מועדפים: {topColors.map(([color]) => color).join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

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

  const handleDeleteLook = async (lookId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/looks/${lookId}`, {
        method: "DELETE",
        headers: { "x-user-id": userId }
      });
      if (res.ok) {
        setLooks(prev => prev.filter(l => l._id !== lookId));
      } else {
        console.error("מחיקה נכשלה:", await res.text());
        alert("שגיאה במחיקת הלוק");
      }
    } catch (err) {
      console.error("שגיאה בבקשת מחיקה:", err);
      alert("שגיאה לא צפויה");
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

const renderFeedbackButtons = () => (
  <div className={styles.buttonRow}>
    <button 
      onClick={() => handleLookFeedback('dislike')} 
      className={styles.dislikeButton}
    >
      👎 לא מתאים
    </button>
    <button 
      onClick={() => handleLookFeedback('like')} 
      className={styles.likeButton}
    >
      👍 חמוד
    </button>
    <button 
      onClick={() => handleLookFeedback('love')} 
      className={`${styles.likeButton} ${styles.loveButton}`}
    >
      ❤️ מושלם!
    </button>
  </div>
);

  return (
    <div>
      <Header />
      <div className={styles.wrapper}>
        {suggestedLook && (
          <div className={styles.overlayBox}>
            <h3>✨ ההצעה החדשה שלך!</h3>
            <div className={styles.lookSource}>
              {suggestedLook.source === 'preferences' && (
                <div className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm mb-3">
                  🎯 לוק מותאם אישית לפי ההעדפות שלך
                </div>
              )}
              {suggestedLook.source === 'ai' && (
                <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm mb-3">
                  🤖 לוק שנוצר על ידי AI
                </div>
              )}
              {(!suggestedLook.source || suggestedLook.source === 'random') && (
                <div className="bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-sm mb-3">
                  🎲 לוק אקראי חכם
                </div>
              )}
            </div>
            <p>עונה: {suggestedLook.season} | סגנון: {suggestedLook.style}</p>
            {renderStackLook(suggestedLook.items)}
            <div className={styles.feedbackSection}>
              <p className="text-sm text-gray-600 mb-3">איך הלוק הזה? הפידבק שלך עוזר לנו להכיר אותך יותר טוב!</p>
              {renderFeedbackButtons()}
            </div>
          </div>
        )}

        {!suggestedLook && selectedLook && (
          <div className={styles.overlayBox}>
            <h3>לוק מוצג</h3>
            <p>עונה: {selectedLook.season} | סגנון: {selectedLook.style}</p>
            {renderStackLook(selectedLook.items)}
            <div className={styles.buttonRow}>
              <button onClick={() => setSelectedLook(null)} className={styles.dislikeButton}>
                סגור
              </button>
              <button
                onClick={() => handleFavoriteToggle(selectedLook._id)}
                className={`${styles.likeButton} ${selectedLook.favorited ? styles.active : ''}`}
              >
                <FaHeart /> {selectedLook.favorited ? 'הסר ממועדפים' : 'הוסף למועדפים'}
              </button>
            </div>
          </div>
        )}

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
          <div className={styles.lookGrid}>
            {looks.length === 0 && (
              <div className={styles.emptyState}>
                עדיין לא יצרת לוקים. לחצי על הכפתור למעלה.
              </div>
            )}
            {looks.map((look, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedLook(look)}
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLook(look._id);
                  }}
                  className={styles.deleteButton}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutSugges;
