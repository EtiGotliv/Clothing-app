import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/looks/stats", {
        headers: { "x-user-id": userId }
      });
      const data = await res.json();
      if (res.ok) {
        setUserStats(data.stats);
      }
    } catch (err) {
      console.error("שגיאה בטעינת סטטיסטיקות:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderAIInsights = () => {
    if (!userStats) return null;

    const totalFeedbacks = userStats.totalFeedbacks || 0;
    const confidence = Math.round((userStats.confidenceLevel || 0) * 100);

    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200 mb-6">
        <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
          🤖 מה הבינה המלאכותית יודעת עליך
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/70 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{totalFeedbacks}</div>
            <div className="text-sm text-gray-600">פידבקים שנתת</div>
          </div>
          
          <div className="bg-white/70 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{confidence}%</div>
            <div className="text-sm text-gray-600">רמת הביטחון שלי בך</div>
          </div>
          
          <div className="bg-white/70 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{userStats.learningLevel}</div>
            <div className="text-sm text-gray-600">רמת הלמידה</div>
          </div>
          
          <div className="bg-white/70 p-4 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">{userStats.likes + userStats.loves}</div>
            <div className="text-sm text-gray-600">לוקים שאהבת</div>
          </div>
        </div>

        <div className="bg-white/70 p-4 rounded-lg mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">📊 איך הבינה שלי עובדת:</h4>
          <div className="space-y-2 text-sm text-gray-700">
            {totalFeedbacks === 0 && (
              <p>🌱 <strong>התחלתי:</strong> אני עדיין לא מכיר אותך. כל לוק שאני מציע הוא רנדומלי.</p>
            )}
            {totalFeedbacks >= 1 && totalFeedbacks < 5 && (
              <p>🔍 <strong>לומד להכיר:</strong> אני מתחיל ללמוד מהפידבקים שלך. עדיין מרבה בלוקים רנדומליים ו-AI.</p>
            )}
            {totalFeedbacks >= 5 && totalFeedbacks < 10 && (
              <p>📈 <strong>מבין בסיסי:</strong> אני מתחיל להבין את הטעם שלך! מנסה להימנע ממה שלא אהבת.</p>
            )}
            {totalFeedbacks >= 10 && totalFeedbacks < 20 && (
              <p>🎯 <strong>מכיר אותך טוב:</strong> אני לומד דפוסים בטעם שלך ומנסה ליצור לוקים מותאמים אישית.</p>
            )}
            {totalFeedbacks >= 20 && (
              <p>🏆 <strong>מומחה בטעם שלך:</strong> אני מכיר אותך מעולה! רוב הלוקים שלי מותאמים אישית בדיוק לטעם שלך.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLearningProcess = () => {
    return (
      <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border border-green-200 mb-6">
        <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
          🧠 איך אני לומד את הטעם שלך
        </h3>
        
        <div className="space-y-4">
          <div className="bg-white/70 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">🔄 התהליך שלי:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li><strong>איסוף נתונים:</strong> כל פעם שאת נותנת פידבק (👍👎❤️), אני שומר מה אהבת ומה לא</li>
              <li><strong>ניתוח דפוסים:</strong> אני מחפש קשרים - איזה צבעים, סגנונות וקטגוריות את אוהבת</li>
              <li><strong>למידה מהשגיאות:</strong> מה שלא אהבת עוזר לי להבין מה לא להציע יותר</li>
              <li><strong>התאמה אישית:</strong> אני יוצר לוקים חדשים על בסיס מה שלמדתי עליך</li>
              <li><strong>שיפור מתמיד:</strong> כל פידבק חדש משפר את ההבנה שלי</li>
            </ol>
          </div>

          <div className="bg-white/70 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">⚙️ שלבי הלמידה:</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">1</div>
                <div>
                  <div className="font-medium">התחלתי (0-4 פידבקים)</div>
                  <div className="text-sm text-gray-600">לוקים רנדומליים מכל הבגדים</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-sm">2</div>
                <div>
                  <div className="font-medium">בסיסי (5-9 פידבקים)</div>
                  <div className="text-sm text-gray-600">מתחיל להבין העדפות בסיסיות</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center text-sm">3</div>
                <div>
                  <div className="font-medium">בינוני (10-19 פידבקים)</div>
                  <div className="text-sm text-gray-600">למידה חכמה ודפוסים מתקדמים</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-sm">4</div>
                <div>
                  <div className="font-medium">מתקדם (20+ פידבקים)</div>
                  <div className="text-sm text-gray-600">מומחה בטעם שלך - לוקים מותאמים אישית</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSourcesBreakdown = () => {
    if (!userStats?.sourcesUsed) return null;

    const sources = userStats.sourcesUsed;
    const total = Object.values(sources).reduce((sum, count) => sum + count, 0);

    if (total === 0) return null;

    const sourceConfig = {
      smart_learning: { name: 'למידה חכמה', color: 'bg-green-500', icon: '🎯' },
      basic_preferences: { name: 'העדפות בסיסיות', color: 'bg-blue-500', icon: '💡' },
      ai: { name: 'בינה מלאכותית', color: 'bg-purple-500', icon: '🤖' },
      random: { name: 'רנדומלי', color: 'bg-gray-500', icon: '🎲' }
    };

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 מקורות הלוקים שלך</h3>
        
        <div className="space-y-3">
          {Object.entries(sources).map(([source, count]) => {
            if (count === 0) return null;
            const config = sourceConfig[source];
            const percentage = Math.round((count / total) * 100);
            
            return (
              <div key={source} className="flex items-center gap-3">
                <span className="text-lg">{config.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{config.name}</span>
                    <span className="text-sm text-gray-600">{count} לוקים ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${config.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            💡 <strong>מה זה אומר:</strong> ככל שתתני יותר פידבק, כך יהיו יותר לוקים מ"למידה חכמה" ופחות רנדומליים
          </p>
        </div>
      </div>
    );
  };

  const renderFeedbackStats = () => {
    if (!userStats) return null;

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 הפידבקים שלך</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <div className="text-2xl">❤️</div>
            <div className="text-xl font-bold text-pink-600">{userStats.loves}</div>
            <div className="text-sm text-gray-600">מושלם</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl">👍</div>
            <div className="text-xl font-bold text-blue-600">{userStats.likes}</div>
            <div className="text-sm text-gray-600">חמוד</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl">👎</div>
            <div className="text-xl font-bold text-red-600">{userStats.dislikes}</div>
            <div className="text-sm text-gray-600">לא מתאים</div>
          </div>
        </div>

        {userStats.totalFeedbacks > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              🎯 <strong>שיעור הצלחה:</strong> {Math.round(((userStats.likes + userStats.loves) / userStats.totalFeedbacks) * 100)}% מהלוקים שלי מצאו חן בעיניך!
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderTips = () => {
    const currentLevel = userStats?.learningLevel || 'התחלתי';
    
    const tips = {
      'התחלתי': [
        'תני פידבק לכל לוק שאני מציע - זה עוזר לי ללמוד!',
        'אל תחסכי על לחיצות 👎 - גם מה שלא אהבת עוזר לי',
        'נסי סגנונות שונים כדי שאלמד את הטווח שלך'
      ],
      'בסיסי': [
        'מעולה! אני מתחיל להכיר אותך',
        'המשיכי לתת פידבק - אני לומד מהר!',
        'שימי לב שאני כבר מנסה להתאים את ההצעות שלי'
      ],
      'בינוני': [
        'וואו! אני כבר מכיר אותך די טוב',
        'תשימי לב לשיפור באיכות ההצעות שלי',
        'עוד קצת פידבק ואגיע לרמה המתקדמת ביותר!'
      ],
      'מתקדם': [
        'מושלם! אני מומחה בטעם שלך',
        'רוב הלוקים שלי עכשיו מותאמים אישית בדיוק לך',
        'המשיכי לתת פידבק כדי שאשמור על הרמה הגבוהה'
      ]
    };

    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
        <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
          💡 טיפים להשתפרות
        </h3>
        
        <div className="space-y-2">
          {tips[currentLevel]?.map((tip, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">•</span>
              <span className="text-sm text-gray-700">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-bold text-gray-900">👗 My Style AI</h1>
            </div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">טוען נתונים...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">👗 My Style AI</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">הפרופיל שלי</h1>
          <p className="text-gray-600">כל מה שהבינה המלאכותית יודעת עליך ואיך היא לומדת</p>
        </div>

        {renderAIInsights()}
        {renderLearningProcess()}
        {renderSourcesBreakdown()}
        {renderFeedbackStats()}
        {renderTips()}
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            🔒 כל הנתונים שלך נשמרים באופן פרטי ומאובטח. הבינה המלאכותית לומדת רק מהפידבקים שלך.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;