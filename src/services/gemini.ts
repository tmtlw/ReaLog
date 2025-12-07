import { GoogleGenAI } from "@google/genai";

export const analyzeEntry = async (entryText: string, category: string): Promise<string> => {
  // Use process.env.API_KEY directly as required.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
      console.error("API Key not found");
      return "API kulcs nincs beállítva.";
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      Te egy kíméletlenül őszinte, de támogató "Grind Coach" vagy. 
      Elemezd a következő naplóbejegyzést (${category} kategória).
      Adj rövid, tömör visszajelzést (max 3 mondat).
      Emeld ki, mi volt jó, és mire kell figyelni a fejlődés érdekében.
      
      Naplóbejegyzés:
      "${entryText}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Nem sikerült az elemzés.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Hiba történt az AI elemzés során.";
  }
};