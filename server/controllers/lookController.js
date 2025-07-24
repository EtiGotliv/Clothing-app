import Look from "../../config/models/look.js";
import Clothing from "../../config/models/allClothing.js";
import PersonalPreference from "../../config/models/personalPrefer.js";
import { suggestLookWithOpenAI } from "../services/openaiService.js";

const normalizeColor = (color) => {
  const colorMap = {
    'dark blue': 'blue', 'light blue': 'blue', 'navy blue': 'blue', 'navy': 'blue',
    'dark green': 'green', 'light green': 'green', 'olive': 'green',
    'dark red': 'red', 'light red': 'red', 'burgundy': 'red', 'wine': 'red',
    'light pink': 'pink', 'hot pink': 'pink', 'rose': 'pink',
    'beige': 'brown', 'tan': 'brown', 'chocolate': 'brown',
    'gray': 'grey', 'light grey': 'grey', 'dark grey': 'grey'
  };
  
  const normalized = color ? color.toLowerCase().trim() : '';
  return colorMap[normalized] || normalized;
};

const validateLookCombination = (items) => {
  const normalize = (c) => {
    const clean = (c || "").toLowerCase().trim();
    const map = {
      "t-shirt": "top", "blouse": "top", "shirt": "top", "top": "top",
      "sweater": "top", "hoodie": "top", "jacket": "top", "pullover": "top",
      "pants": "bottom", "jeans": "bottom", "shorts": "bottom", "skirt": "bottom",
      "dress": "dress", "robe": "dress"
    };
    return map[clean] || "other";
  };

  const cats = items.map(i => normalize(i.category || i.name)).filter(c => c !== "other");
  const count = (type) => cats.filter(c => c === type).length;

  const top = count("top"), bottom = count("bottom"), dress = count("dress");

  if (dress > 1 || top > 1 || bottom > 1) return false;
  if (dress === 1 && (top > 0 || bottom > 0)) return false;
  if (dress === 0 && (top === 0 || bottom === 0)) return false;

  return true;
};
const isItemMatchingStyle = (item, stylePreference) => {
  const style = stylePreference.toLowerCase();
  const tags = (item.tags || []).map(t => t.toLowerCase());
  const event = (item.event || "").toLowerCase();
  const itemStyle = (item.style || "").toLowerCase();

  if (tags.includes(style)) return true;

  if (event && event === style) return true;

  if (itemStyle && itemStyle === style) return true;

  return false;
};



const getClothesForStyle = (allClothes, stylePreference) => {
  const strictlyMatchingClothes = allClothes.filter(item => {
    return isItemMatchingStyle(item, stylePreference);
  });
  
  console.log(`🔍 נמצאו ${strictlyMatchingClothes.length} פריטים מתוך ${allClothes.length} שמתאימים לסגנון "${stylePreference}"`);
  
  if (strictlyMatchingClothes.length === 0) {
    console.warn(`⚠️ לא נמצאו בגדים שמתאימים לסגנון "${stylePreference}"`);
  }
  
  return strictlyMatchingClothes;
};

// פונקציה פשוטה להצעת לוק מהמסד נתונים (לתאימות לאחור)
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

