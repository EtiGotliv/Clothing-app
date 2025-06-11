import Look from "../../config/models/look.js";
import Clothing from "../../config/models/allClothing.js";
import { suggestLookWithOpenAI } from "../services/openaiService.js";

export const getAllLooks = async (req, res) => {
  try {
    const looks = await Look.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ looks });
  } catch (err) {
    console.error("שגיאה בקבלת לוקים:", err);
    res.status(500).json({ error: "שגיאה בטעינת לוקים" });
  }
};

export const createSmartLookFromAI = async (req, res) => {
  try {
    const userId = req.userId;
    const { stylePreference } = req.body;

    if (!stylePreference) {
      return res.status(400).json({ error: "חסרה בחירת סגנון" });
    }

    const clothes = await Clothing.find({
      user: userId,
      tags: { $elemMatch: { $regex: new RegExp(`^${stylePreference}$`, 'i') } }
    });

    if (clothes.length === 0) {
      return res.status(400).json({ error: "אין בגדים מתאימים בארון שלך." });
    }

    const wardrobe = clothes.map(item => ({
      id: item._id.toString(),
      name: item.name,
      type: item.category || item.name,
      color: item.color,
      season: item.season || "כללי",
      event: item.tags?.includes("elegant") ? "elegant" : "casual"
    }));

    // קבלת לוקים קיימים להימנעות מכפילויות
    const existingLooks = await Look.find({ user: userId, style: stylePreference });
    const existingCombinations = existingLooks.map(look => 
      look.items.map(item => item._id.toString()).sort().join(',')
    );

    let newLook = null;
    const maxAttempts = 15; // הגדלת מספר הניסיונות
    let attempt = 0;
    const usedCombinations = new Set();

    while (attempt < maxAttempts) {
      attempt++;

      try {
        // הוספת רנדומליות להצעות
        const randomizedWardrobe = [...wardrobe].sort(() => Math.random() - 0.5);
        const selectedIds = await suggestLookWithOpenAI(randomizedWardrobe, stylePreference);

        if (!selectedIds || selectedIds.length === 0) {
          console.log("AI לא החזיר פריטים");
          continue;
        }

        const selectedItems = clothes.filter(item =>
          selectedIds.includes(item._id.toString())
        );

        if (selectedItems.length === 0) {
          console.log("לא נמצאו פריטים מתאימים");
          continue;
        }

        // בדיקת תקינות הלוק
        const normalize = (c) => {
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
          return map[c.toLowerCase()] || "other";
        };

        const normCats = selectedItems.map(item =>
          normalize(item.category || item.name || "")
        );

        const hasTop = normCats.includes("top");
        const hasBottom = normCats.includes("bottom");
        const hasDress = normCats.includes("dress");

        const isValid = hasDress || (hasTop && hasBottom);
        if (!isValid) {
          console.log("לוק לא תקין - חסרים פריטים בסיסיים");
          continue;
        }

        const combinationKey = selectedItems.map(item => item._id.toString()).sort().join(',');
        
        if (existingCombinations.includes(combinationKey) || usedCombinations.has(combinationKey)) {
          usedCombinations.add(combinationKey);
          continue;
        }

        usedCombinations.add(combinationKey);

        newLook = new Look({
          user: userId,
          items: selectedItems.map(item => ({
            _id: item._id,
            name: item.name,
            image: item.image,
            category: item.category || item.name,
            color: item.color
          })),
          style: stylePreference,
          season: selectedItems[0].season || "Summer"
        });

        await newLook.save();
        console.log("לוק חדש נוצר בהצלחה!");
        break;

      } catch (aiError) {
        console.error(`שגיאה בניסיון ${attempt}:`, aiError);
        continue;
      }
    }

    if (!newLook) {
      // אם לא הצלחנו ליצור לוק חדש, ננסה לוק רנדומלי
      console.log("מנסה ליצור לוק רנדומלי...");
      const randomLook = await createRandomLook(userId, clothes, stylePreference, existingCombinations);
      if (randomLook) {
        return res.status(200).json({ look: randomLook });
      }
      
      return res.status(200).json({ 
        look: null, 
        message: "נוצרו כל הלוקים האפשריים עבור הסגנון הזה. נסה סגנון אחר או הוסף עוד בגדים!" 
      });
    }

    res.status(200).json({ look: newLook });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "שגיאה ביצירת לוק מה-AI" });
  }
};

// פונקציה עזר ליצירת לוק רנדומלי
const createRandomLook = async (userId, clothes, stylePreference, existingCombinations) => {
  const tops = clothes.filter(item =>
    ['Shirt', 'Blouse', 'T-shirt', 'Sweater', 'Hoodie', 'Top', 'Jacket', 'Pullover'].includes(item.category || item.name)
  );
  const bottoms = clothes.filter(item =>
    ['Pants', 'Jeans', 'Skirt', 'Shorts'].includes(item.category || item.name)
  );
  const dresses = clothes.filter(item =>
    ['Dress', 'Robe'].includes(item.category || item.name)
  );

  const maxRandomAttempts = 20;
  let randomAttempt = 0;

  while (randomAttempt < maxRandomAttempts) {
    randomAttempt++;
    let selectedItems = [];

    // בחירה בין שמלה או חולצה+מכנסיים/חצאית
    if (dresses.length > 0 && Math.random() > 0.5) {
      const randomDress = dresses[Math.floor(Math.random() * dresses.length)];
      selectedItems.push(randomDress);
    } else if (tops.length > 0 && bottoms.length > 0) {
      const randomTop = tops[Math.floor(Math.random() * tops.length)];
      const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
      selectedItems.push(randomTop, randomBottom);
    }

    if (selectedItems.length === 0) continue;

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
        season: selectedItems[0].season || "Summer"
      });

      await newLook.save();
      return newLook;
    }
  }

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

export const createManualLook = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemIds, style, season } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: "חסרים מזהי פריטים" });
    }

    const selectedItems = await Clothing.find({
      _id: { $in: itemIds },
      user: userId
    });

    if (selectedItems.length === 0) {
      return res.status(400).json({ error: "לא נמצאו פריטים מתאימים" });
    }

    const look = new Look({
      user: userId,
      items: selectedItems.map(item => ({
        _id: item._id,
        name: item.name,
        image: item.image,
        category: item.category || item.name,
        color: item.color
      })),
      style: style || "Manual",
      season: season || "Current"
    });

    await look.save();

    res.status(201).json({ look });
  } catch (err) {
    console.error("Create manual look error:", err);
    res.status(500).json({ error: "שגיאה ביצירת לוק ידני" });
  }
};