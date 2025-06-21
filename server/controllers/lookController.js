import Look from "../../config/models/look.js";
import Clothing from "../../config/models/allClothing.js";
import PersonalPreference from "../../config/models/personalPrefer.js";
import { suggestLookWithOpenAI } from "../services/openaiService.js";

export const suggestOutfitFromClothingDB = async (req, res) => {
  try {
    const userId = req.userId;
    const clothes = await Clothing.find({ user: userId });

    if (clothes.length === 0) {
      return res.status(400).json({ error: "אין בגדים בארון שלך" });
    }

    const tops = clothes.filter(item =>
      ['Shirt', 'Blouse', 'T-shirt', 'Sweater', 'Hoodie', 'Top', 'Jacket', 'Pullover'].includes(item.category || item.name)
    );
    const bottoms = clothes.filter(item =>
      ['Pants', 'Jeans', 'Skirt', 'Shorts'].includes(item.category || item.name)
    );
    const dresses = clothes.filter(item =>
      ['Dress', 'Robe'].includes(item.category || item.name)
    );

    let suggestedItems = [];

    if (dresses.length > 0 && Math.random() > 0.5) {
      const randomDress = dresses[Math.floor(Math.random() * dresses.length)];
      suggestedItems.push(randomDress);
    } else {
      if (tops.length > 0) {
        const randomTop = tops[Math.floor(Math.random() * tops.length)];
        suggestedItems.push(randomTop);
      }

      if (bottoms.length > 0) {
        const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
        suggestedItems.push(randomBottom);
      }
    }

    if (suggestedItems.length === 0) {
      return res.status(400).json({ error: "לא נמצאו פריטים מתאימים להצעה" });
    }

    const suggestion = {
      items: suggestedItems.map(item => ({
        _id: item._id,
        name: item.name,
        image: item.image,
        category: item.category || item.name,
        color: item.color
      })),
      style: "Casual",
      season: "Current",
      isTemporary: true
    };

    res.status(200).json({ suggestion });
  } catch (err) {
    console.error("Suggest outfit error:", err);
    res.status(500).json({ error: "שגיאה ביצירת הצעת לוק" });
  }
};