export const createSmartLookFromAI = async (req, res) => {
  try {
    const userId = req.userId;
    const { stylePreference } = req.body;

    if (!stylePreference) {
      return res.status(400).json({ error: "חסרה בחירת סגנון" });
    }

    // קבלת כל הבגדים של המשתמש
    let clothes = await Clothing.find({ user: userId });

    if (clothes.length === 0) {
      return res.status(400).json({ error: "אין בגדים בארון שלך." });
    }

    const existingLooks = await Look.find({
      user: userId,
      style: stylePreference,
    });

    const existingCombinations = new Set(
      existingLooks.map((look) =>
        look.items.map((item) => item._id.toString()).sort().join(",")
      )
    );

    const userPreferences = await PersonalPreference.getUserPreferences(userId);
    let newLook = null;

    // אם יש מספיק פידבקים (10+), נסה ליצור לוק חכם על בסיס למידה
    if (userPreferences.length >= 10) {
      console.log("מנסה ליצור לוק חכם מבוסס למידה...");
      newLook = await createSmartLookBasedOnLearning(
        userId,
        clothes,
        stylePreference,
        Array.from(existingCombinations),
        userPreferences
      );

      if (newLook) {
        console.log("לוק חכם נוצר בהצלחה!");
        return res.status(200).json({ look: newLook });
      }
    }

    // אם יש קצת פידבקים (5+), נסה ליצור לוק מהעדפות בסיסיות
    if (userPreferences.length >= 5) {
      console.log("מנסה ליצור לוק מהעדפות בסיסיות...");
      newLook = await createLookWithBasicPreferences(
        userId,
        clothes,
        stylePreference,
        Array.from(existingCombinations),
        userPreferences
      );

      if (newLook) {
        console.log("לוק מהעדפות נוצר בהצלחה!");
        return res.status(200).json({ look: newLook });
      }
    }

    // נסה עם AI
    console.log("מנסה ליצור לוק עם AI...");
    newLook = await createLookWithLimitedAI(
      userId,
      clothes,
      stylePreference,
      Array.from(existingCombinations)
    );

    if (newLook) {
      console.log("לוק נוצר עם AI בהצלחה!");
      return res.status(200).json({ look: newLook });
    }

    // לוק רנדומלי חכם מכל הבגדים
    console.log("מנסה ליצור לוק רנדומלי חכם מכל הבגדים...");
    newLook = await createSmartRandomLook(
      userId,
      clothes,
      stylePreference,
      Array.from(existingCombinations)
    );

    if (newLook) {
      console.log("לוק רנדומלי נוצר בהצלחה!");
      return res.status(200).json({ look: newLook });
    }

    return res.status(200).json({
      look: null,
      message: "נוצרו כל הלוקים החדשים האפשריים. חזרי מחר לעוד הצעות!",
    });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "שגיאה ביצירת לוק מה-AI" });
  }
};

// פונקציה חדשה: יצירת לוק חכם על בסיס למידה (אבל עדיין מכל הבגדים)
const createSmartLookBasedOnLearning = async (userId, allClothes, style, existingKeys, preferences) => {
  // ✅ סינון קפדני של בגדים לפי סגנון
  const styleMatchingClothes = getClothesForStyle(allClothes, style);
  
  if (styleMatchingClothes.length < 2) {
    console.log(`❌ אין מספיק בגדים (${styleMatchingClothes.length}) בסגנון "${style}" ליצירת לוק`);
    return null;
  }
  
  const positivePrefs = preferences.filter(p => ['like', 'love'].includes(p.feedback));
  const negativePrefs = preferences.filter(p => p.feedback === 'dislike');
  
  if (positivePrefs.length < 3) {
    return null;
  }
  
  // למידת העדפות מהלוקים שאהבה
  const goodCategories = new Set();
  const badCategories = new Set();
  
  positivePrefs.forEach(pref => {
    if (pref.lookSnapshot.style === style) { // רק העדפות מאותו סגנון
      pref.lookSnapshot.categories.forEach(cat => goodCategories.add(cat));
    }
  });
  
  negativePrefs.forEach(pref => {
    if (pref.lookSnapshot.style === style) { // רק העדפות מאותו סגנון
      pref.lookSnapshot.categories.forEach(cat => badCategories.add(cat));
    }
  });

  // ניסיון יצירת לוק חכם מהבגדים המתאימים בלבד
  for (let attempt = 0; attempt < 30; attempt++) {
    const selected = [];
    const shuffledClothes = [...styleMatchingClothes].sort(() => Math.random() - 0.5);
    
    for (const item of shuffledClothes) {
      if (selected.length >= 3) break;
      
      const itemCategory = item.category || item.name;
      
      // וודא שהפריט באמת מתאים לסגנון
      if (!isItemMatchingStyle(item, style)) {
        continue;
      }
      
      // אם זה משהו שלא אהבנו בעבר - דלג (אבל לא תמיד)
      if (badCategories.has(itemCategory) && Math.random() < 0.7) {
        continue;
      }
      
      // בדוק אם זה משהו שכבר יש
      if (selected.find(s => s._id.equals(item._id))) {
        continue;
      }
      
      selected.push(item);
    }
    
    if (selected.length >= 2) {
      const key = selected.map(i => i._id.toString()).sort().join(',');
      
      if (validateLookCombination(selected) && !existingKeys.includes(key)) {
        const newLook = new Look({
          user: userId,
          items: selected.map(item => ({
            _id: item._id,
            name: item.name,
            image: item.image,
            category: item.category || item.name,
            color: item.color
          })),
          style,
          season: selected[0].season || "Summer",
          source: "smart_learning"
        });
        
        await newLook.save();
        return newLook;
      }
    }
  }
  
  return null;
};

