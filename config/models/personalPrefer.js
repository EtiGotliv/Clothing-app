import mongoose from 'mongoose';

const normalizeColor = (color) => {
  const colorMap = {
    // כחול
    'dark blue': 'blue', 'light blue': 'blue', 'navy blue': 'blue', 
    'navy': 'blue', 'royal blue': 'blue', 'sky blue': 'blue',
    // ירוק
    'dark green': 'green', 'light green': 'green', 'olive': 'green',
    'forest green': 'green', 'mint': 'green',
    // אדום
    'dark red': 'red', 'light red': 'red', 'burgundy': 'red',
    'wine': 'red', 'crimson': 'red', 'cherry': 'red',
    // ורוד
    'light pink': 'pink', 'hot pink': 'pink', 'rose': 'pink',
    // חום
    'beige': 'brown', 'tan': 'brown', 'chocolate': 'brown',
    'camel': 'brown', 'sand': 'brown',
    // אפור
    'gray': 'grey', 'light grey': 'grey', 'dark grey': 'grey',
    'charcoal': 'grey', 'silver': 'grey'
  };
  
  const normalized = color ? color.toLowerCase().trim() : '';
  return colorMap[normalized] || normalized;
};

const personalPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  lookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Look',
    required: true
  },
  
  lookSnapshot: {
    style: String,      // casual/elegant
    season: String,     // Summer/Winter/Fall/Spring
    colors: [String],   // ["blue", "white", "black"]
    categories: [String], // ["shirt", "jeans", "shoes"]
    itemCount: Number  
  },
  
  feedback: {
    type: String,
    enum: ['like', 'dislike', 'love'],
    required: true
  },
  
  feedbackDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  weight: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 1.5
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  inactiveReason: {
    type: String,
    enum: ['taste_changed', 'outdated', 'season_mismatch']
  }
}, {
  timestamps: true
});

personalPreferenceSchema.index({ user: 1, feedbackDate: -1 });
personalPreferenceSchema.index({ user: 1, feedback: 1, isActive: 1 });
personalPreferenceSchema.index({ user: 1, 'lookSnapshot.style': 1 });

personalPreferenceSchema.methods.updateWeight = function() {
  const daysSinceFeedback = (Date.now() - this.feedbackDate) / (1000 * 60 * 60 * 24);
  
  // משקל בסיס לפי סוג הפידבק
  let baseWeight = 1.0;
  if (this.feedback === 'love') baseWeight = 1.5;
  else if (this.feedback === 'like') baseWeight = 1.0;
  else if (this.feedback === 'dislike') baseWeight = 0.8;
  
  // דעיכה לפי זמן (יותר הדרגתית)
  let timeDecay = 1.0;
  if (daysSinceFeedback > 365) {
    timeDecay = 0.2; // פידבק מעל שנה
  } else if (daysSinceFeedback > 180) {
    timeDecay = 0.4; // פידבק מעל 6 חודשים
  } else if (daysSinceFeedback > 90) {
    timeDecay = 0.6; // פידבק מעל 3 חודשים
  } else if (daysSinceFeedback > 30) {
    timeDecay = 0.8; // פידבק מעל חודש
  } else if (daysSinceFeedback > 7) {
    timeDecay = 0.9; // פידבק מעל שבוע
  }
  // אחרת נשאר 1.0 (פידבק טרי)
  
  this.weight = Math.max(0.1, Math.min(1.5, baseWeight * timeDecay));
};

personalPreferenceSchema.statics.getUserPreferences = async function(userId) {
  const preferences = await this.find({ 
    user: userId, 
    isActive: true 
  }).sort({ feedbackDate: -1 });
  
  preferences.forEach(pref => pref.updateWeight());
  
  return preferences;
};

