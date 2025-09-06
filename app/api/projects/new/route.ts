import { insertProject } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import type { Project } from "@/app/lib/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, prompt, coverImageId }: Project = body;

        if (!id || !name) {
            return NextResponse.json(
                { success: false, error: 'Project id and name are required' },
                { status: 400 }
            );
        }

        const project: Project = {
            id,
            name,
            prompt: prompt || null,
            coverImageId: coverImageId || null
        };

        await insertProject(project);
        
        return NextResponse.json({ 
            success: true, 
            message: 'Project created successfully',
            project 
        });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create project' },
            { status: 500 }
        );
    }
}