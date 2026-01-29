import { GoogleGenAI, Type } from "@google/genai";
import { Insight, SearchResult } from "../types";

/**
 * Initialize GoogleGenAI with the API key from environment variables.
 * Following guidelines to use named parameters and avoid fallbacks.
 */
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (context: string): Promise<Insight[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following business data and provide 3 key actionable insights in JSON format: [${context}]. Each insight must have: id, title, description, and category (efficiency, growth, or risk).`,
      config: {
        responseMimeType: "application/json",
        // Using responseSchema for robust JSON structure as recommended
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { 
                type: Type.STRING,
                description: 'Category of the insight'
              },
              timestamp: { type: Type.STRING }
            },
            propertyOrdering: ["id", "title", "description", "category", "timestamp"],
          },
        },
      },
    });

    // Directly access the .text property (not a method)
    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Error fetching insights:", error);
    return [];
  }
};

export const searchIndustryTrends = async (query: string): Promise<{ text: string; sources: SearchResult[] }> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a detailed trend report for: ${query}. Use search grounding to ensure accuracy.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    /**
     * Extract website URLs from grounding chunks to meet the requirement 
     * of listing sources when using Google Search.
     */
    const sources: SearchResult[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || "Reference",
        uri: chunk.web?.uri || "#"
      }))
      .filter((s: SearchResult) => s.uri !== "#") || [];

    return {
      text: response.text || "No insights found.",
      sources,
    };
  } catch (error) {
    console.error("Error searching trends:", error);
    return { text: "Error fetching trends.", sources: [] };
  }
};