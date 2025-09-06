export type Project = {
    id: string;
    name: string;
    prompt: string | null;
    coverImageId: string | null;
}

export type ProjectAttachment = {
    id: string;
    projectId: string;
}

export type Set = {
    id: string;
    projectId: string;
    name: string;
    prompts: string | null;
}

export type Image = {
    id: string;
    setId: string;
}
