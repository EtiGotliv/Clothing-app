import Look from "../../config/models/look.js";
import Clothing from "../../config/models/allClothing.js";
import PersonalPreference from "../../config/models/personalPrefer.js";
import { suggestLookWithOpenAI } from "../services/openaiService.js";


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

    let clothes = await Clothing.find({
      user: userId,
      tags: { $elemMatch: { $regex: new RegExp(`^${stylePreference}$`, "i") } },
    });

    if (clothes.length < 3) {
      clothes = await Clothing.find({ user: userId });
    }

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
    const minFeedbacksToLearn = 5;

    let newLook = null;

    if (userPreferences.length >= minFeedbacksToLearn) {
      console.log("מנסה ליצור לוק מהעדפות...");
      newLook = await createLookFromPreferences(
        userId,
        clothes,
        stylePreference,
        Array.from(existingCombinations),
        userPreferences
      );

      if (newLook) {
        console.log("לוק נוצר מהעדפות בהצלחה!");
        return res.status(200).json({ look: newLook });
      }
    }

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

    console.log("מנסה ליצור לוק רנדומלי...");
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


const createSmartRandomLook = async (userId, clothes, style, existingKeys) => {
  const cat = {
    tops: [], bottoms: [], dresses: [], shoes: [], accessories: []
  };

  clothes.forEach(item => {
    const type = (item.category || item.name || "").toLowerCase();
    if (["shirt", "blouse", "t-shirt", "sweater", "hoodie", "top", "jacket", "pullover"].includes(type)) cat.tops.push(item);
    else if (["pants", "jeans", "skirt", "shorts"].includes(type)) cat.bottoms.push(item);
    else if (["dress", "robe"].includes(type)) cat.dresses.push(item);
    else if (["shoes", "boots", "sneakers", "heels", "sandals"].includes(type)) cat.shoes.push(item);
    else cat.accessories.push(item);
  });

  for (let i = 0; i < 30; i++) {
    let selected = [];
    if (cat.dresses.length && Math.random() < 0.7) {
      selected.push(cat.dresses[Math.floor(Math.random() * cat.dresses.length)]);
    } else if (cat.tops.length && cat.bottoms.length) {
      selected.push(
        cat.tops[Math.floor(Math.random() * cat.tops.length)],
        cat.bottoms[Math.floor(Math.random() * cat.bottoms.length)]
      );
    } else {
      continue;
    }

    if (cat.shoes.length && Math.random() > 0.5) {
      selected.push(cat.shoes[Math.floor(Math.random() * cat.shoes.length)]);
    }

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

  return null;
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


const createLookFromPreferences = async (userId, clothes, style, existingKeys, preferences) => {
  const liked = preferences.filter(p => p.feedback === "like");
  if (!liked.length) return null;

  const colorScore = {}, catScore = {};
  liked.forEach(p => {
    p.lookSnapshot.colors.forEach(c => colorScore[c] = (colorScore[c] || 0) + p.weight);
    p.lookSnapshot.categories.forEach(c => catScore[c] = (catScore[c] || 0) + p.weight);
  });

  const sortedColors = Object.entries(colorScore).sort(([,a],[,b]) => b - a).map(([c]) => c);

  for (let attempt = 0; attempt < 10; attempt++) {
    const selected = [];
    for (const color of sortedColors.slice(0, 3)) {
      const options = clothes.filter(i => i.color?.toLowerCase().includes(color.toLowerCase()));
      if (options.length) selected.push(options[Math.floor(Math.random() * options.length)]);
    }

    const rest = clothes.filter(i => !selected.find(s => s._id.equals(i._id)));
    while (selected.length < 3 && rest.length) {
      selected.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
    }

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
        source: "preferences"
      });
      await newLook.save();
      return newLook;
    }
  }

  return null;
};


// פונקציה חדשה: AI מוגבל
const createLookWithLimitedAI = async (userId, clothes, style, existingKeys, max = 3) => {
  const wardrobe = clothes.map(item => ({
    id: item._id.toString(),
    name: item.name,
    type: item.category || item.name,
    color: item.color,
    season: item.season || "כללי",
    event: item.tags?.includes("elegant") ? "elegant" : "casual"
  }));

  for (let i = 0; i < max; i++) {
    try {
      const selection = await suggestLookWithOpenAI(wardrobe.sort(() => 0.5 - Math.random()), style);
      if (!selection?.length) continue;

      const chosen = clothes.filter(i => selection.includes(i._id.toString()));
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