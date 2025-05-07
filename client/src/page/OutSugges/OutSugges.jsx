import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import { getOutfitSuggestionsFromDB } from '../../../api/aiService'

function OutSugges() {
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);

  // 👇 כאן תכניסי את ה־userId של המשתמש הנוכחי (בפיתוח אפשר לשים ידנית)
  const userId = "665e0b7a1f3c3a2b4c9f0123"; // החליפי ל-ID האמיתי שלך

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const result = await getOutfitSuggestionsFromDB(userId);
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error(error);
      setSuggestions("😞 לא הצלחנו להציע שילוב כרגע.");
    }
    setLoading(false);
  };

  return (
    <div>
      <Header />
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>✨ הצעות לבוש מה-AI ✨</h1>
        <button onClick={handleSuggest} disabled={loading}>
          {loading ? 'חושב על השילוב המושלם...' : 'הצע לי שילוב מהארון שלי'}
        </button>
        <div style={{ marginTop: '1.5rem', whiteSpace: 'pre-wrap', direction: 'rtl' }}>
          {suggestions && <p>{suggestions}</p>}
        </div>
      </div>
    </div>
  );
}

export default OutSugges;
