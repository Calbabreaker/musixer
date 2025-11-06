import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { apiGetProject, apiGetProjects } from "./lib/localstorage.ts";
import { ProjectEditor } from "./components/pages/ProjectEditor.tsx";
import { Dashboard } from "./components/pages/Dashboard.tsx";
import { ErrorPage } from "./components/pages/ErrorPage.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Dashboard />,
                loader: async () => ({ projects: await apiGetProjects() }),
            },
            {
                path: "project/:id",
                element: <ProjectEditor />,
                loader: async ({ params }) => ({ project: await apiGetProject(params.id!) }),
                errorElement: <ErrorPage />,
            },
            {
                path: "*",
                element: <ErrorPage title="Not Found" message="That page does not exist" />,
            },
        ],
    },
]);

createRoot(document.body).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
