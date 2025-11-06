import { useState } from "react";
import {
    CustomContextMenu,
    CustomContextMenuContext,
    type ContextMenuButton,
} from "@/components/CustomContextMenu";
import { ClipboardContext } from "@/lib/utils";
import "./global.css";

export const App: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [buttons, setMenuButtons] = useState<ContextMenuButton[] | null>(null);
    const [contents, setContents] = useState<any>();

    return (
        <ClipboardContext.Provider
            value={{
                contents,
                // Make sure to deep copy the contents
                setContents: (contents) => setContents(structuredClone(contents)),
            }}
        >
            <CustomContextMenu buttons={buttons} onClose={() => setMenuButtons(null)} />
            <CustomContextMenuContext.Provider value={{ setMenuButtons }}>
                {children}
            </CustomContextMenuContext.Provider>
        </ClipboardContext.Provider>
    );
};
