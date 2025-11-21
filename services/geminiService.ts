import { GoogleGenAI, Type } from "@google/genai";
import { GlossaryResponse } from "../types";

export const generateGlossary = async (
  text: string,
  apiKey: string
): Promise<GlossaryResponse> => {
  
  if (!apiKey) {
    throw new Error("API Key is required");
  }

  // Initialize client dynamically with the user's key
  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Truncate text if it's too long to avoid token limits (simple safeguard)
  const MAX_CHARS = 50000; 
  const processText = text.length > MAX_CHARS ? text.substring(0, MAX_CHARS) + "...[truncated]" : text;

  const prompt = `
    You are an expert academic research assistant. 
    Analyze the following academic text. 
    Identify the most important technical terms, jargon, or complex concepts that a student might find difficult.
    For each term, provide a clear definition and the specific context (sentence or phrase) where it appears in the text.
    Return the result as a JSON object containing a list of glossary items.
    
    Text to analyze:
    ${processText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            glossary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  context: { type: Type.STRING }
                },
                required: ['term', 'definition', 'context']
              }
            }
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
        throw new Error("Empty response from Gemini");
    }

    return JSON.parse(responseText) as GlossaryResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};