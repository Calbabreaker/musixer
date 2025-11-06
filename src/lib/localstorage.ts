import type { Project } from "./project";

function getProjects(): Record<string, Project> {
    try {
        return JSON.parse(localStorage.getItem("projects")!) ?? {};
    } catch (_) {
        return {};
    }
}

export async function apiGetProjects(): Promise<Project[]> {
    return [...Object.values(getProjects())];
}

export async function apiGetProject(id: string): Promise<Project> {
    return getProjects()[id];
}

export async function apiCreateProject(): Promise<Project> {
    const projects = getProjects();
    const project: Project = {
        id: Math.random().toString(16).slice(2),
        tracks: [],
        name: "New song",
        description: "New description",
        bpm: 120,
        time_signature: [4, 4],
    };
    projects[project.id] = project;
    localStorage.setItem("projects", JSON.stringify(projects));
    return project;
}

export async function apiDeleteProject(id: string): Promise<void> {
    const projects = getProjects();
    delete projects[id];
    localStorage.setItem("projects", JSON.stringify(projects));
}

/**
 * Saves the project object into the database.
 *
 * @param project - The project containing the id to be saved.
 */
export async function apiSaveProject(project: Project): Promise<void> {
    console.log("Saving project", project);
    const projects = getProjects();
    projects[project.id] = project;
    localStorage.setItem("projects", JSON.stringify(projects));
}
