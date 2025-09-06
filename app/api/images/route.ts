// Save images to a set

import { saveImageToSet, saveImagesToSet } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { setId, images } = await request.json();

        if (!setId) {
            return NextResponse.json(
                { success: false, error: 'setId is required' },
                { status: 400 }
            );
        }

        if (!images) {
            return NextResponse.json(
                { success: false, error: 'images is required' },
                { status: 400 }
            );
        }

        // Handle single image or array of images
        if (Array.isArray(images)) {
            await saveImagesToSet(images, setId);
        } else {
            await saveImageToSet(images, setId);
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Images saved to set successfully',
            setId,
            imageCount: Array.isArray(images) ? images.length : 1
        });
    } catch (error) {
        console.error('Error saving images to set:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save images to set' },
            { status: 500 }
        );
    }
}