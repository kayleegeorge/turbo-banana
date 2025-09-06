import { updateProject, insertProjectAttachment, getProjectAttachments, uploadImage, getProject, deleteProjectAttachments } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const { id: projectId } = await params;

    // Get current project data to preserve existing values
    const currentProject = await getProject(projectId);

    // Update the project prompt text
    await updateProject({
      id: projectId,
      name: currentProject.name,
      prompt: prompt || null,
      coverImageId: currentProject.coverImageId
    });

    // Handle new image uploads only (don't delete existing attachments)
    const imageIds: string[] = [];
    const entries = Array.from(formData.entries());
    
    for (const [key, value] of entries) {
      if (key.startsWith('image_') && value instanceof File) {
        // Convert file to buffer
        const buffer = await value.arrayBuffer();
        
        // Generate a unique UUID for the attachment record
        const attachmentId = crypto.randomUUID();
        // Generate a unique blob key for storage
        const blobKey = `${projectId}/prompt/${attachmentId}`;
        
        // Upload to blob storage with the blob key
        const imageUrl = await uploadImage(blobKey, buffer);
        console.log(`Uploaded image with blobKey: ${blobKey}, got URL: ${imageUrl}`);
        
        // Store the attachment reference with proper UUID
        await insertProjectAttachment({
          id: attachmentId,
          projectId: projectId
        });
        
        imageIds.push(attachmentId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Project prompt updated successfully',
      imageIds
    });

  } catch (error) {
    console.error('Error updating project prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project prompt' },
      { status: 500 }
    );
  }
}