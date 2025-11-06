import { useRouteError } from "react-router";
import { NavBar } from "../NavBar";

interface Props {
    title?: string;
    message?: string;
}

export const ErrorPage: React.FC<Props> = (props) => {
    const routeError = useRouteError() as Response;

    let title = props.title ?? "Something went wrong :(";
    let message = props.message ?? "Something went wrong when loading the page";

    if (typeof routeError?.status == "number") {
        if (routeError.status == 400) {
            title = "Not found";
            message = "That resource does not exist.";
        } else if (routeError.status.toString().startsWith("5")) {
            title = "Server error";
            message = "There was an error with the server.";
        }
    }
    console.error(routeError);

    return (
        <>
            <title>{`${title} - Musixer`}</title>
            <NavBar />
            <main className="p-4">
                <h1 className="text-4xl mb-4">{title}</h1>
                <p>{message}</p>
            </main>
        </>
    );
};
