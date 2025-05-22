import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeClothingImage(base64Image) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // latest vision-capable model
    messages: [
      {
        role: "system",
        content: `You are an assistant that analyzes clothing images. 
Return a JSON object with the following fields:
- name (e.g., shirt, skirt, pants, dress)
- color (e.g., white, black, blue, red)
- season (spring, summer, fall, winter)
- event (casual, evening, sport, elegant)

For the color field:
- If the item has multiple colors, list all the main colors separated by commas (e.g., "white, blue, red")
- For patterns like stripes or polka dots, list the base color and pattern colors (e.g., "black, white stripes" or "blue, red dots")

Do your best to guess based on the image. Always return a JSON with all fields (even if uncertain).
IMPORTANT: Return ONLY the raw JSON with no explanation and no markdown code blocks (no backticks or \`\`\`json).`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this clothing item:" },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  });

  return response.choices[0].message.content;
}