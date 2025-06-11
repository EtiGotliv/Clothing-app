import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeClothingImage(base64Image) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an assistant that analyzes clothing images. Return a JSON object with:
          {
            "name": "clothing type (Shirt/Pants/Dress/Skirt/Shoes/Accessories)",
            "color": "main colors separated by commas",
            "season": "Summer/Winter/Fall/Spring", 
            "event": "Weekday/Event/Work",
            "style": "casual/elegant"
          }
          
          Style Guidelines:
          - "elegant": formal wear, evening wear, business suits, dressy dresses, blazers, dress shirts, high heels, formal shoes, jewelry, ties, fancy blouses, cocktail dresses, formal skirts
          - "casual": t-shirts, jeans, sneakers, hoodies, casual tops, shorts, casual dresses, sandals, casual pants, polo shirts, casual skirts, everyday wear`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this clothing item and determine if it's casual or elegant:" },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ]
        }
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    throw new Error("שגיאה בניתוח תמונה עם AI");
  }
}

export async function suggestLookWithOpenAI(wardrobe, stylePreference = "casual") {
  if (!wardrobe || wardrobe.length === 0) {
    throw new Error("ארון הבגדים ריק");
  }

  const styleInHebrew = stylePreference === "casual" ? "יום יומי" : "אלגנטי";
  
  const systemMessage = `אתה סטייליסט אישי מקצועי. עליך לבחור לוק ${styleInHebrew} מתוך רשימת בגדים.

חוקים חשובים:
- רק אחת מהאופציות הבאות:
  * שמלה בלבד (Dress/Robe)
  * חולצה + חצאית (Top + Skirt)
  * חולצה + מכנסיים (Top + Pants/Jeans/Shorts)
- אסור לשלב חצאית ומכנסיים יחד
- רק פריט אחד מכל קטגוריה (חוץ מאקססוריז)
- בחר פריטים שמתאימים לסגנון ${styleInHebrew}
- החזר מערך JSON של מזהי פריטים בלבד: ["id1", "id2", "id3"]

דוגמאות:
- לוק יום יומי: חולצת טי + ג'ינס, או שמלה קזואל
- לוק אלגנטי: חולצה מכופתרת + חצאית, או שמלת ערב`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        {
          role: "user",
          content: `הארון שלי (${styleInHebrew}):
${JSON.stringify(wardrobe, null, 2)}`
        }
      ],
      temperature: 0.8, // הגדלת היצירתיות
      max_tokens: 300,
    });

    const content = response.choices[0].message.content.trim();
    const clean = content.replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(clean);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("AI לא החזיר מערך תקין");
      }
      return parsed;
    } catch (e) {
      // ניסוי לחלץ ID-ים מהטקסט
      const fallback = clean.match(/[a-f0-9]{24}/g);
      if (fallback && fallback.length > 0) {
        return fallback.slice(0, 4);
      }
      throw new Error("לא הצלחתי לפענח את תגובת ה-AI");
    }
  } catch (error) {
    console.error("AI suggestion error:", error);
    throw new Error("שגיאה בקבלת הצעה מה-AI");
  }
}