export const saveLookFeedback = async (req, res) => {
  try {
    const { lookId, feedback } = req.body;
    const userId = req.userId;

    if (!lookId || !feedback || !['like', 'dislike', 'love'].includes(feedback)) {
      return res.status(400).json({ error: "נתונים לא תקינים" });
    }

    const look = await Look.findById(lookId);
    if (!look) {
      return res.status(404).json({ error: "לוק לא נמצא" });
    }

    const normalizeColor = (color) => {
      const colorMap = {
        'dark blue': 'blue',
        'light blue': 'blue',
        'navy blue': 'blue',
        'navy': 'blue',
        'dark green': 'green',
        'light green': 'green',
        'dark red': 'red',
        'light red': 'red',
        'pink': 'pink',
        'beige': 'brown',
        'tan': 'brown',
        'gray': 'grey',
        'grey': 'grey'
      };
      
      const normalized = color ? color.toLowerCase().trim() : '';
      return colorMap[normalized] || normalized;
    };
    const lookSnapshot = {
      style: look.style,
      season: look.season,
      colors: [...new Set(look.items.map(item => item.color).filter(Boolean))],
      categories: [...new Set(look.items.map(item => item.category).filter(Boolean))],
      itemCount: look.items.length
    };

    let existingPreference = await PersonalPreference.findOne({
      user: userId,
      lookId: lookId
    });

    if (existingPreference) {
      existingPreference.feedback = feedback;
      existingPreference.feedbackDate = new Date();
      existingPreference.weight = 1.0; 
      existingPreference.lookSnapshot = lookSnapshot;
      await existingPreference.save();
    } else {
      const newPreference = new PersonalPreference({
        user: userId,
        lookId: lookId,
        lookSnapshot: lookSnapshot,
        feedback: feedback
      });
      await newPreference.save();
    }

    if (feedback === 'like' || feedback === 'love') {
      look.favorited = true;
      await look.save();
    } else if (feedback === 'dislike') {
      look.favorited = false;
      await look.save();
    }

    res.status(200).json({ 
      message: "פידבק נשמר בהצלחה",
      feedback: feedback 
    });

  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(500).json({ error: "שגיאה בשמירת פידבק" });
  }
};
export const getUserStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    // קבלת כמות לוקים
    const totalLooks = await Look.countDocuments({ user: userId });
    
    // קבלת לוקים מועדפים
    const favoriteLooks = await Look.countDocuments({ user: userId, favorited: true });
    
    // קבלת סטטיסטיקות לפי עונות
    const seasonStats = await Look.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$season", count: { $sum: 1 } } }
    ]);
    
    // קבלת סטטיסטיקות לפי סגנונות
    const styleStats = await Look.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$style", count: { $sum: 1 } } }
    ]);
    
    // קבלת פידבקים
    const feedbackStats = await PersonalPreference.aggregate([
      { $match: { user: userId, isActive: true } },
      { $group: { _id: "$feedback", count: { $sum: 1 } } }
    ]);

    const stats = {
      totalLooks,
      favoriteLooks,
      seasonStats: seasonStats.reduce((acc, item) => {
        acc[item._id || 'לא צוין'] = item.count;
        return acc;
      }, {}),
      styleStats: styleStats.reduce((acc, item) => {
        acc[item._id || 'לא צוין'] = item.count;
        return acc;
      }, {}),
      feedbackStats: feedbackStats.reduce((acc, item) => {
        acc[item._id || 'ללא פידבק'] = item.count;
        return acc;
      }, {})
    };

    res.status(200).json({ stats });
  } catch (err) {
    console.error("Error getting user stats:", err);
    res.status(500).json({ error: "שגיאה בקבלת סטטיסטיקות משתמש" });
  }
};
export const createSmartLookFromAI = async (req, res) => {
  try {
    const userId = req.userId;
    const { stylePreference } = req.body;

    if (!stylePreference) {
      return res.status(400).json({ error: "חסרה בחירת סגנון" });
    }

    // שלב 1: קבלת בגדים
    let clothes = await Clothing.find({
      user: userId,
      tags: { $elemMatch: { $regex: new RegExp(`^${stylePreference}$`, 'i') } }
    });

    if (clothes.length < 3) {
      clothes = await Clothing.find({ user: userId });
    }

    if (clothes.length === 0) {
      return res.status(400).json({ error: "אין בגדים בארון שלך." });
    }

    // שלב 2: קבלת לוקים קיימים (חודש אחרון)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const existingLooks = await Look.find({ 
      user: userId, 
      style: stylePreference,
      createdAt: { $gte: oneMonthAgo }
    });
    
    const existingCombinations = existingLooks.map(look => 
      look.items.map(item => item._id.toString()).sort().join(',')
    );

    // שלב 3: קבלת העדפות המשתמשת
    const userPreferences = await PersonalPreference.getUserPreferences(userId);
    
    // שלב 4: אסטרטגיה חדשה - פחות קריאות AI, יותר לוגיקה חכמה
    let newLook = null;
    
    // אם יש העדפות, נשתמש בהן קודם
    if (userPreferences.length > 0) {
      console.log("משתמש בהעדפות קיימות...");
      newLook = await createLookFromPreferences(userId, clothes, stylePreference, existingCombinations, userPreferences);
    }
    
    // אם לא נמצא לוק מהעדפות, ננסה AI (מקסימום 3 נסיונות!)
    if (!newLook) {
      console.log("מנסה עם AI...");
      newLook = await createLookWithLimitedAI(userId, clothes, stylePreference, existingCombinations, 3);
    }
    
    // אם גם זה לא עבד, לוק רנדומלי חכם
    if (!newLook) {
      console.log("יוצר לוק רנדומלי חכם...");
      newLook = await createSmartRandomLook(userId, clothes, stylePreference, existingCombinations);
    }

    if (!newLook) {
      return res.status(200).json({ 
        look: null, 
        message: "נוצרו כל הלוקים החדשים האפשריים השבוע. חזור מחר לעוד הצעות!" 
      });
    }

    res.status(200).json({ look: newLook });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "שגיאה ביצירת לוק מה-AI" });
  }
};

