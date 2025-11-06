import { Link, useLoaderData, useNavigate } from "react-router";
import type { Project, Track } from "../lib/project";
import { useContext, useState } from "react";
import { apiDeleteProject } from "../lib/localstorage";
import { CustomContextMenuContext } from "./CustomContextMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faFile, faTrash } from "@fortawesome/free-solid-svg-icons";

export const ProjectList: React.FC = ({}) => {
    const [projects, setProjects] = useState<Project[]>(useLoaderData().projects);
    const { setMenuButtons } = useContext(CustomContextMenuContext);
    const navigate = useNavigate();

    async function deleteProject(id: string) {
        if (confirm("Really delete this project?")) {
            await apiDeleteProject(id);
            setProjects(projects.filter((project) => project.id != id));
        }
    }

    function getNoteCount(tracks: Track[]) {
        return tracks.flatMap((track) => track.parts).reduce((a, part) => a + part.notes.length, 0);
    }

    function openContextMenu(e: React.MouseEvent, id: string) {
        e.preventDefault();
        setMenuButtons([
            { icon: faFile, text: "Open", onClick: () => navigate(`/project/${id}`) },
            { icon: faTrash, text: "Delete", onClick: () => deleteProject(id) },
        ]);
    }

    return (
        <div className="gap-4 border-b">
            {projects.map(({ id, name, description, tracks }) => (
                <div
                    className="border-t p-4 flex gap-4 items-center justify-between"
                    key={id}
                    onContextMenu={(e) => openContextMenu(e, id)}
                >
                    <Link className="text-2xl w-96 hover:underline" to={`/project/${id}`}>
                        {name}
                    </Link>
                    <p className="grow">{description}</p>
                    <div className="flex gap-4 items-center">
                        <div className="text-sm text-neutral-400">
                            <p>{tracks.length} tracks</p>
                            <p>{getNoteCount(tracks)} notes</p>
                        </div>
                        <FontAwesomeIcon
                            icon={faEllipsisV}
                            className="btn-icon"
                            onClick={(e) => openContextMenu(e, id)}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