// פונקציה: יצירת לוק עם העדפות בסיסיות (אבל מכל הבגדים)
const createLookWithBasicPreferences = async (userId, allClothes, style, existingKeys, preferences) => {
  // ✅ סינון קפדני של בגדים לפי סגנון
  const styleMatchingClothes = getClothesForStyle(allClothes, style);
  
  if (styleMatchingClothes.length < 2) {
    console.log(`❌ אין מספיק בגדים (${styleMatchingClothes.length}) בסגנון "${style}" ליצירת לוק`);
    return null;
  }
  
  const positivePrefs = preferences.filter(p => ['like', 'love'].includes(p.feedback));
  
  if (positivePrefs.length < 2) {
    return null;
  }
  
  for (let attempt = 0; attempt < 20; attempt++) {
    const selected = [];
    const shuffledClothes = [...styleMatchingClothes].sort(() => Math.random() - 0.5);
    
    for (const item of shuffledClothes) {
      if (selected.length >= 3) break;
      if (selected.find(s => s._id.equals(item._id))) continue;
      
      // וודא שהפריט באמת מתאים לסגנון
      if (!isItemMatchingStyle(item, style)) {
        continue;
      }
      
      selected.push(item);
    }
    
    if (selected.length >= 2) {
      const key = selected.map(i => i._id.toString()).sort().join(',');
      
      if (validateLookCombination(selected) && !existingKeys.includes(key)) {
        const newLook = new Look({
          user: userId,
          items: selected.map(item => ({
            _id: item._id,
            name: item.name,
            image: item.image,
            category: item.category || item.name,
            color: item.color
          })),
          style,
          season: selected[0].season || "Summer",
          source: "basic_preferences"
        });
        
        await newLook.save();
        return newLook;
      }
    }
  }
  
  return null;
};


