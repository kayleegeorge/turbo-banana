import { updateSet, getProject } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
    setId: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { prompt } = await request.json();
    const { id: projectId, setId } = await params;

    // Get current project data to find the set
    const currentProject = await getProject(projectId);
    const currentSet = currentProject.sets.find((s: any) => s.id === setId);
    
    if (!currentSet) {
      return NextResponse.json(
        { success: false, error: 'Set not found' },
        { status: 404 }
      );
    }

    // Update the set prompt
    await updateSet({
      id: setId,
      projectId: projectId,
      name: currentSet.name,
      prompts: prompt || null
    });

    return NextResponse.json({
      success: true,
      message: 'Set prompt updated successfully'
    });

  } catch (error) {
    console.error('Error updating set prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update set prompt' },
      { status: 500 }
    );
  }
}