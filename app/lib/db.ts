import { neon } from "@neondatabase/serverless";
import { list, put } from "@vercel/blob";
import type { Project, ProjectAttachment, Set, Image } from "./types";


// --- IMAGE STORAGE ---

// Upload image to blob storage
export async function uploadImage(key: string, image: string | Buffer | ArrayBuffer) {
  const { url } = await put(key, image, { access: 'public' });
  return url;
}

// Takes in a project id and returns all the images for that project
export async function listImages(projectId: string): Promise<string[]> {
  const { blobs } = await list({ prefix: projectId });
  return blobs.map((blob) => blob.url);
}

// --- APP DB ---

const sql = neon(`${process.env.DATABASE_URL}`);

export async function insertProject(project: Project) {
    await sql`INSERT INTO projects (id, name, prompt, cover_image_id) VALUES (${project.id}, ${project.name}, ${project.prompt}, ${project.coverImageId})`;
}

export async function updateProject(project: Project) {
    await sql`UPDATE projects SET name = ${project.name}, prompt = ${project.prompt}, cover_image_id = ${project.coverImageId} WHERE id = ${project.id}`;
}

export async function insertProjectAttachment(projectAttachment: ProjectAttachment) {
    await sql`INSERT INTO project_attachments (id, project_id) VALUES (${projectAttachment.id}, ${projectAttachment.projectId})`;
}

export async function insertSet(set: Set) {
    await sql`INSERT INTO sets (id, project_id, name, prompts) VALUES (${set.id}, ${set.projectId}, ${set.name}, ${set.prompts})`;
}

export async function updateSet(set: Set) {
    await sql`UPDATE sets SET name = ${set.name}, prompts = ${set.prompts} WHERE id = ${set.id}`;
}

export async function saveImagesToSet(imageIds: string[], setId: string) {
    for (const imageId of imageIds) {
        await sql`INSERT INTO images (id, set_id) VALUES (${imageId}, ${setId})`;
    }
}

export async function saveImageToSet(imageId: string, setId: string) {
    await sql`INSERT INTO images (id, set_id) VALUES (${imageId}, ${setId})`;
}

export async function listProjects(): Promise<Project[]> {
    const projects = await sql`SELECT * FROM projects`;
    return projects.map((project: any) => ({
        id: project.id,
        name: project.name,
        prompt: project.prompt,
        coverImageId: project.cover_image_id,
    }));
}

export async function getProject(id: string) {
    const details = await sql`SELECT * FROM projects WHERE id = ${id} LIMIT 1`;
    const sets = await sql`SELECT * FROM sets WHERE project_id = ${id}`;
    const attachments = await getProjectAttachments(id);
    
    // Get the URLs for the prompt images with their attachment IDs
    const promptImageData = await Promise.all(
        attachments.map(async (attachment) => {
            // The blob key is: projectId/prompt/attachmentId
            const blobKey = `${id}/prompt/${attachment.id}`;
            console.log(`Looking for blob with key: ${blobKey}`);
            // List blobs with this specific prefix
            const images = await listImages(blobKey);
            console.log(`Found ${images.length} images for key ${blobKey}:`, images);
            return images.length > 0 ? {
                url: images[0],
                attachmentId: attachment.id
            } : null;
        })
    );

    const promptImageUrls = promptImageData.filter(Boolean).map(data => data!.url);
    const promptAttachments = promptImageData.filter(Boolean);

    const project = {
        id: details[0].id,
        name: details[0].name,
        prompt: details[0].prompt,
        coverImageId: details[0].cover_image_id,
        promptImageUrls: promptImageUrls,
        promptAttachments: promptAttachments,
        sets: sets.map((set) => ({
            id: set.id,
            name: set.name,
            prompts: set.prompts,
        })),
    }
    return project;
}

export async function getProjectAttachment(id: string) {
    const projectAttachment = await sql`SELECT * FROM project_attachments WHERE id = ${id}`;
    return projectAttachment;
}

export async function getProjectAttachments(projectId: string): Promise<ProjectAttachment[]> {
    const attachments = await sql`SELECT * FROM project_attachments WHERE project_id = ${projectId}`;
    return attachments.map((attachment: any) => ({
        id: attachment.id,
        projectId: attachment.project_id,
    }));
}

export async function getImagesInSet(setId: string): Promise<Image[]> {
    const images = await sql`SELECT * FROM images WHERE set_id = ${setId}`;
    return images.map((image: any) => ({
        id: image.id,
        setId: image.set_id,
        definition: image.definition,
    }));
}

export async function deleteProject(id: string) {
    await sql`DELETE FROM projects WHERE id = ${id}`;
}

export async function deleteSet(id: string) {
    await sql`DELETE FROM sets WHERE id = ${id}`;
}

export async function deleteImage(id: string) {
    await sql`DELETE FROM images WHERE id = ${id}`;
}

export async function deleteProjectAttachments(projectId: string) {
    await sql`DELETE FROM project_attachments WHERE project_id = ${projectId}`;
}

export async function deleteProjectAttachment(attachmentId: string) {
    await sql`DELETE FROM project_attachments WHERE id = ${attachmentId}`;
}
