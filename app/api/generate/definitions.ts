
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const PRESETS: Record<string, PresetConfig> = {
  font: {
    name: 'font',
    count: 26,
    prompt: 'letters of the alphabet'
  },
  gameAssets: {
    name: 'gameAssets',
    count: 10,
    prompt: 'game assets'
  }
};

export interface DefinitionGenerationRequest {
  prompt: string;
  count?: number;
  preset?: string;
}

export interface PresetConfig {
  name: string;
  count: number;
  prompt: string;
}

export interface DefinitionGenerationResult {
  success: boolean;
  definitions?: string[];
  error?: string;
  originalPrompt: string;
}

export async function generateDefinitions({
  prompt,
  count,
}: DefinitionGenerationRequest): Promise<DefinitionGenerationResult> {
  try {
      let definitionPrompt = count 
        ? `Generate ${count} different, specific, and creative descriptions based on this request: "${prompt}"`
        : `Generate different, specific, and creative descriptions based on this request: "${prompt}". Decide on an appropriate number of variations that would work well for this request.`;

      definitionPrompt += `

Special handling for alphabet requests:
- If the request is about "alphabet", "letters", or similar, generate exactly 26 descriptions in the format: "the letter A", "the letter B", "the letter C", etc.
- Use capital letters A through Z in alphabetical order

For all other requests:
- Each description should be unique and specific, but not overly flowery language or too abstract
- Keep each description concise (1-2 sentences max)
- Focus on visual and distinctive characteristics that would work well for image generation

Requirements for output:
- Return only the descriptions, one per line without any other text
- Each description is separated by a newline
- Do not include numbers or bullet points

Example format for non-alphabet requests:
A tall corn plant with golden kernels and green leaves.
A round orange pumpkin with thick green vines.
A bushy tomato plant with bright red fruits hanging from green stems.`;

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
    let definitions = textResponse
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\.|^-|^\*/)); // Remove numbered/bulleted items
    
    // Only slice if count is provided
    if (count) {
      definitions = definitions.slice(0, count);
    } 

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