// פונקציה חדשה: יצירת לוק מהעדפות קיימות
const createLookFromPreferences = async (userId, clothes, stylePreference, existingCombinations, userPreferences) => {
  // ניתוח העדפות
  const likedPreferences = userPreferences.filter(p => p.feedback === 'like');
  
  if (likedPreferences.length === 0) return null;
  
  // צבעים מועדפים
  const preferredColors = {};
  const preferredCategories = {};
  
  likedPreferences.forEach(pref => {
    pref.lookSnapshot.colors.forEach(color => {
      preferredColors[color] = (preferredColors[color] || 0) + pref.weight;
    });
    pref.lookSnapshot.categories.forEach(cat => {
      preferredCategories[cat] = (preferredCategories[cat] || 0) + pref.weight;
    });
  });
  
  // מיון לפי העדפה
  const sortedColors = Object.entries(preferredColors)
    .sort(([,a], [,b]) => b - a)
    .map(([color]) => color);
  
  const sortedCategories = Object.entries(preferredCategories)
    .sort(([,a], [,b]) => b - a)
    .map(([cat]) => cat);
  
  // ניסיון יצירת לוק מהעדפות
  for (let attempt = 0; attempt < 10; attempt++) {
    const selectedItems = [];
    
    // בחירת פריטים לפי העדפות צבע וקטגוריה
    const availableClothes = [...clothes];
    
    // נסה ליצור לוק עם הצבעים המועדפים
    for (const preferredColor of sortedColors.slice(0, 3)) {
      const colorMatches = availableClothes.filter(item => 
        item.color && item.color.toLowerCase().includes(preferredColor.toLowerCase())
      );
      
      if (colorMatches.length > 0) {
        const randomMatch = colorMatches[Math.floor(Math.random() * colorMatches.length)];
        if (!selectedItems.find(item => item._id.toString() === randomMatch._id.toString())) {
          selectedItems.push(randomMatch);
        }
      }
    }
    
    // השלמת לוק אם צריך
    if (selectedItems.length < 2) {
      const remaining = availableClothes.filter(item => 
        !selectedItems.find(selected => selected._id.toString() === item._id.toString())
      );
      
      while (selectedItems.length < 3 && remaining.length > 0) {
        const randomItem = remaining.splice(Math.floor(Math.random() * remaining.length), 1)[0];
        selectedItems.push(randomItem);
      }
    }

    // תיקון: ולידציה מחמירה יותר
    if (selectedItems.length >= 2 && validateLookCombination(selectedItems)) {
      const combinationKey = selectedItems.map(item => item._id.toString()).sort().join(',');
      
      if (!existingCombinations.includes(combinationKey)) {
        const newLook = new Look({
          user: userId,
          items: selectedItems.map(item => ({
            _id: item._id,
            name: item.name,
            image: item.image,
            category: item.category || item.name,
            color: item.color
          })),
          style: stylePreference,
          season: selectedItems[0].season || "Summer",
          source: "preferences" // מארק שזה מהעדפות
        });

        await newLook.save();
        console.log("לוק נוצר מהעדפות!");
        return newLook;
      }
    }
  }
  
  return null;
};

