// Save images to a set

import { saveImageToSet } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { setId, images } = await request.json();
    await saveImageToSet(images);
    return NextResponse.json({ success: true });
}