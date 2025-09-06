// sets it has
// prompt and the images

import { getProject } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { id } = await request.json();
    const project = await getProject(id);
    return NextResponse.json(project);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await getProject(id);
    return NextResponse.json(project);
}