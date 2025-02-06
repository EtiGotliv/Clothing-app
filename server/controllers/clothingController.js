import Clothing from "../../config/models/allClothing.js";

export const getAllClothing = async (req, res) => {
  try {
    const clothes = await Clothing.find();
    res.json(clothes);
  } catch (error) {
    res.status(500).json({ message: "שגיאה בקבלת הבגדים" });
  }
};

export const getClothingById = async (req, res) => {
  const { id } = req.params;
  try {
    const clothing = await Clothing.findById(id);
    if (!clothing) {
      return res.status(404).json({ message: "הבגד לא נמצא" });
    }
    res.json(clothing);
  } catch (error) {
    res.status(500).json({ message: "שגיאה בקבלת הבגד" });
  }
};

export const addClothing = async (req, res) => {
  try {
    const { name, color, image, tags } = req.body;
    if (!name || !image) {
      return res.status(400).json({ message: "חובה לספק שם ותמונה" });
    }
    const newClothing = new Clothing({ name, color, image, tags });
    await newClothing.save();
    res.status(201).json(newClothing);
  } catch (error) {
    res.status(500).json({ message: "שגיאה בשמירת הבגד", error: error.message });
  }
};

