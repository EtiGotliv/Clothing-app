import Clothing from "../../config/models/allClothing.js";
import { suggestOutfitFromWardrobe } from "../services/openaiService.js";

export const suggestOutfitFromClothingDB = async (req, res) => {
  try {
    const clothes = await Clothing.find({ user: req.userId }); 

    const wardrobe = clothes.map(item => {
      const seasonTag = item.tags?.find(tag =>
        ["Summer", "Winter", "Fall", "Spring"].includes(tag)
      );
      const eventTag = item.tags?.find(tag =>
        ["Weekday", "Event", "Work"].includes(tag)
      );

      return {
        name: item.name,
        category: item.category || "בגד",
        color: item.color,
        season: seasonTag || "כללי",
        event: eventTag || "כללי"
      };
    });

    const result = await suggestOutfitFromWardrobe(wardrobe);
    res.json({ suggestions: result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "שגיאה בקבלת הצעת שילוב מה-AI" });
  }
};