personalPreferenceSchema.statics.calculateLookScore = async function(userId, lookData) {
  const preferences = await this.getUserPreferences(userId);
  
  if (preferences.length < 3) {
    return 0.5; // לא מספיק נתונים ללמידה
  }
  
  // הפרדה בין פידבק חיובי לשלילי
  const positivePrefs = preferences.filter(p => ['like', 'love'].includes(p.feedback));
  const negativePrefs = preferences.filter(p => p.feedback === 'dislike');
  
  let positiveScore = 0;
  let negativeScore = 0;
  let totalPositiveWeight = 0;
  let totalNegativeWeight = 0;
  
  // חישוב ציון חיובי
  positivePrefs.forEach(pref => {
    let matchScore = 0;
    
    // התאמת סגנון (30%)
    if (pref.lookSnapshot.style === lookData.style) {
      matchScore += 0.3;
    }
    
    // התאמת עונה (15%)
    if (pref.lookSnapshot.season === lookData.season) {
      matchScore += 0.15;
    }
    
    // התאמת צבעים (35%) - שיפור
    const lookColors = lookData.colors.map(c => normalizeColor(c));
    const prefColors = pref.lookSnapshot.colors.map(c => normalizeColor(c));
    
    const colorMatches = lookColors.filter(color => 
      prefColors.some(prefColor => prefColor === color)
    ).length;
    
    if (prefColors.length > 0 && lookColors.length > 0) {
      const colorMatchRatio = colorMatches / Math.max(prefColors.length, lookColors.length);
      matchScore += colorMatchRatio * 0.35;
    }
    
    // התאמת קטגוריות (20%)
    const categoryMatches = lookData.categories.filter(cat => 
      pref.lookSnapshot.categories.includes(cat)
    ).length;
    
    if (pref.lookSnapshot.categories.length > 0) {
      const categoryMatchRatio = categoryMatches / pref.lookSnapshot.categories.length;
      matchScore += categoryMatchRatio * 0.2;
    }
    
    // משקל מיוחד ל-LOVE
    const feedbackMultiplier = pref.feedback === 'love' ? 2.5 : 1.5;
    
    positiveScore += matchScore * feedbackMultiplier * pref.weight;
    totalPositiveWeight += feedbackMultiplier * pref.weight;
  });
  
  // חישוב ציון שלילי (מה לא לכלול)
  negativePrefs.forEach(pref => {
    let avoidScore = 0;
    
    // אם יש התאמה גבוהה למשהו ששנאו - להוריד נקודות
    if (pref.lookSnapshot.style === lookData.style) {
      avoidScore += 0.4;
    }
    
    const lookColors = lookData.colors.map(c => normalizeColor(c));
    const prefColors = pref.lookSnapshot.colors.map(c => normalizeColor(c));
    
    const colorMatches = lookColors.filter(color => 
      prefColors.some(prefColor => prefColor === color)
    ).length;
    
    if (prefColors.length > 0 && colorMatches > 0) {
      avoidScore += (colorMatches / prefColors.length) * 0.6;
    }
    
    negativeScore += avoidScore * pref.weight;
    totalNegativeWeight += pref.weight;
  });
  
  // חישוב ציון סופי
  const normalizedPositive = totalPositiveWeight > 0 ? 
    positiveScore / totalPositiveWeight : 0;
  const normalizedNegative = totalNegativeWeight > 0 ? 
    negativeScore / totalNegativeWeight : 0;
  
  // ציון סופי: מתחיל מ-0.5 (נייטרלי), עולה עם חיובי, יורד עם שלילי
  let finalScore = 0.5 + (normalizedPositive * 0.4) - (normalizedNegative * 0.3);
  
  return Math.max(0.1, Math.min(0.9, finalScore));
};

// תוספת: פונקציה לזיהוי דפוסים מתקדמים
personalPreferenceSchema.statics.analyzeTastePatterns = async function(userId) {
  const preferences = await this.getUserPreferences(userId);
  
  if (preferences.length < 10) {
    return { hasEnoughData: false };
  }
  
  const positive = preferences.filter(p => ['like', 'love'].includes(p.feedback));
  const negative = preferences.filter(p => p.feedback === 'dislike');
  
  // דפוסי צבעים
  const colorCombinations = {};
  positive.forEach(pref => {
    if (pref.lookSnapshot.colors.length > 1) {
      const combo = pref.lookSnapshot.colors.map(c => normalizeColor(c)).sort().join('-');
      colorCombinations[combo] = (colorCombinations[combo] || 0) + pref.weight;
    }
  });
  
  // דפוסי קטגוריות
  const styleCombinations = {};
  positive.forEach(pref => {
    const combo = pref.lookSnapshot.categories.sort().join('-');
    styleCombinations[combo] = (styleCombinations[combo] || 0) + pref.weight;
  });
  
  return {
    hasEnoughData: true,
    favoriteColorCombos: Object.entries(colorCombinations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5),
    favoriteStyleCombos: Object.entries(styleCombinations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5),
    totalFeedbacks: preferences.length,
    learningConfidence: Math.min(preferences.length / 20, 1) // 0-1
  };
};

const PersonalPreference = mongoose.model('PersonalPreference', personalPreferenceSchema);
export default PersonalPreference;