// פונקציה חדשה: AI מוגבל
const createLookWithLimitedAI = async (userId, clothes, stylePreference, existingCombinations, maxAttempts = 3) => {
  const wardrobe = clothes.map(item => ({
    id: item._id.toString(),
    name: item.name,
    type: item.category || item.name,
    color: item.color,
    season: item.season || "כללי",
    event: item.tags?.includes("elegant") ? "elegant" : "casual"
  }));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`ניסיון AI ${attempt}/${maxAttempts}...`);
      
      const randomizedWardrobe = [...wardrobe].sort(() => Math.random() - 0.5);
      const selectedIds = await suggestLookWithOpenAI(randomizedWardrobe, stylePreference);

      if (!selectedIds || selectedIds.length === 0) continue;

      const selectedItems = clothes.filter(item =>
        selectedIds.includes(item._id.toString())
      );

      if (selectedItems.length === 0) continue;

      const isValid = validateLookCombination(selectedItems);
      if (!isValid) continue;

      const combinationKey = selectedItems.map(item => item._id.toString()).sort().join(',');
      
      if (!existingCombinations.includes(combinationKey)) {
        const newLook = new Look({
          user: userId,
          items: selectedItems.map(item => ({
            _id: item._id,
            name: item.name,
            image: item.image,
            category: item.category || item.name,
            color: item.color
          })),
          style: stylePreference,
          season: selectedItems[0].season || "Summer",
          source: "ai" // מארק שזה מ-AI
        });

        await newLook.save();
        console.log(`לוק נוצר עם AI בניסיון ${attempt}!`);
        return newLook;
      }
    } catch (error) {
      console.error(`שגיאה בניסיון AI ${attempt}:`, error);
      continue;
    }
  }
  
  return null;
};

export const getUserPreferenceStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    const preferences = await PersonalPreference.find({ user: userId, isActive: true });
    
    // ניתוח העדפות
    const stats = {
      totalFeedbacks: preferences.length,
      likes: preferences.filter(p => p.feedback === 'like').length,
      dislikes: preferences.filter(p => p.feedback === 'dislike').length,
      
      // צבעים מועדפים
      preferredColors: {},
      preferredStyles: {},
      preferredSeasons: {}
    };

    preferences.forEach(pref => {
      if (pref.feedback === 'like') {
        // ספירת צבעים מועדפים
        pref.lookSnapshot.colors.forEach(color => {
          stats.preferredColors[color] = (stats.preferredColors[color] || 0) + pref.weight;
        });
        
        // ספירת סגנונות מועדפים
        if (pref.lookSnapshot.style) {
          stats.preferredStyles[pref.lookSnapshot.style] = 
            (stats.preferredStyles[pref.lookSnapshot.style] || 0) + pref.weight;
        }
        
        // ספירת עונות מועדפות
        if (pref.lookSnapshot.season) {
          stats.preferredSeasons[pref.lookSnapshot.season] = 
            (stats.preferredSeasons[pref.lookSnapshot.season] || 0) + pref.weight;
        }
      }
    });

    res.status(200).json({ stats });
  } catch (err) {
    console.error("Error getting preference stats:", err);
    res.status(500).json({ error: "שגיאה בקבלת סטטיסטיקות" });
  }
};

// פונקציה לעדכון משקלי העדפות (לריצה תקופתית)
export const updatePreferenceWeights = async (req, res) => {
  try {
    const userId = req.userId;
    
    const preferences = await PersonalPreference.find({ user: userId, isActive: true });
    
    let updatedCount = 0;
    for (const pref of preferences) {
      const oldWeight = pref.weight;
      pref.updateWeight();
      
      if (oldWeight !== pref.weight) {
        await pref.save();
        updatedCount++;
      }
    }

    res.status(200).json({ 
      message: `עודכנו ${updatedCount} העדפות`,
      updatedCount 
    });
  } catch (err) {
    console.error("Error updating weights:", err);
    res.status(500).json({ error: "שגיאה בעדכון משקלים" });
  }
};

// הפונקציות הקיימות...
export const getAllLooks = async (req, res) => {
  try {
    const looks = await Look.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ looks });
  } catch (err) {
    console.error("שגיאה בקבלת לוקים:", err);
    res.status(500).json({ error: "שגיאה בטעינת לוקים" });
  }
};

