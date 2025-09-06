import { neon } from "@neondatabase/serverless";
import { list, put } from "@vercel/blob";
import type { Project, ProjectAttachment, Set, Image } from "./types";


// --- IMAGE STORAGE ---

// Image is base64 encoded
export async function uploadImage(key: string, image: string) {
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
    await sql`INSERT INTO images (id, set_id) VALUES (${imageIds.map((id) => sql`(${id}, ${setId})`).join(',')})`;
}

export async function getProject(id: string) {
    const details = await sql`SELECT * FROM projects WHERE id = ${id} LIMIT 1`;
    const sets = await sql`SELECT * FROM sets WHERE project_id = ${id}`;

    const project = {
        id: details[0].id,
        name: details[0].name,
        prompt: details[0].prompt,
        coverImageId: details[0].cover_image_id,
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
