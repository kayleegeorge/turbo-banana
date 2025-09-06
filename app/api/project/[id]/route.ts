// sets it has
// prompt and the images

import { getProject } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { id } = await request.json();
    const project = await getProject(id);
    return NextResponse.json(project);
}