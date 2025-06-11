import mongoose from 'mongoose';
import Clothing from '../../config/models/allClothing.js';
import { analyzeClothingImage } from '../services/openaiService.js';
import { VALID_TYPES, TYPE_MAP, MAX_COLORS, IGNORED_COLOR_TERMS } from '../../config/clothingConfig.js';

function mapToValidType(type) {
  if (!type) return null;
  if (VALID_TYPES.includes(type)) return type;
  if (TYPE_MAP[type]) return TYPE_MAP[type];

  const normalized = type.toLowerCase();
  for (const validType of VALID_TYPES) {
    if (normalized.includes(validType.toLowerCase())) {
      return validType;
    }
  }
  for (const [key, mapped] of Object.entries(TYPE_MAP)) {
    if (normalized.includes(key.toLowerCase())) {
      return mapped;
    }
  }
  return null;
}

function extractMainColors(colorString) {
  if (!colorString) return [];
  const colorList = colorString
    .split(',')
    .map(c => c.trim().toLowerCase())
    .filter(c => c.length > 0 && !IGNORED_COLOR_TERMS.some(term => c.includes(term)));
  return colorList.slice(0, MAX_COLORS);
}

export async function analyzeAndParseImage(req, res) {
  const fileBuffer = req.file?.buffer;
  if (!fileBuffer) return res.status(400).json({ error: "No image provided" });

  const base64Image = fileBuffer.toString("base64");

  try {
    const result = await analyzeClothingImage(base64Image);
    let cleanResult = result;

    if (result.includes('```')) {
      cleanResult = result.replace(/```(json|jsoon|javascript)?\n/, '');
      cleanResult = cleanResult.replace(/```\s*$/, '');
    }

    const parsed = JSON.parse(cleanResult);
    const mappedType = mapToValidType(parsed.name);
    const cleanedColors = extractMainColors(parsed.color);

    // יצירת תגיות אוטומטיות
    const tags = [];
    
    // הוספת תגית סגנון
    if (parsed.style) {
      const style = parsed.style.toLowerCase();
      if (style === 'casual' || style === 'elegant') {
        tags.push(style);
      }
    }
    
    // הוספת תגיות לפי סוג האירוע
    if (parsed.event) {
      const event = parsed.event.toLowerCase();
      if (event.includes('event') || event.includes('work')) {
        if (!tags.includes('elegant')) {
          tags.push('elegant');
        }
      } else if (event.includes('weekday') || event.includes('casual')) {
        if (!tags.includes('casual')) {
          tags.push('casual');
        }
      }
    }
    
    // אם לא נמצא סגנון, נסה לנחש לפי סוג הבגד
    if (tags.length === 0) {
      const casualTypes = ['t-shirt', 'jeans', 'shorts', 'hoodie', 'sneakers', 'sandals'];
      const elegantTypes = ['dress', 'suit', 'blazer', 'formal', 'shirt', 'skirt', 'heels'];
      
      const itemType = (parsed.name || '').toLowerCase();
      
      if (casualTypes.some(type => itemType.includes(type))) {
        tags.push('casual');
      } else if (elegantTypes.some(type => itemType.includes(type))) {
        tags.push('elegant');
      } else {
        // ברירת מחדל - casual
        tags.push('casual');
      }
    }

    return res.json({
      name: mappedType || "",
      color: cleanedColors.join(", "),
      season: parsed.season || "Summer",
      event: parsed.event || "Weekday",
      style: parsed.style || (tags.includes('elegant') ? 'elegant' : 'casual'),
      tags: tags,
      needsManualInput: !mappedType || cleanedColors.length === 0
    });

  } catch (error) {
    console.error("❌ AI error:", error);
    return res.status(500).json({ error: "AI analysis failed" });
  }
}

