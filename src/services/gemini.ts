
import { GoogleGenAI } from "@google/genai";
import { QuoteData } from "../types";

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

export const getDailyQuote = async (language: string, forceRefresh: boolean = false): Promise<QuoteData> => {
    const today = new Date().toISOString().split('T')[0];
    const client = getClient();
    
    // Strategy 2: Fallback to Public API (English)
    // Used if no API key is present or if Gemini fails
    const fetchPublicQuote = async (): Promise<QuoteData> => {
        try {
            const res = await fetch('https://dummyjson.com/quotes/random');
            if (!res.ok) throw new Error("Public API Fetch Failed");
            
            const data = await res.json();
            // dummyjson format: { id: 1, quote: "...", author: "..." }
            return {
                text: data.quote,
                author: data.author,
                date: today,
                language: 'en' 
            };
        } catch (e) {
            console.error("Public quote fetch failed", e);
            // Absolute fallback if no internet and no key
            // We return a generic message as a quote to avoid breaking the UI, but it's not a "sample" quote.
            return {
                text: "Internet connection required for quotes.",
                author: "System",
                date: today,
                language: 'en'
            };
        }
    };

    // Strategy 1: Use Gemini if API Key is present
    if (client) {
        try {
            // Dynamic language name resolution
            let langName = language;
            try {
                // Try to get English name of the language (e.g. 'hu' -> 'Hungarian')
                // This helps the model understand the target language better than just the code
                const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
                langName = displayNames.of(language) || language;
            } catch (e) {
                // Fallback to code if Intl is not available
            }

            // We ask for JSON directly to ensure structured data
            // Explicitly requesting a REAL quote
            const prompt = `Provide a real, famous inspirational quote in ${langName} language from a known author, philosopher, or historical figure. 
            Do not generate a fake quote. Ensure the author is real.
            The quote should be profound, motivating, and suitable for a personal growth diary.
            Return ONLY valid JSON in this format: {"text": "quote text", "author": "author name"}`;

            const response = await client.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json'
                }
            });

            if (response.text) {
                const parsed = JSON.parse(response.text);
                return {
                    text: parsed.text,
                    author: parsed.author || "Unknown",
                    date: today,
                    language
                };
            }
        } catch (error) {
            console.warn("Gemini Quote Fetch Error, falling back to public API:", error);
            // If Gemini fails (e.g. quota, network), fallback to public API (English)
            return await fetchPublicQuote();
        }
    }

    // If no client (No API Key), use Public API (English)
    return await fetchPublicQuote();
};
