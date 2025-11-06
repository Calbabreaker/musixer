import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createContext, useEffect, useState } from "react";
import { useGetWidth } from "../lib/utils";

export interface ContextMenuButton {
    icon: IconDefinition;
    text: string;
    onClick: () => void;
}

interface Props {
    // Contains the buttons data for the context menu. Menu will be open if not null.
    buttons: ContextMenuButton[] | null;
    onClose: () => void;
}

export const CustomContextMenu: React.FC<Props> = ({ buttons, onClose }) => {
    const [mousePos, setMousePos] = useState([0, 0]);
    const [menuWidth, elementRef] = useGetWidth(false);

    function onMouseMove(e: MouseEvent) {
        // Keep track of the mouse position to know where to place the context menu when it opens
        if (!buttons) {
            setMousePos([e.clientX, e.clientY]);
        }
    }

    useEffect(() => {
        window.addEventListener("mousemove", onMouseMove);
        return () => window.removeEventListener("mousemove", onMouseMove);
    }, [buttons]);

    if (!buttons) {
        return null;
    }

    const positionRight = window.innerWidth - mousePos[0] < menuWidth;

    return (
        <div className="fixed top-0 left-0 size-full z-100">
            <div className="fixed size-full" onClick={onClose} />
            <div
                ref={elementRef}
                className="absolute z-30 flex flex-col items-start bg-neutral-800 border"
                style={{
                    left: positionRight ? "" : `${mousePos[0]}px`,
                    right: positionRight ? "1rem" : "",
                    top: `${mousePos[1]}px`,
                }}
            >
                {buttons.map(({ onClick, text, icon }, i) => (
                    <button
                        key={i}
                        className="btn-with-bg text-left truncate"
                        onClick={() => {
                            onClick();
                            onClose();
                        }}
                    >
                        <FontAwesomeIcon className="mr-2" icon={icon} />
                        {text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export interface ICustomContextMenuContext {
    setMenuButtons: (buttons: ContextMenuButton[]) => void;
}

export const CustomContextMenuContext = createContext<ICustomContextMenuContext>(undefined!);
