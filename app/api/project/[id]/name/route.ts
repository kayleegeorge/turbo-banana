import { updateProject, getProject } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { name } = await request.json();
    const { id: projectId } = await params;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Get current project data to preserve existing values
    const currentProject = await getProject(projectId);

    // Update only the project name
    await updateProject({
      id: projectId,
      name: name.trim(),
      prompt: currentProject.prompt,
      coverImageId: currentProject.coverImageId
    });

    return NextResponse.json({
      success: true,
      message: 'Project name updated successfully'
    });

  } catch (error) {
    console.error('Error updating project name:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project name' },
      { status: 500 }
    );
  }
}