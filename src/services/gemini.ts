
import { QuoteData } from "../types";

export const analyzeEntry = async (entryText: string, category: string): Promise<string> => {
  return "Az AI elemzés funkció a 4.5-ös verzióban kivezetésre került.";
};

export const getDailyQuote = async (language: string, forceRefresh: boolean = false): Promise<QuoteData> => {
    const today = new Date().toISOString().split('T')[0];
    
    // Public API Fallback (English)
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
        // Absolute fallback
        return {
            text: "The only way to do great work is to love what you do.",
            author: "Steve Jobs",
            date: today,
            language: 'en'
        };
    }
};
