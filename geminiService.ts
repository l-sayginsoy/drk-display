import { GoogleGenAI } from "@google/genai";

export const suggestActivity = async (day: string, location: string) => {
  try {
    // API-Key wird aus der Vercel Umgebungsvariable bezogen
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Gemini API Key nicht gefunden in Umgebungsvariablen");
      return "Kaffee & Kuchen";
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gib mir einen kreativen Vorschlag für eine Senioren-Aktivität im Altenheim. 
      Tag: ${day}
      Ort: ${location}
      Antworte nur mit dem Namen der Aktivität (maximal 3-4 Wörter).`,
      config: {
        systemInstruction: "Du bist ein erfahrener Ergotherapeut im DRK Seniorenheim.",
        temperature: 0.8,
      }
    });

    // WICHTIG: .text ist eine Eigenschaft, kein Methodenaufruf!
    const text = response.text;
    return text?.trim() || "Kaffee & Kuchen";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Gemeinsames Singen";
  }
};