// פונקציה: לוק רנדומלי חכם מכל הבגדים
const createSmartRandomLook = async (userId, allClothes, style, existingKeys) => {
  const styleMatchingClothes = getClothesForStyle(allClothes, style);
  
  if (styleMatchingClothes.length < 2) {
    console.log(`❌ אין מספיק בגדים (${styleMatchingClothes.length}) בסגנון "${style}" ליצירת לוק`);
    return null;
  }
  
  const cat = {
    tops: [], bottoms: [], dresses: [], shoes: [], accessories: []
  };

  styleMatchingClothes.forEach(item => {
    if (!isItemMatchingStyle(item, style)) return; // בדיקה נוספת
    
    const type = (item.category || item.name || "").toLowerCase();
    if (["shirt", "blouse", "t-shirt", "sweater", "hoodie", "top", "jacket", "pullover"].includes(type)) cat.tops.push(item);
    else if (["pants", "jeans", "skirt", "shorts"].includes(type)) cat.bottoms.push(item);
    else if (["dress", "robe"].includes(type)) cat.dresses.push(item);
    else if (["shoes", "boots", "sneakers", "heels", "sandals"].includes(type)) cat.shoes.push(item);
    else cat.accessories.push(item);
  });

  console.log(`📊 בסגנון "${style}": ${cat.tops.length} חולצות, ${cat.bottoms.length} תחתונים, ${cat.dresses.length} שמלות`);

  for (let i = 0; i < 50; i++) {
    let selected = [];
    
    if (cat.dresses.length && Math.random() < 0.4) {
      const dress = cat.dresses[Math.floor(Math.random() * cat.dresses.length)];
      if (isItemMatchingStyle(dress, style)) {
        selected.push(dress);
      }
    } 
    else if (cat.tops.length && cat.bottoms.length) {
      const top = cat.tops[Math.floor(Math.random() * cat.tops.length)];
      const bottom = cat.bottoms[Math.floor(Math.random() * cat.bottoms.length)];
      
      if (isItemMatchingStyle(top, style) && isItemMatchingStyle(bottom, style)) {
        selected.push(top, bottom);
      }
    } else {
      continue;
    }

    if (cat.shoes.length && Math.random() > 0.5) {
      const shoes = cat.shoes[Math.floor(Math.random() * cat.shoes.length)];
      if (isItemMatchingStyle(shoes, style)) {
        selected.push(shoes);
      }
    }

    if (cat.accessories.length && Math.random() > 0.7) {
      const accessory = cat.accessories[Math.floor(Math.random() * cat.accessories.length)];
      if (isItemMatchingStyle(accessory, style)) {
        selected.push(accessory);
      }
    }

    if (selected.length >= 2) {
      const key = selected.map(i => i._id.toString()).sort().join(',');
      if (validateLookCombination(selected) && !existingKeys.includes(key)) {
        const newLook = new Look({
          user: userId,
          items: selected.map(item => ({
            _id: item._id,
            name: item.name,
            image: item.image,
            category: item.category || item.name,
            color: item.color
          })),
          style,
          season: selected[0].season || "Summer",
          source: "random"
        });
        await newLook.save();
        return newLook;
      }
    }
  }

  return null;
};

// פונקציה: AI מוגבל
const createLookWithLimitedAI = async (userId, allClothes, style, existingKeys, max = 3) => {
  const styleMatchingClothes = getClothesForStyle(allClothes, style);

  if (styleMatchingClothes.length === 0) {
    console.warn(`⚠️ לא נמצאו בגדים שמתאימים לחלוטין לסגנון "${style}" — לא ניתן להציע לוק.`);
    return null;
  }

  const wardrobe = styleMatchingClothes.map(item => ({
    id: item._id.toString(),
    name: item.name,
    type: item.category || item.name,
    color: item.color,
    season: item.season || "כללי",
    event: (item.event || "").toLowerCase(),
    style: (item.style || "").toLowerCase(),
    tags: (item.tags || []).map(t => t.toLowerCase())
  }));

  for (let i = 0; i < max; i++) {
    try {
      const shuffledWardrobe = wardrobe.sort(() => 0.5 - Math.random());
      const selection = await suggestLookWithOpenAI(shuffledWardrobe, style);

      if (!selection?.length) continue;

      const chosen = styleMatchingClothes.filter(i =>
        selection.includes(i._id.toString())
      );

      const allMatchStyle = chosen.every(i => isItemMatchingStyle(i, style));

      if (!allMatchStyle) {
        console.warn("🚫 חלק מהפריטים שנבחרו לא תואמים ב־100% לסגנון — דילוג על הלוק. הבחירה הייתה:", selection);
        continue;
      }

      const key = chosen.map(i => i._id.toString()).sort().join(',');
      if (validateLookCombination(chosen) && !existingKeys.includes(key)) {
        const newLook = new Look({
          user: userId,
          items: chosen.map(item => ({
            _id: item._id,
            name: item.name,
            image: item.image,
            category: item.category || item.name,
            color: item.color
          })),
          style,
          season: chosen[0].season || "Summer",
          source: "ai"
        });

        await newLook.save();
        return newLook;
      }
    } catch (err) {
      console.error("שגיאה ביצירת לוק עם AI:", err);
    }
  }

  return null;
};



