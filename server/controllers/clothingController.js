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
