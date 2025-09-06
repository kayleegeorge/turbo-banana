import { getImagesInSet, listImages } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface SetWithImages {
  id: string;
  projectId: string;
  name: string;
  prompts: string | null;
  images: Array<{
    id: string;
    url: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; setId: string } }
) {
  try {
    const { id: projectId, setId } = params;

    if (!projectId || !setId) {
      return NextResponse.json(
        { success: false, error: 'Project ID and Set ID are required' },
        { status: 400 }
      );
    }

    // Get images for this set from database
    const setImages = await getImagesInSet(setId);
    
    // Get the actual image URLs from blob storage
    const imageUrlPromises = setImages.map(async (img) => {
      try {
        // The image ID is used as the blob key
        const imageUrls = await listImages(img.id);
        return {
          id: img.id,
          url: imageUrls[0] || '', // Take the first URL if available
        };
      } catch (error) {
        console.warn(`Failed to get URL for image ${img.id}:`, error);
        return {
          id: img.id,
          url: '',
        };
      }
    });

    const imagesWithUrls = await Promise.all(imageUrlPromises);

    const setWithImages: SetWithImages = {
      id: setId,
      projectId: projectId,
      name: `Set ${setId}`, // TODO: Get actual set name from database
      prompts: null, // TODO: Get actual prompts from database
      images: imagesWithUrls.filter(img => img.url), // Only include images with valid URLs
    };

    return NextResponse.json({ 
      success: true, 
      set: setWithImages 
    });
  } catch (error) {
    console.error('Error retrieving set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve set' },
      { status: 500 }
    );
  }
}