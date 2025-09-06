import { NextRequest, NextResponse } from 'next/server';
import { generateImage, generateImagesBatch, ImageGenerationRequest } from './image';
import { generateDefinitions } from './definitions';
import { saveGeneratedImages } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle asset generation flow: styleImages + prompt -> definitions -> multiple images
    if (body.styleImages && body.prompt && (body.count || body.preset)) {
      const definitionsResult = await generateDefinitions({
        prompt: body.prompt,
        count: body.count || 12, // Default count if not specified
      });
      console.log('definitionsResult', definitionsResult);

      if (!definitionsResult.success || !definitionsResult.definitions) {
        return NextResponse.json({
          success: false,
          error: `Failed to generate definitions: ${definitionsResult.error}`,
          stage: 'definitions'
        }, { status: 400 });
      }

      // Prepare images for generation
      const imagesToUse: Array<{ data: string; mimeType: string }> = body.styleImages.map((img: any) => ({
        data: img.data,
        mimeType: img.mimeType
      }));

      // Create image generation requests for each definition
      const imageRequests: ImageGenerationRequest[] = definitionsResult.definitions.map(definition => ({
        prompt: `Create an image of: ${definition}. Match the style and artistic approach of the reference images provided. Make the background black.`,
        images: imagesToUse
      }));

      const maxConcurrency = body.maxConcurrency || 3;
      const imageResults = await generateImagesBatch(imageRequests, maxConcurrency);

      // If setId is provided, save successful images to database and blob store
      let savedResults = null;
      if (body.setId && imageResults.some(r => r.success)) {
        const imagesToSave = imageResults
          .map((result, index) => ({
            id: `${body.setId}-${Date.now()}-${index}`,
            imageData: result.imageData || '',
            definition: definitionsResult.definitions![index]
          }))
          .filter(img => img.imageData); // Only save images that have data

        try {
          savedResults = await saveGeneratedImages(imagesToSave, body.setId);
        } catch (error) {
          console.error('Failed to save images:', error);
          // Continue without saving - return generation results anyway
        }
      }

      return NextResponse.json({
        success: true,
        definitions: definitionsResult.definitions,
        images: imageResults,
        savedImages: savedResults,
        totalGenerated: imageResults.length,
        successfulImages: imageResults.filter(r => r.success).length,
        failedImages: imageResults.filter(r => !r.success).length,
        originalPrompt: body.prompt
      });
    }
    
    // Handle single image generation
    if (body.prompt && body.imageData && !Array.isArray(body.requests)) {
      const result = await generateImage({
        prompt: body.prompt,
        imageData: body.imageData,
        mimeType: body.mimeType
      });
      
      return NextResponse.json(result);
    }
    
    // Handle batch image generation
    if (body.requests && Array.isArray(body.requests)) {
      const maxConcurrency = body.maxConcurrency || 3;
      const results = await generateImagesBatch(body.requests, maxConcurrency);
      
      return NextResponse.json({
        success: true,
        results,
        totalProcessed: results.length,
        successCount: results.filter(r => r.success).length,
        errorCount: results.filter(r => !r.success).length
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid request format. Expected either: 1) Asset generation flow: { styleImages, prompt, count }, 2) Single image: { prompt, imageData }, or 3) Batch requests: { requests }' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Image generation API is running',
    endpoints: {
      assetGeneration: 'POST with { styleImages: [{data: string, mimeType: string}], prompt, count, setId?, maxConcurrency? } - Generate multiple styled assets',
      single: 'POST with { prompt, imageData OR images: [{data: string, mimeType: string}], mimeType? } - Generate single image',
      batch: 'POST with { requests: [{ prompt, imageData OR images, mimeType? }], maxConcurrency? } - Batch generate images'
    }
  });
}
  