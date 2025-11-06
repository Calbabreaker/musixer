import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { instrumentNames, type InstrumentName, type Track } from "../../lib/project";
import { EditableText } from "../EditableText";
import { useContext, useState } from "react";
import { faEllipsis, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { CustomContextMenuContext } from "../CustomContextMenu";

interface Props {
    track: Track;
    setTrack: (track: Track | null) => void;
}

export const TrackControls: React.FC<Props> = ({ track, setTrack }) => {
    const [forceEdit, setForceEdit] = useState(false);
    const { setMenuButtons } = useContext(CustomContextMenuContext);

    function openContextMenu(e: React.MouseEvent) {
        e.preventDefault();
        setMenuButtons([
            { icon: faPencil, text: "Rename", onClick: () => setForceEdit(true) },
            { icon: faTrash, text: "Delete", onClick: () => setTrack(null) },
        ]);
    }

    return (
        <div className="text-sm w-full" onContextMenu={openContextMenu}>
            <div className="grid grid-cols-[1fr_2rem] place-items-center">
                <EditableText
                    text={track.name}
                    onFinish={(name) => {
                        setTrack({ ...track, name });
                        setForceEdit(false);
                    }}
                    forceEdit={forceEdit}
                />
                <FontAwesomeIcon className="btn-icon" icon={faEllipsis} onClick={openContextMenu} />
            </div>
            <div className="px-2 pb-2">
                <select
                    className="border rounded p-1 w-full"
                    value={track.instrumentName}
                    onChange={(e) =>
                        setTrack({
                            ...track,
                            instrumentName: e.currentTarget.value as InstrumentName,
                        })
                    }
                >
                    {instrumentNames.map((name) => (
                        <option value={name} key={name}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};