// פונקציה חדשה ליצירת בגד
export async function createClothing(req, res) {
  const { name, color, tags, image, category, season, event, style } = req.body;
  
  if (!name || !image) {
    return res.status(400).json({ message: "Missing required fields: name and image" });
  }

  try {
    // וידוא שיש תגיות מתאימות
    let finalTags = Array.isArray(tags) ? [...tags] : [];
    
    // אם לא נמצאו תגיות casual/elegant, הוסף לפי הסגנון או ברירת מחדל
    const hasCasualOrElegant = finalTags.some(tag => 
      tag.toLowerCase() === 'casual' || tag.toLowerCase() === 'elegant'
    );
    
    if (!hasCasualOrElegant) {
      if (style) {
        const styleTag = style.toLowerCase();
        if (styleTag === 'casual' || styleTag === 'elegant') {
          finalTags.push(styleTag);
        }
      } else {
        // ברירת מחדל - casual
        finalTags.push('casual');
      }
    }

    const newClothing = new Clothing({
      name,
      color: color || '',
      tags: finalTags,
      image,
      category: category || name,
      season: season || 'Summer',
      event: event || 'Weekday',
      user: req.userId,
    });

    const saved = await newClothing.save();
    res.status(201).json({ 
      message: "Clothing item saved successfully", 
      item: { 
        id: saved._id, 
        name: saved.name,
        color: saved.color,
        category: saved.category,
        tags: saved.tags
      } 
    });
  } catch (error) {
    console.error("Save clothing error:", error);
    res.status(500).json({ message: "Save failed", error: error.message });
  }
}

// פונקציה לקבלת כל הבגדים
export async function getAllClothing(req, res) {
  try {
    const clothes = await Clothing.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(clothes);
  } catch (error) {
    console.error("Fetch clothing error:", error);
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
}

// פונקציה לחיפוש בגדים
export async function searchClothing(req, res) {
  const { query } = req.query;
  
  if (!query || query.trim().length === 0) {
    return res.json([]);
  }

  try {
    const searchRegex = new RegExp(query.trim(), "i");
    
    const results = await Clothing.find({ 
      user: req.userId,
      $or: [
        { name: { $regex: searchRegex } },
        { color: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } }
      ]
    }).limit(10);

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed", error: error.message });
  }
}

// פונקציה לקבלת בגד בודד
export async function getClothingById(req, res) {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const item = await Clothing.findOne({ _id: id, user: req.userId });
    
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Get clothing by ID error:", error);
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
}

// פונקציה למחיקת בגד
export async function deleteClothing(req, res) {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const deleted = await Clothing.findOneAndDelete({ _id: id, user: req.userId });
    
    if (!deleted) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }

    res.json({ message: "Item deleted successfully", deletedItem: deleted.name });
  } catch (error) {
    console.error("Delete clothing error:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
}

// פונקציה לעדכון בגד
export async function updateClothing(req, res) {
  const { id } = req.params;
  const { name, color, image, tags, category, season, event, style } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID format" });
  }

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (image) updateData.image = image;
    if (category) updateData.category = category;
    if (season) updateData.season = season;
    if (event) updateData.event = event;
    
    if (tags !== undefined) {
      let finalTags = Array.isArray(tags) ? [...tags] : [];
      
      // וידוא שיש תגית casual או elegant
      const hasCasualOrElegant = finalTags.some(tag => 
        tag.toLowerCase() === 'casual' || tag.toLowerCase() === 'elegant'
      );
      
      if (!hasCasualOrElegant) {
        if (style) {
          const styleTag = style.toLowerCase();
          if (styleTag === 'casual' || styleTag === 'elegant') {
            finalTags.push(styleTag);
          }
        } else {
          finalTags.push('casual');
        }
      }
      
      updateData.tags = finalTags;
    }

    const updatedItem = await Clothing.findOneAndUpdate(
      { _id: id, user: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Item not found or unauthorized" });
    }

    res.json({ 
      success: true, 
      message: "Item updated successfully", 
      item: updatedItem 
    });
  } catch (error) {
    console.error("Update clothing error:", error);
    res.status(500).json({ success: false, message: "Update failed", error: error.message });
  }
}