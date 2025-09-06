import { updateSet, getProject } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
    setId: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { name } = await request.json();
    const { id: projectId, setId } = await params;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Set name is required' },
        { status: 400 }
      );
    }

    // Get current project data to find the set
    const currentProject = await getProject(projectId);
    const currentSet = currentProject.sets.find(s => s.id === setId);
    
    if (!currentSet) {
      return NextResponse.json(
        { success: false, error: 'Set not found' },
        { status: 404 }
      );
    }

    // Update only the set name
    await updateSet({
      id: setId,
      projectId: projectId,
      name: name.trim(),
      prompts: currentSet.prompts
    });

    return NextResponse.json({
      success: true,
      message: 'Set name updated successfully'
    });

  } catch (error) {
    console.error('Error updating set name:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update set name' },
      { status: 500 }
    );
  }
}