// שאר הפונקציות נשארות זהות...
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

    const lookSnapshot = {
      style: look.style,
      season: look.season,
      colors: [...new Set(look.items.map(item => normalizeColor(item.color)).filter(Boolean))],
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
    
    const totalLooks = await Look.countDocuments({ user: userId });
    const favoriteLooks = await Look.countDocuments({ user: userId, favorited: true });
    
    const preferences = await PersonalPreference.find({ 
      user: userId, 
      isActive: true
    });

    const stats = {
      totalLooks,
      favoriteLooks,
      totalFeedbacks: preferences.length,
      likes: preferences.filter(p => p.feedback === 'like').length,
      dislikes: preferences.filter(p => p.feedback === 'dislike').length,
      loves: preferences.filter(p => p.feedback === 'love').length,
      
      // סטטיסטיקות למידה
      learningLevel: preferences.length >= 20 ? "מתקדם" : 
                     preferences.length >= 10 ? "בינוני" : 
                     preferences.length >= 5 ? "בסיסי" : "התחלתי",
      
      confidenceLevel: Math.min(preferences.length / 20, 1),
      
      // התפלגות מקורות לוקים
      sourcesUsed: {
        smart_learning: await Look.countDocuments({ user: userId, source: "smart_learning" }),
        basic_preferences: await Look.countDocuments({ user: userId, source: "basic_preferences" }),
        ai: await Look.countDocuments({ user: userId, source: "ai" }),
        random: await Look.countDocuments({ user: userId, source: "random" })
      }
    };

    res.status(200).json({ stats });
  } catch (err) {
    console.error("Error getting user stats:", err);
    res.status(500).json({ error: "שגיאה בקבלת סטטיסטיקות משתמש" });
  }
};

// שאר הפונקציות הקיימות...
export const getAllLooks = async (req, res) => {
  try {
    const looks = await Look.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ looks });
  } catch (err) {
    console.error("שגיאה בקבלת לוקים:", err);
    res.status(500).json({ error: "שגיאה בטעינת לוקים" });
  }
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

export const getUserPreferenceStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    const preferences = await PersonalPreference.find({ user: userId, isActive: true });
    
    // ניתוח העדפות
    const stats = {
      totalFeedbacks: preferences.length,
      likes: preferences.filter(p => p.feedback === 'like').length,
      dislikes: preferences.filter(p => p.feedback === 'dislike').length,
      loves: preferences.filter(p => p.feedback === 'love').length,
      
      // צבעים מועדפים
      preferredColors: {},
      preferredStyles: {},
      preferredSeasons: {}
    };

    preferences.forEach(pref => {
      if (pref.feedback === 'like' || pref.feedback === 'love') {
        // ספירת צבעים מועדפים
        pref.lookSnapshot.colors.forEach(color => {
          const normalized = normalizeColor(color);
          stats.preferredColors[normalized] = (stats.preferredColors[normalized] || 0) + pref.weight;
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

export const cleanDuplicateLooks = async (req, res) => {
  try {
    const userId = req.userId;
    
    const allLooks = await Look.find({ user: userId }).sort({ createdAt: 1 });
    const seenCombinations = new Set();
    const duplicatesToDelete = [];

    allLooks.forEach(look => {
      const combinationKey = look.items.map(item => item._id.toString()).sort().join(',');
      
      if (seenCombinations.has(combinationKey)) {
        duplicatesToDelete.push(look._id);
      } else {
        seenCombinations.add(combinationKey);
      }
    });

    if (duplicatesToDelete.length > 0) {
      await Look.deleteMany({ _id: { $in: duplicatesToDelete } });
      console.log(`נמחקו ${duplicatesToDelete.length} לוקים כפולים`);
    }

    res.status(200).json({ 
      message: `ניקוי הושלם - נמחקו ${duplicatesToDelete.length} לוקים כפולים`,
      deletedCount: duplicatesToDelete.length 
    });
  } catch (err) {
    console.error("Error cleaning duplicates:", err);
    res.status(500).json({ error: "שגיאה בניקוי כפילות" });
  }
};