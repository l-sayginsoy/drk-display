import { GoogleGenAI } from "@google/genai";

export const suggestActivity = async (day: string, location: string) => {
  try {
    // Nutzt die Vite-Umgebungsvariable für den Key
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return "Gemeinsames Singen";

    const ai = new GoogleGenAI(apiKey);
    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: "Du bist ein erfahrener Ergotherapeut im DRK Seniorenheim."
    });
    
    const prompt = `Gib mir einen kreativen Vorschlag für eine Senioren-Aktivität im Altenheim. 
      Tag: ${day}
      Ort: ${location}
      Antworte nur mit dem Namen der Aktivität (maximal 3-4 Wörter).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim() || "Kaffee & Kuchen";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Gemeinsames Singen";
  }
};