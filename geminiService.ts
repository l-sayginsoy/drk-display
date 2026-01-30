
import { GoogleGenAI } from "@google/genai";

export const suggestActivity = async (day: string, location: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
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
    return response.text?.trim() || "Kaffee & Kuchen";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Gemeinsames Singen";
  }
};
