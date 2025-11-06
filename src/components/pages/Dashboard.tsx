import { useState } from "react";
import { NavBar } from "../NavBar";
import { ProjectList } from "../ProjectList";
import { apiCreateProject } from "../../lib/localstorage";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface Props {}

export const Dashboard: React.FC<Props> = ({}) => {
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();

    async function onClick() {
        try {
            setCreating(true);
            const project = await apiCreateProject();
            navigate(`/project/${project.id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to create project :(");
            setCreating(false);
        }
    }

    return (
        <>
            <title>Dashboard - Musixer</title>
            <NavBar>Dashboard</NavBar>
            <main className="p-4">
                <div className="flex gap-8 items-center mb-4">
                    <h1 className="text-4xl">Projects</h1>
                    <button className="btn h-fit" onClick={onClick} disabled={creating}>
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        {creating ? "Creating..." : "New Project"}
                    </button>
                </div>
                <ProjectList />
            </main>
        </>
    );
};
