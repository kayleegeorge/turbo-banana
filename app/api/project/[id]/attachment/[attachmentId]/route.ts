import { deleteProjectAttachment } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
    attachmentId: string;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { attachmentId } = await params;

    // Delete the project attachment
    await deleteProjectAttachment(attachmentId);

    return NextResponse.json({
      success: true,
      message: 'Attachment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}