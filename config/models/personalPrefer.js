import mongoose from 'mongoose';

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
    max: 1
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
  
  if (daysSinceFeedback > 365) {
    this.weight = 0.3; // פידבק ישן מאוד
  } else if (daysSinceFeedback > 180) {
    this.weight = 0.5; // פידבק בן חצי שנה
  } else if (daysSinceFeedback > 90) {
    this.weight = 0.7; // פידבק בן 3 חודשים
  } else if (daysSinceFeedback > 30) {
    this.weight = 0.9; // פידבק בן חודש
  } else {
    this.weight = 1.0; // פידבק טרי
  }
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
  
  if (preferences.length === 0) {
    return 0.5; 
  }
  
  let totalScore = 0;
  let totalWeight = 0;
  
  preferences.forEach(pref => {
    let matchScore = 0;
    
    if (pref.lookSnapshot.style === lookData.style) {
      matchScore += 0.3;
    }
    
    if (pref.lookSnapshot.season === lookData.season) {
      matchScore += 0.2;
    }
    
      const colorMatches = lookData.colors.filter(color => 
      pref.lookSnapshot.colors.some(prefColor => 
        prefColor.includes(color) || color.includes(prefColor)
      )
    ).length;
    
    if (pref.lookSnapshot.colors.length > 0) {
      matchScore += (colorMatches / Math.max(pref.lookSnapshot.colors.length, lookData.colors.length)) * 0.3;
    }
    
    const categoryMatches = lookData.categories.filter(cat => 
      pref.lookSnapshot.categories.includes(cat)
    ).length;
    
    if (pref.lookSnapshot.categories.length > 0) {
      matchScore += (categoryMatches / pref.lookSnapshot.categories.length) * 0.2;
    }
    
    let feedbackMultiplier = 0;
    if (pref.feedback === 'love') feedbackMultiplier = 2;
    else if (pref.feedback === 'like') feedbackMultiplier = 1;
    else if (pref.feedback === 'dislike') feedbackMultiplier = -1;
    
    totalScore += matchScore * feedbackMultiplier * pref.weight;
    totalWeight += Math.abs(feedbackMultiplier) * pref.weight;
  });
  
  const normalizedScore = totalWeight > 0 ? 
    Math.max(0, Math.min(1, (totalScore / totalWeight + 1) / 2)) : 0.5;
  
  return normalizedScore;
};

const PersonalPreference = mongoose.model('PersonalPreference', personalPreferenceSchema);
export default PersonalPreference;