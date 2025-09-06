
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface DefinitionGenerationRequest {
  prompt: string;
  count: number;
}

export interface DefinitionGenerationResult {
  success: boolean;
  definitions?: string[];
  error?: string;
  originalPrompt: string;
}

export async function generateDefinitions({
  prompt,
  count
}: DefinitionGenerationRequest): Promise<DefinitionGenerationResult> {
  try {
    const definitionPrompt = `Generate ${count} different, specific, and creative descriptions based on this request: "${prompt}"

Requirements:
- Each description should be unique and specific
- Keep each description concise (1-2 sentences max)
- Focus on visual and distinctive characteristics that would work well for image generation
- Return only the descriptions, one per line without any other text
- Each description is separated by a newline
- Do not include numbers or bullet points

Example format:
A tall corn plant with golden kernels and green leaves swaying in the breeze
A round orange pumpkin with thick green vines and tendrils
A bushy tomato plant with bright red fruits hanging from green stems`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: definitionPrompt }],
    });

    const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      return {
        success: false,
        error: "No text response received from Gemini",
        originalPrompt: prompt,
      };
    }

    // Parse the response into individual definitions
    const definitions = textResponse
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\.|^-|^\*/)) // Remove numbered/bulleted items
      .slice(0, count); 

    if (definitions.length === 0) {
      return {
        success: false,
        error: "No valid definitions could be parsed from response",
        originalPrompt: prompt,
      };
    }

    return {
      success: true,
      definitions,
      originalPrompt: prompt,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      originalPrompt: prompt,
    };
  }
}
