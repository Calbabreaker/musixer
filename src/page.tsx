import { StrictMode, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { ProjectList } from "@/components/ProjectList";
import { App } from "./App";
import { apiCreateProject, apiGetProjects } from "@/lib/localstorage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { createRoot } from "react-dom/client";
import { Loader } from "@/components/Loader";

const Dashboard: React.FC = () => {
    const [creating, setCreating] = useState(false);

    async function onClick() {
        try {
            setCreating(true);
            const project = await apiCreateProject();
            location.href = `${import.meta.env.BASE_URL}project/?id=${project.id}`;
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
                <Loader
                    load={() => apiGetProjects()}
                    render={(projects) => <ProjectList projects={projects} />}
                />
            </main>
        </>
    );
};

createRoot(document.body).render(
    <StrictMode>
        <App>
            <Dashboard />
        </App>
    </StrictMode>,
);
