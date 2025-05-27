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
            "event": "Weekday/Event/Work"
          }`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this clothing item:" },
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

export async function suggestLookWithOpenAI(wardrobe, stylePreference = "Weekday") {
  if (!wardrobe || wardrobe.length === 0) {
    throw new Error("ארון הבגדים ריק");
  }

  const systemMessage = `אתה סטייליסט אישי. עליך לבחור לוק שמתאים לסגנון "${stylePreference}" מתוך רשימת בגדים.

חוקים:
- רק אחת מהאופציות הבאות:
  * שמלה (Dress)
  * חולצה + חצאית
  * חולצה + מכנסיים
- אין גם חצאית וגם מכנסיים
- רק פריט אחד מכל סוג (חוץ מאקססוריז)
- החזר מערך JSON של מזהי פריטים בלבד (ללא הסברים): ["id1", "id2", "id3"]`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemMessage },
      {
        role: "user",
        content: `הארון שלי:
${JSON.stringify(wardrobe, null, 2)}`
      }
    ],
    temperature: 0.7,
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
    const fallback = clean.match(/[a-f0-9]{24}/g);
    if (fallback && fallback.length > 0) {
      return fallback.slice(0, 4);
    }
    throw new Error("לא הצלחתי לפענח את תגובת ה-AI");
  }
}
