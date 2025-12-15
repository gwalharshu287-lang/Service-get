import { GoogleGenAI, Type } from "@google/genai";
import { ServiceCategory } from "../types";

// Initialize Gemini
// NOTE: process.env.API_KEY is assumed to be available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

export interface SmartMatchResult {
  category: ServiceCategory;
  reasoning: string;
  suggestedAction: string;
}

/**
 * Analyzes a user's search query to determine the best matching service category.
 */
export const findCategoryFromQuery = async (query: string): Promise<SmartMatchResult | null> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing. Skipping AI search.");
    return null;
  }

  const categoryValues = Object.values(ServiceCategory).join(", ");

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `User search query: "${query}". 
      Available Categories: ${categoryValues}. 
      Task: Match the query to the single most relevant Category. 
      If no category fits well, choose 'Other'. 
      Provide a short, helpful reasoning for the user.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: Object.values(ServiceCategory) },
            reasoning: { type: Type.STRING },
            suggestedAction: { type: Type.STRING }
          },
          required: ["category", "reasoning", "suggestedAction"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SmartMatchResult;
    }
    return null;

  } catch (error) {
    console.error("Gemini AI matching failed:", error);
    return null;
  }
};

/**
 * Generates a professional bio based on inputted skills (used during Pro onboarding).
 */
export const generateProBio = async (profession: string, skills: string[]): Promise<string> => {
    if (!process.env.API_KEY) return "Experienced professional ready to help.";

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: `Write a short, professional, and catchy bio (max 25 words) for a ${profession} who is skilled in: ${skills.join(', ')}.`
        });
        return response.text || "Experienced professional ready to help.";
    } catch (e) {
        return "Experienced professional ready to help.";
    }
}
