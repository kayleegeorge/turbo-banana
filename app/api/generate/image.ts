import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ImageGenerationRequest {
  prompt: string;
  imageData: string; // base64 encoded image
  mimeType?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  imageData?: string; // base64 encoded result
  textResponse?: string;
  error?: string;
  originalPrompt: string;
}

/**
 * Generate a single image based on prompt and input image
 */
export async function generateImage({
  prompt,
  imageData,
  mimeType = "image/png"
}: ImageGenerationRequest): Promise<ImageGenerationResult> {
  try {
    const requestContent = [
      { text: prompt },
      {
        inlineData: {
          mimeType,
          data: imageData,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: requestContent,
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      return {
        success: false,
        error: "No response parts received",
        originalPrompt: prompt,
      };
    }

    let generatedImageData: string | undefined;
    let textResponse: string | undefined;

    for (const part of parts) {
      if (part.text) {
        textResponse = part.text;
      } else if (part.inlineData) {
        generatedImageData = part.inlineData.data || "";
      }
    }

    return {
      success: true,
      imageData: generatedImageData,
      textResponse,
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

/**
 * Batch generate multiple images concurrently
 */
export async function generateImagesBatch(
  requests: ImageGenerationRequest[],
  maxConcurrency: number = 3
): Promise<ImageGenerationResult[]> {
  const results: ImageGenerationResult[] = [];
  
  // Process requests in batches to avoid overwhelming the API
  for (let i = 0; i < requests.length; i += maxConcurrency) {
    const batch = requests.slice(i, i + maxConcurrency);
    const batchPromises = batch.map(request => generateImage(request));
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Handle both fulfilled and rejected promises
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          success: false,
          error: `Batch processing error: ${result.reason}`,
          originalPrompt: "Unknown",
        });
      }
    }
  }
  
  return results;
}

 
