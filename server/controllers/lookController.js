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

    let newLook = null;
    const maxAttempts = 5;
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt++;

      const selectedIds = await suggestLookWithOpenAI(wardrobe, stylePreference);

      const selectedItems = clothes.filter(item =>
        selectedIds.includes(item._id.toString())
      );

      if (selectedItems.length === 0) continue;

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
      if (!isValid) continue;

      const exists = await Look.findOne({
        user: userId,
        "items._id": { $all: selectedItems.map(item => item._id) },
        style: stylePreference
      });

      if (!exists) {
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
        break;
      }
    }

    if (!newLook) {
      return res.status(200).json({ look: null });
    }

    res.status(200).json({ look: newLook });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "שגיאה ביצירת לוק מה-AI" });
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
