import { insertSet } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { name } = await request.json();
    const { id: projectId } = await params;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Set name is required' },
        { status: 400 }
      );
    }

    const setId = crypto.randomUUID();

    // Create the set
    await insertSet({
      id: setId,
      projectId: projectId,
      name: name.trim(),
      prompts: null
    });

    return NextResponse.json({
      success: true,
      message: 'Set created successfully',
      set: {
        id: setId,
        projectId: projectId,
        name: name.trim(),
        prompts: null
      }
    });

  } catch (error) {
    console.error('Error creating set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create set' },
      { status: 500 }
    );
  }
}