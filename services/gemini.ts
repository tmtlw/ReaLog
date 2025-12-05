import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
}

export const analyzeEntry = async (entryText: string, category: string): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "API kulcs nincs beállítva (process.env.API_KEY).";
  }

  try {
    const prompt = `
      Te egy kíméletlenül őszinte, de támogató "Grind Coach" vagy. 
      Elemezd a következő naplóbejegyzést (${category} kategória).
      Adj rövid, tömör visszajelzést (max 3 mondat).
      Emeld ki, mi volt jó, és mire kell figyelni a fejlődés érdekében.
      
      Naplóbejegyzés:
      "${entryText}"
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Nem sikerült az elemzés.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Hiba történt az AI elemzés során.";
  }
};
