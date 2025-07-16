import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import styles from './OutSugges.module.css';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash } from 'react-icons/fa';

function OutSugges() {
  const [looks, setLooks] = useState([]);
  const [selectedLook, setSelectedLook] = useState(null);
  const [suggestedLook, setSuggestedLook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clothesCount, setClothesCount] = useState(null);
  const [stylePreference, setStylePreference] = useState("casual");
  const [userStats, setUserStats] = useState(null);
  const [learningProgress, setLearningProgress] = useState(0);
  const [personalityInsight, setPersonalityInsight] = useState("");

  const userId = localStorage.getItem("userId");

  const fetchUserStats = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/looks/stats", {
        headers: { "x-user-id": userId }
      });
      const data = await res.json();
      if (res.ok) {
        setUserStats(data.stats);
        
        // חישוב רמת הלמידה
        const totalFeedbacks = (data.stats.likes || 0) + (data.stats.dislikes || 0) + (data.stats.loves || 0);
        const progress = Math.min(totalFeedbacks / 20, 1) * 100;
        setLearningProgress(progress);

        // תובנות אישיות
        if (totalFeedbacks >= 10) {
          const favoriteColors = Object.entries(data.stats.preferredColors || {})
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([color]) => color);
          
          if (favoriteColors.length > 0) {
            setPersonalityInsight(`נראה שאת אוהבת צבעים כמו ${favoriteColors.join(' ו')}`);
          }
        } else if (totalFeedbacks >= 5) {
          setPersonalityInsight("אני מתחיל להכיר את הטעם שלך!");
        } else {
          setPersonalityInsight("עוד קצת פידבק ואני אכיר אותך יותר טוב");
        }
      }
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
      }
    } catch (err) {
      console.error("שגיאה בשמירת פידבק:", err);
      alert("שגיאה בשמירת הפידבק");
    }
  };

  const renderSourceInfo = () => {
    if (!suggestedLook?.source) return null;

    const sourceConfig = {
      'advanced_preferences': {
        icon: '🎯',
        text: 'לוק מותאם אישית מתקדם',
        color: 'bg-green-50 text-green-800',
        description: 'נוצר בהתבסס על הדפוסים שלמדתי מהטעם שלך'
      },
      'preferences': {
        icon: '💖',
        text: 'לוק מותאם אישית',
        color: 'bg-pink-50 text-pink-800',
        description: 'בחרתי לפי מה שאהבת בעבר'
      },
      'ai': {
        icon: '🤖',
        text: 'לוק מה-AI',
        color: 'bg-blue-50 text-blue-800',
        description: 'הבינה המלאכותית יצרה את השילוב הזה'
      },
      'random': {
        icon: '🎲',
        text: 'לוק אקראי חכם',
        color: 'bg-purple-50 text-purple-800',
        description: 'שילוב מפתיע שעשוי להתאים לך'
      }
    };

    const config = sourceConfig[suggestedLook.source] || sourceConfig['random'];

    return (
      <div className={`${config.color} px-3 py-2 rounded-lg text-sm mb-3`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
          <span style={{ fontSize: '18px' }}>{config.icon}</span>
          {config.text}
          {suggestedLook.confidence && (
            <span style={{ fontSize: '12px', opacity: 0.75 }}>
              (רמת ביטחון: {Math.round(suggestedLook.confidence * 100)}%)
            </span>
          )}
        </div>
        <p style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>{config.description}</p>
      </div>
    );
  };

  const renderLearningProgress = () => {
    if (learningProgress === 0) return null;

    return (
      <div style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '12px', 
        borderRadius: '8px', 
        marginBottom: '16px' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '8px' 
        }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            🧠 רמת הלמידה שלי עליך
          </span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {Math.round(learningProgress)}%
          </span>
        </div>
        
        <div style={{ 
          width: '100%', 
          backgroundColor: '#e5e7eb', 
          borderRadius: '9999px', 
          height: '8px', 
          marginBottom: '8px' 
        }}>
          <div 
            style={{ 
              background: 'linear-gradient(to right, #f472b6, #a855f7)',
              height: '8px', 
              borderRadius: '9999px', 
              transition: 'all 0.5s',
              width: `${learningProgress}%`
            }}
          ></div>
        </div>
        
        {personalityInsight && (
          <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
            💭 {personalityInsight}
          </p>
        )}
      </div>
    );
  };

  const renderFeedbackButtons = () => {
    const feedbackButtons = [
      {
        key: 'dislike',
        emoji: '👎',
        text: 'לא מתאים',
        style: { 
          backgroundColor: '#fef2f2', 
          color: '#b91c1c', 
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
          width: '100%'
        }
      },
      {
        key: 'like', 
        emoji: '👍',
        text: 'חמוד',
        style: { 
          backgroundColor: '#eff6ff', 
          color: '#1d4ed8', 
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
          width: '100%'
        }
      },
      {
        key: 'love',
        emoji: '❤️', 
        text: 'מושלם!',
        style: { 
          backgroundColor: '#fdf2f8', 
          color: '#be185d', 
          border: '1px solid #fbcfe8',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
          width: '100%'
        }
      }
    ];

    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          איך הלוק הזה? הפידבק שלך עוזר לי להכיר אותך יותר טוב! 🎯
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', maxWidth: '320px', margin: '0 auto' }}>
          {feedbackButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => handleLookFeedback(button.key)}
              style={button.style}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '18px' }}>{button.emoji}</span>
              {button.text}
            </button>
          ))}
        </div>
        
        <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
          <p>💡 <strong>טיפ:</strong> ככל שתתני יותר פידבק, כך אלמד את הטעם שלך טוב יותר</p>
          {learningProgress < 50 && (
            <p style={{ marginTop: '4px' }}>🌱 עוד {Math.ceil((50 - learningProgress) / 5)} פידבקים ואתחיל ליצור לוקים מותאמים אישית</p>
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

  return (
    <div>
      <Header />
      <div className={styles.wrapper}>
        {suggestedLook && (
          <div className={styles.overlayBox}>
            <h3>✨ ההצעה החדשה שלך!</h3>
            {renderSourceInfo()}
            {renderLearningProgress()}
            <p>עונה: {suggestedLook.season} | סגנון: {suggestedLook.style}</p>
            {renderStackLook(suggestedLook.items)}
            <div className={styles.feedbackSection}>
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

        {/* הצגת סטטיסטיקות אם יש */}
        {userStats && userStats.totalFeedbacks > 0 && (
          <div className={styles.statsBox}>
            <h4>📊 ההעדפות שלך</h4>
            <div className={styles.statsGrid}>
              <div>
                <span>💖 לוקים שאהבת: {userStats.likes + (userStats.loves || 0)}</span>
              </div>
              <div>
                <span>👎 לוקים שלא אהבת: {userStats.dislikes}</span>
              </div>
              {Object.keys(userStats.preferredColors || {}).length > 0 && (
                <div>
                  <span>🎨 צבעים מועדפים: {
                    Object.entries(userStats.preferredColors)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([color]) => color)
                      .join(', ')
                  }</span>
                </div>
              )}
            </div>
          </div>
        )}

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