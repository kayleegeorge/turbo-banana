import { NextRequest, NextResponse } from 'next/server';
import { generateImage, generateImagesBatch, ImageGenerationRequest } from './image';
import { generateDefinitions } from './definitions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle asset generation flow: styleImage + prompt -> definitions -> multiple images
    if (body.styleImage && body.prompt && body.count) {
      const definitionsResult = await generateDefinitions({
        prompt: body.prompt,
        count: body.count
      });

      if (!definitionsResult.success || !definitionsResult.definitions) {
        return NextResponse.json({
          success: false,
          error: `Failed to generate definitions: ${definitionsResult.error}`,
          stage: 'definitions'
        }, { status: 400 });
      }

      // Create image generation requests for each definition
      const imageRequests: ImageGenerationRequest[] = definitionsResult.definitions.map(definition => ({
        prompt: `Create an image of: ${definition}. Match the style and artistic approach of the reference image provided.`,
        imageData: body.styleImage,
        mimeType: body.mimeType || 'image/png'
      }));

      const maxConcurrency = body.maxConcurrency || 3;
      const imageResults = await generateImagesBatch(imageRequests, maxConcurrency);

      return NextResponse.json({
        success: true,
        definitions: definitionsResult.definitions,
        images: imageResults,
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
      { error: 'Invalid request format. Expected either: 1) Asset generation flow: { styleImage, prompt, count }, 2) Single image: { prompt, imageData }, or 3) Batch requests: { requests }' },
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
      assetGeneration: 'POST with { styleImage, prompt, count, mimeType?, maxConcurrency? } - Generate multiple styled assets',
      single: 'POST with { prompt, imageData, mimeType? } - Generate single image',
      batch: 'POST with { requests: [{ prompt, imageData, mimeType? }], maxConcurrency? } - Batch generate images'
    }
  });
}
  