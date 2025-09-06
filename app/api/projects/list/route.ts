import { listProjects } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const projects = await listProjects();
        return NextResponse.json({ success: true, projects });
    } catch (error) {
        console.error('Error listing projects:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to list projects' },
            { status: 500 }
        );
    }
}
