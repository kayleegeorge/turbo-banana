import { listProjects, listImages } from "@/app/lib/db";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(`${process.env.DATABASE_URL}`);

export async function GET() {
    try {
        const projects = await listProjects();
        
        // For each project, get the first image from any set
        const projectsWithImages = await Promise.all(
            projects.map(async (project) => {
                try {
                    // Query for first image in any set belonging to this project
                    const firstImage = await sql`
                        SELECT i.id, i.set_id 
                        FROM images i 
                        INNER JOIN sets s ON i.set_id = s.id 
                        WHERE s.project_id = ${project.id} 
                        LIMIT 1
                    `;
                    
                    let firstImageUrl = null;
                    if (firstImage.length > 0) {
                        // Get the image URL from blob storage
                        const imageUrls = await listImages(firstImage[0].id);
                        if (imageUrls.length > 0) {
                            firstImageUrl = imageUrls[0];
                        }
                    }
                    
                    return {
                        ...project,
                        firstImageUrl
                    };
                } catch (error) {
                    console.error(`Error getting first image for project ${project.id}:`, error);
                    return {
                        ...project,
                        firstImageUrl: null
                    };
                }
            })
        );
        
        return NextResponse.json({ success: true, projects: projectsWithImages });
    } catch (error) {
        console.error('Error listing projects:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to list projects' },
            { status: 500 }
        );
    }
}