// תיקון הפונקציה הזו - ולידציה מחמירה יותר נגד לוקים לא חוקיים
const validateLookCombination = (items) => {
  console.log("מתחיל ולידציה של הפריטים:", items.map(i => ({ name: i.name, category: i.category })));
  
  const normalize = (c) => {
    const cleanCategory = (c || "").toLowerCase().trim();
    const map = {
      "t-shirt": "top",
      "blouse": "top", 
      "shirt": "top",
      "top": "top",
      "sweater": "top",
      "hoodie": "top",
      "jacket": "top",
      "pullover": "top",
      "pants": "bottom",
      "jeans": "bottom",
      "shorts": "bottom",
      "skirt": "bottom",
      "dress": "dress",
      "robe": "dress"
    };
    
    const normalized = map[cleanCategory] || "other";
    console.log(`מקטגוריה '${cleanCategory}' -> '${normalized}'`);
    return normalized;
  };

  const normCats = items.map(item =>
    normalize(item.category || item.name || "")
  ).filter(cat => cat !== "other"); // מסנן פריטים לא מזוהים

  console.log("קטגוריות מנורמלות:", normCats);

  const topCount = normCats.filter(cat => cat === "top").length;
  const bottomCount = normCats.filter(cat => cat === "bottom").length;
  const dressCount = normCats.filter(cat => cat === "dress").length;

  console.log(`ספירה: חולצות=${topCount}, תחתונים=${bottomCount}, שמלות=${dressCount}`);

  // חוקי ולידציה מחמירים:
  // 1. אסור יותר משמלה אחת
  if (dressCount > 1) {
    console.log("❌ יותר משמלה אחת - לא תקין");
    return false;
  }

  // 2. אסור יותר מחולצה אחת
  if (topCount > 1) {
    console.log("❌ יותר מחולצה אחת - לא תקין");
    return false;
  }

  // 3. אסור יותר מתחתון אחד
  if (bottomCount > 1) {
    console.log("❌ יותר מתחתון אחד - לא תקין");
    return false;
  }

  // 4. אם יש שמלה, אסור חולצה או תחתון
  if (dressCount === 1 && (topCount > 0 || bottomCount > 0)) {
    console.log("❌ שמלה עם חולצה/תחתון - לא תקין");
    return false;
  }

  // 5. אם אין שמלה, חייבים חולצה וגם תחתון
  if (dressCount === 0 && (topCount === 0 || bottomCount === 0)) {
    console.log("❌ בלי שמלה חייבים גם חולצה וגם תחתון - לא תקין");
    return false;
  }

  // 6. הכל בסדר
  const isValid = dressCount === 1 || (topCount === 1 && bottomCount === 1);
  console.log(`✅ לוק ${isValid ? 'תקין' : 'לא תקין'}`);
  
  return isValid;
};

