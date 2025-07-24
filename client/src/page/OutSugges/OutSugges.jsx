import { useEffect, useState } from 'react';
import { FaHeart, FaTimes, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import styles from './OutSugges.module.css';

function OutSugges() {
  const [looks, setLooks] = useState([]);
  const [selectedLook, setSelectedLook] = useState(null);
  const [suggestedLook, setSuggestedLook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clothesCount, setClothesCount] = useState(null);
  const [stylePreference, setStylePreference] = useState("casual");
  const [seasonPreference, setSeasonPreference] = useState("current");
  const [userStats, setUserStats] = useState(null);
  const [learningProgress, setLearningProgress] = useState(0);
  const [personalityInsight, setPersonalityInsight] = useState("");

  const userId = localStorage.getItem("userId");

  // Season options
  const seasonOptions = [
    { value: "current", label: "עונה נוכחית" },
    { value: "summer", label: "קיץ" },
    { value: "winter", label: "חורף" },
    { value: "spring", label: "אביב" },
    { value: "fall", label: "סתיו" },
    { value: "transition", label: "מעבר עונות" }
  ];

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/looks/stats", {
        headers: { "x-user-id": userId }
      });
      const data = await res.json();
      if (res.ok) {
        setUserStats(data.stats);
        
        const totalFeedbacks = (data.stats.likes || 0) + (data.stats.dislikes || 0) + (data.stats.loves || 0);
        const progress = Math.min(totalFeedbacks / 20, 1) * 100;
        setLearningProgress(progress);

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

  // Handle favorite toggle
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

  // Handle delete look
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

  // Sort items for display
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

  // Render stack look
  const renderStackLook = (items) => (
    <div className={styles.lookStackContainer}>
      {sortItemsForDisplay(items).map((item, i) => (
        <div key={item._id || i} className={styles.stackItem}>
          <img
            src={item.image}
            alt={item.name || ''}
            className={styles.stackImage}
          />
        </div>
      ))}
    </div>
  );

  // Render source info
  const renderSourceInfo = () => {
    if (!suggestedLook?.source) return null;

    const sourceConfig = {
      'smart_learning': {
        icon: '🎯',
        text: 'לוק מותאם אישית מתקדם',
        color: styles.smartLearning || 'bg-green-50 text-green-800',
        description: 'נוצר בהתבסס על הדפוסים שלמדתי מהטעם שלך'
      },
      'basic_preferences': {
        icon: '💖',
        text: 'לוק מותאם אישית',
        color: styles.basicPreferences || 'bg-pink-50 text-pink-800',
        description: 'בחרתי לפי מה שאהבת בעבר'
      },
      'seasonal_smart': {
        icon: '🌟',
        text: 'לוק עונתי חכם',
        color: styles.seasonalSmart || 'bg-orange-50 text-orange-800',
        description: 'מותאם במיוחד לעונה ולסגנון שבחרת'
      },
      'ai': {
        icon: '🤖',
        text: 'לוק מה-AI',
        color: styles.aiGenerated || 'bg-blue-50 text-blue-800',
        description: 'הבינה המלאכותית יצרה את השילוב הזה'
      },
      'random': {
        icon: '🎲',
        text: 'לוק מפתיע',
        color: styles.randomSmart || 'bg-purple-50 text-purple-800',
        description: 'שילוב מפתיע שעשוי לחדש את הסגנון שלך'
      }
    };

    const config = sourceConfig[suggestedLook.source] || sourceConfig['random'];

    return (
      <div className={`${styles.sourceInfo} ${config.color}`}>
        <div className={styles.sourceHeader}>
          <span className={styles.sourceIcon}>{config.icon}</span>
          <span className={styles.sourceText}>{config.text}</span>
          {suggestedLook.confidence && (
            <span className={styles.confidenceScore}>
              {Math.round(suggestedLook.confidence * 100)}%
            </span>
          )}
        </div>
        <p className={styles.sourceDescription}>{config.description}</p>
      </div>
    );
  };

const renderLookInfo = (look) => {
  const seasonEmojis = {
    summer: '☀️',
    winter: '❄️',
    spring: '🌸',
    fall: '🍂',
    current: '📅',
    transition: '🔄'
  };

  const styleEmojis = {
    casual: '👕',
    elegant: '👗'
  };

  const normalize = (val) => (val || "").trim().toLowerCase();

  const seasonRaw = look.season;
  const styleRaw = look.style;
  const eventRaw = look.event;
  const tagsRaw = look.tags;

  const allTags = new Set();

  // עונות
  if (seasonRaw) {
    seasonRaw.split(",").forEach(s => {
      const clean = normalize(s);
      if (clean) allTags.add(clean);
    });
  }

  // סגנון + אירוע
  [styleRaw, eventRaw].forEach(val => {
    const clean = normalize(val);
    if (clean) allTags.add(clean);
  });

  // תגיות
  if (Array.isArray(tagsRaw)) {
    tagsRaw.forEach(t => {
      const clean = normalize(t);
      if (clean) allTags.add(clean);
    });
  }

  const finalTagArray = [...allTags];

  return (
    <div className={styles.lookInfo}>
      {finalTagArray.map((tag, i) => (
        <span key={i} className={styles.infoItem}>
          {seasonEmojis[tag] || styleEmojis[tag] || '🏷️'} {tag}
        </span>
      ))}
    </div>
  );
};

  // Render feedback buttons
  const renderFeedbackButtons = () => {
    const feedbackButtons = [
      {
        key: 'dislike',
        emoji: '👎',
        text: 'לא מתאים',
        className: styles.dislikeFeedback
      },
      {
        key: 'like', 
        emoji: '👍',
        text: 'חמוד',
        className: styles.likeFeedback
      },
      {
        key: 'love',
        emoji: '❤️', 
        text: 'מושלם!',
        className: styles.loveFeedback
      }
    ];

    return (
      <div className={styles.feedbackSection}>
        <p className={styles.feedbackPrompt}>
          איך הלוק הזה? הפידבק שלך עוזר לי להכיר אותך יותר טוב! 🎯
        </p>
        
        <div className={styles.feedbackButtons}>
          {feedbackButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => handleLookFeedback(button.key)}
              className={`${styles.feedbackButton} ${button.className}`}
            >
              <span className={styles.buttonEmoji}>{button.emoji}</span>
              {button.text}
            </button>
          ))}
        </div>
        
        <div className={styles.feedbackTips}>
          <p>💡 <strong>טיפ:</strong> ככל שתתני יותר פידבק, כך אלמד את הטעם שלך טוב יותר</p>
          {learningProgress < 50 && (
            <p>🌱 עוד {Math.ceil((50 - learningProgress) / 5)} פידבקים ואתחיל ליצור לוקים מותאמים אישית</p>
          )}
        </div>
      </div>
    );
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
        if (res.ok) 
        {
          const visibleLooks = (data.looks || []).filter(look => look.favorited !== false);
          setLooks((data.looks || []).filter(l => l.favorited !== false));
        }

      } catch (err) {
        console.error("שגיאה בטעינת לוקים:", err);
      }
    };

    checkClothesCount();
    fetchLooks();
    fetchUserStats();
  }, [userId]);

  // Enhanced suggest function
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
        body: JSON.stringify({ 
          stylePreference,
          seasonPreference,
          useAdvancedLogic: true 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "שגיאה בשרת");
        return;
      }

      if (data.look) {
        setSuggestedLook(data.look);
      } else {
        alert(data.message || "לא נמצאה הצעת לוק שלמה מהפריטים הקיימים.");
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

  return (
    <div>
      <Header />
      <div className={styles.wrapper}>
        {/* Enhanced suggestion box with scroll */}
        {suggestedLook && (
          <div className={styles.overlayBox}>
            <div className={styles.overlayContent}>
              <div className={styles.overlayHeader}>
                <h3>✨ ההצעה החדשה שלך!</h3>
                <button 
                  onClick={() => setSuggestedLook(null)}
                  className={styles.closeButton}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className={styles.overlayScrollableContent}>
                {renderSourceInfo()}
                {renderLookInfo(suggestedLook)}
                {renderStackLook(suggestedLook.items)}
              </div>
              
              <div className={styles.overlayFooter}>
                <div className={styles.feedbackSection}>
                  <p className={styles.feedbackPrompt}>
                    איך הלוק הזה? הפידבק שלך עוזר לי להכיר אותך יותר טוב! 🎯
                  </p>
                  
                  <div className={styles.feedbackButtons}>
                    <button
                      onClick={() => handleLookFeedback('dislike')}
                      className={`${styles.feedbackButton} ${styles.dislikeFeedback}`}
                    >
                      <span className={styles.buttonEmoji}>👎</span>
                      לא מתאים
                    </button>
                    <button
                      onClick={() => handleLookFeedback('like')}
                      className={`${styles.feedbackButton} ${styles.likeFeedback}`}
                    >
                      <span className={styles.buttonEmoji}>👍</span>
                      חמוד
                    </button>
                    <button
                      onClick={() => handleLookFeedback('love')}
                      className={`${styles.feedbackButton} ${styles.loveFeedback}`}
                    >
                      <span className={styles.buttonEmoji}>❤️</span>
                      מושלם!
                    </button>
                  </div>
                  
                  <div className={styles.feedbackTips}>
                    <p>💡 <strong>טיפ:</strong> ככל שתתני יותר פידבק, כך אלמד את הטעם שלך טוב יותר</p>
                    {learningProgress < 50 && (
                      <p>🌱 עוד {Math.ceil((50 - learningProgress) / 5)} פידבקים ואתחיל ליצור לוקים מותאמים אישית</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected look display box */}
        {!suggestedLook && selectedLook && (
          <div className={styles.overlayBox}>
            <div className={styles.overlayContent}>
              <div className={styles.overlayHeader}>
                <h3>לוק מוצג</h3>
                <button 
                  onClick={() => setSelectedLook(null)}
                  className={styles.closeButton}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className={styles.overlayScrollableContent}>
                {renderLookInfo(selectedLook)}
                {renderStackLook(selectedLook.items)}
              </div>
              
              <div className={styles.overlayFooter}>
                <div className={styles.buttonRow}>
                  <button
                    onClick={() => handleFavoriteToggle(selectedLook._id)}
                    className={`${styles.actionButton} ${selectedLook.favorited ? styles.active : ''}`}
                  >
                    <FaHeart /> {selectedLook.favorited ? 'הסר ממועדפים' : 'הוסף למועדפים'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced controls */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label htmlFor="style-select">בחרי סגנון:</label>
            <select
              id="style-select"
              value={stylePreference}
              onChange={(e) => setStylePreference(e.target.value)}
              className={styles.select}
            >
              <option value="casual">יום יום 👕</option>
              <option value="elegant">אלגנטי 👗</option>
            </select>
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="season-select">בחרי עונה:</label>
            <select
              id="season-select"
              value={seasonPreference}
              onChange={(e) => setSeasonPreference(e.target.value)}
              className={styles.select}
            >
              {seasonOptions.map(season => (
                <option key={season.value} value={season.value}>
                  {season.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSuggest}
            disabled={loading || !userId || clothesCount === 0}
            className={styles.suggestButton}
          >
            {loading ? (
              <span className={styles.loadingText}>
                <span className={styles.spinner}></span>
                מחפש את השילוב המושלם...
              </span>
            ) : (
              '💡 הצע לי שילוב חכם מהארון שלי'
            )}
          </button>
        </div>


        {/* Favorites link */}
        <Link to="/favorites" className={styles.favoritesLink}>
          💖 הצג את הלוקים המועדפים שלי
        </Link>

        {/* Warning messages */}
        {!userId ? (
          <div className={styles.warningBox}>
            <p>לא נמצא משתמש. נא להתחבר מחדש.</p>
          </div>
        ) : clothesCount === 0 ? (
          <div className={styles.warningBox}>
            <p>הארון שלך ריק<br />הוסף בגדים כדי לקבל הצעות לוק.</p>
          </div>
        ) : null}

        {/* User statistics */}


        {/* Results area */}
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
                {renderLookInfo(look)}
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