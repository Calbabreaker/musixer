import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";

export const NavBar: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <nav
            onClick={(e) => e.stopPropagation()}
            className="sticky top-0 bg-neutral-800 border-b flex justify-between px-4 h-12 items-center z-100"
        >
            <Link className="logo flex-none mr-4" to="/">
                <FontAwesomeIcon icon={faMusic} />
                <span className="ml-2 font-bold">Musixer</span>
            </Link>
            <div className="flex gap-4 justify-center items-center w-full">{children}</div>
            <div></div>
        </nav>
    );
};