const createSmartRandomLook = async (userId, clothes, stylePreference, existingCombinations) => {
  console.log("מתחיל יצירת לוק רנדומלי חכם...");
  
  const categorizeClothes = (clothes) => {
    const categories = {
      tops: [],
      bottoms: [],
      dresses: [],
      shoes: [],
      accessories: []
    };

    clothes.forEach(item => {
      const category = (item.category || item.name || "").toLowerCase();
      
      if (['shirt', 'blouse', 't-shirt', 'sweater', 'hoodie', 'top', 'jacket', 'pullover'].includes(category)) {
        categories.tops.push(item);
      } else if (['pants', 'jeans', 'skirt', 'shorts'].includes(category)) {
        categories.bottoms.push(item);
      } else if (['dress', 'robe'].includes(category)) {
        categories.dresses.push(item);
      } else if (['shoes', 'boots', 'sneakers', 'heels', 'sandals'].includes(category)) {
        categories.shoes.push(item);
      } else {
        categories.accessories.push(item);
      }
    });

    console.log("קטגוריות בגדים:", {
      tops: categories.tops.length,
      bottoms: categories.bottoms.length,
      dresses: categories.dresses.length,
      shoes: categories.shoes.length,
      accessories: categories.accessories.length
    });

    return categories;
  };

  const categories = categorizeClothes(clothes);
  const maxRandomAttempts = 30; // הפחתתי את מספר הניסיונות
  let randomAttempt = 0;

  while (randomAttempt < maxRandomAttempts) {
    randomAttempt++;
    console.log(`ניסיון רנדומלי ${randomAttempt}/${maxRandomAttempts}`);
    
    let selectedItems = [];

    // אסטרטגיות יצירת לוק - עם עדיפות לשמלות בודדות
    const strategies = [
      // אסטרטגיה 1: שמלה בלבד (חזק יותר)
      () => {
        if (categories.dresses.length > 0) {
          const dress = categories.dresses[Math.floor(Math.random() * categories.dresses.length)];
          selectedItems.push(dress);
          console.log("נבחרה שמלה:", dress.name);
        }
      },
      
      // אסטרטגיה 2: חולצה + תחתון
      () => {
        if (categories.tops.length > 0 && categories.bottoms.length > 0) {
          const top = categories.tops[Math.floor(Math.random() * categories.tops.length)];
          const bottom = categories.bottoms[Math.floor(Math.random() * categories.bottoms.length)];
          selectedItems.push(top, bottom);
          console.log("נבחרו חולצה + תחתון:", top.name, "+", bottom.name);
        }
      }
    ];

    // בחירת אסטרטגיה - 70% סיכוי לשמלה אם יש
    let chosenStrategy;
    if (categories.dresses.length > 0 && Math.random() < 0.7) {
      chosenStrategy = strategies[0]; // שמלה
    } else {
      chosenStrategy = strategies[1]; // חולצה + תחתון
    }
    
    chosenStrategy();

    if (selectedItems.length === 0) {
      console.log("לא נבחרו פריטים בסיסיים - ממשיך לניסיון הבא");
      continue;
    }

    // הוספת נעליים (אופציונלי)
    if (categories.shoes.length > 0 && Math.random() > 0.5) {
      const shoes = categories.shoes[Math.floor(Math.random() * categories.shoes.length)];
      selectedItems.push(shoes);
      console.log("נוספו נעליים:", shoes.name);
    }

    // בדיקת ולידציה לפני יצירת הלוק
    if (!validateLookCombination(selectedItems)) {
      console.log("הלוק לא עבר ולידציה - ממשיך לניסיון הבא");
      continue;
    }

    const combinationKey = selectedItems.map(item => item._id.toString()).sort().join(',');
    
    if (!existingCombinations.includes(combinationKey)) {
      const newLook = new Look({
        user: userId,
        items: selectedItems.map(item => ({
          _id: item._id,
          name: item.name,
          image: item.image,
          category: item.category || item.name,
          color: item.color
        })),
        style: stylePreference,
        season: selectedItems[0].season || "Summer",
        source: "random"
      });

      await newLook.save();
      console.log(`✅ לוק רנדומלי נוצר בהצלחה בניסיון ${randomAttempt}`);
      return newLook;
    } else {
      console.log("השילוב כבר קיים - ממשיך לניסיון הבא");
    }
  }

  console.log("❌ לא הצלחתי ליצור לוק רנדומלי חדש");
  return null;
};

export const toggleFavoriteLook = async (req, res) => {
  try {
    const look = await Look.findById(req.params.lookId);
    if (!look) {
      return res.status(404).json({ error: "לוק לא נמצא" });
    }

    if (look.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "אין הרשאה לעדכן לוק זה" });
    }

    look.favorited = !look.favorited;
    await look.save();

    res.status(200).json({ favorited: look.favorited });
  } catch (err) {
    console.error("Toggle favorite error:", err);
    res.status(500).json({ error: "שגיאה בעדכון מועדף" });
  }
};

export const getFavoriteLooks = async (req, res) => {
  try {
    const looks = await Look.find({ user: req.userId, favorited: true }).sort({ createdAt: -1 });
    res.status(200).json({ looks });
  } catch (err) {
    console.error("Get favorites error:", err);
    res.status(500).json({ error: "שגיאה בקבלת מועדפים" });
  }
};

export const deleteLook = async (req, res) => {
  try {
    const { lookId } = req.params;

    const look = await Look.findOneAndDelete({ _id: lookId, user: req.userId });

    if (!look) {
      return res.status(404).json({ error: "לוק לא נמצא או אין הרשאה למחוק" });
    }

    res.status(200).json({ message: "לוק נמחק בהצלחה" });
  } catch (err) {
    console.error("Delete look error:", err);
    res.status(500).json({ error: "שגיאה במחיקת לוק" });
  }
};