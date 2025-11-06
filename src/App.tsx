import { Outlet } from "react-router";
import { useState } from "react";
import {
    CustomContextMenu,
    CustomContextMenuContext,
    type ContextMenuButton,
} from "./components/CustomContextMenu";
import { ClipboardContext } from "./lib/utils";

function App() {
    const [buttons, setMenuButtons] = useState<ContextMenuButton[] | null>(null);
    const [contents, setContents] = useState<any>();

    return (
        <ClipboardContext.Provider
            value={{
                contents,
                // Make sure to deep copy the contents
                setContents: (contents) => setContents(JSON.parse(JSON.stringify(contents))),
            }}
        >
            <CustomContextMenu buttons={buttons} onClose={() => setMenuButtons(null)} />
            <CustomContextMenuContext.Provider value={{ setMenuButtons }}>
                <Outlet />
            </CustomContextMenuContext.Provider>
        </ClipboardContext.Provider>
    );
}

export default App;
