import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ImageGenerationRequest {
  prompt: string;
  imageData?: string; // base64 encoded image (for single image)
  images?: Array<{ data: string; mimeType: string }>; // for multiple images
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
 * Generate a single image based on prompt and input image(s)
 */
export async function generateImage({
  prompt,
  imageData,
  images,
  mimeType = "image/png"
}: ImageGenerationRequest): Promise<ImageGenerationResult> {
  try {
    const requestContent: any[] = [{ text: prompt }];

    // Handle multiple images (preferred method)
    if (images && images.length > 0) {
      for (const image of images) {
        requestContent.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          },
        });
      }
    } 
    // Fallback to single image for backwards compatibility
    else if (imageData) {
      requestContent.push({
        inlineData: {
          mimeType,
          data: imageData,
        },
      });
    }

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
 * Batch generate multiple images concurrently with retry logic
 */
export async function generateImagesBatch(
  requests: ImageGenerationRequest[],
  maxConcurrency: number = 100,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<ImageGenerationResult[]> {
  const results: ImageGenerationResult[] = new Array(requests.length);
  let remainingRequests = requests.map((request, index) => ({ request, originalIndex: index }));
  let retryCount = 0;
  
  while (remainingRequests.length > 0 && retryCount <= maxRetries) {
    const currentBatchResults: { result: ImageGenerationResult; originalIndex: number }[] = [];
    const failedRequests: { request: ImageGenerationRequest; originalIndex: number }[] = [];
    
    // Process requests in batches to avoid overwhelming the API
    for (let i = 0; i < remainingRequests.length; i += maxConcurrency) {
      const batch = remainingRequests.slice(i, i + maxConcurrency);
      const batchPromises = batch.map(({ request }) => generateImage(request));
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Handle both fulfilled and rejected promises
      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const originalIndex = batch[j].originalIndex;
        
        if (result.status === 'fulfilled') {
          const imageResult = result.value;
          if (imageResult.success) {
            // Success - store the result
            currentBatchResults.push({ result: imageResult, originalIndex });
          } else {
            // Failed result from generateImage - add to retry queue
            failedRequests.push({ request: batch[j].request, originalIndex });
          }
        } else {
          // Promise rejection - add to retry queue
          failedRequests.push({ request: batch[j].request, originalIndex });
        }
      }
    }
    
    // Store successful results in their original positions
    for (const { result, originalIndex } of currentBatchResults) {
      results[originalIndex] = result;
    }
    
    // If this is the last retry attempt, mark remaining failed requests as failed
    if (retryCount === maxRetries) {
      for (const { request, originalIndex } of failedRequests) {
        results[originalIndex] = {
          success: false,
          error: `Failed after ${maxRetries} retry attempts`,
          originalPrompt: request.prompt,
        };
      }
      break;
    }
    
    // Prepare for next retry iteration
    remainingRequests = failedRequests;
    retryCount++;
    
    // Add exponential backoff delay before retrying (except on first attempt)
    if (remainingRequests.length > 0 && retryCount > 0) {
      const delay = retryDelay * Math.pow(2, retryCount - 1);
      console.log(`Retrying ${remainingRequests.length} failed requests (attempt ${retryCount}/${maxRetries}) after ${delay}ms delay...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

 
