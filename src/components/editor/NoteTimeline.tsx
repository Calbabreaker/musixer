import { useContext, useState } from "react";
import { MIN_DURATION, type Note, type Part, type Project } from "../../lib/project";
import { xPosToTicks, type TimelineZoom } from "../../lib/timing";
import { ClipboardContext, makeArraySetter, useDrag } from "../../lib/utils";
import { DraggableTickObject } from "./DraggableTickObject";
import { CustomContextMenuContext } from "../CustomContextMenu";
import { faPaste } from "@fortawesome/free-solid-svg-icons";

interface Props {
    part: Part;
    setPart: (part: Part) => void;
    noteName: string;
    zoom: TimelineZoom;
    project: Project;
}

export const NoteTimeline: React.FC<Props> = ({ part, setPart, noteName, zoom, project }) => {
    const setNote = makeArraySetter(part.notes, (notes) => setPart({ ...part, notes }));
    const [noteBeingCreated, setNoteBeingCreated] = useState<Note | null>(null);
    const { setMenuButtons } = useContext(CustomContextMenuContext);
    const { contents } = useContext(ClipboardContext);

    function calcNoteDragValue(e: MouseEvent): Note {
        const ticks = xPosToTicks(e.clientX, zoom, project.time_signature, !e.ctrlKey);
        return {
            ...noteBeingCreated!,
            durationTicks: Math.max(
                ticks - noteBeingCreated!.startTick - part.startTick,
                MIN_DURATION,
            ),
        };
    }

    const dragStart = useDrag(
        calcNoteDragValue,
        setNoteBeingCreated,
        (note) => setNote(null, note),
        () => setNoteBeingCreated(null),
    );

    function calcStartTick(e: React.MouseEvent) {
        return xPosToTicks(e.clientX, zoom, project.time_signature, !e.ctrlKey) - part.startTick;
    }

    function onMouseDown(e: React.MouseEvent) {
        if (e.button == 0) {
            dragStart(e);
            setNoteBeingCreated({
                type: "note",
                startTick: calcStartTick(e),
                durationTicks: 0,
                name: noteName,
            });
        }
    }

    function paste(e: React.MouseEvent) {
        if (contents?.type == "note") {
            setNote(null, { ...contents, startTick: calcStartTick(e), name: noteName });
        }
    }

    function onContextMenu(e: React.MouseEvent) {
        e.preventDefault();
        setMenuButtons([{ icon: faPaste, text: "Paste", onClick: () => paste(e) }]);
    }

    function correctTickOffset(note: Note): Note {
        return { ...note, startTick: note.startTick + part.startTick };
    }

    return (
        <div
            className="relative grow cursor-crosshair"
            onMouseDown={onMouseDown}
            onContextMenu={onContextMenu}
        >
            <>
                {part.notes.map((note, i) => {
                    return (
                        note.name == noteName && (
                            <DraggableTickObject
                                key={i}
                                tickObject={correctTickOffset(note)}
                                setTickObject={(note) => {
                                    // Correct for part offset
                                    if (note) {
                                        note.startTick -= part.startTick;
                                    }
                                    setNote(i, note);
                                }}
                                zoom={zoom}
                                timeSignature={project.time_signature}
                            />
                        )
                    );
                })}
                {noteBeingCreated && (
                    <DraggableTickObject
                        tickObject={correctTickOffset(noteBeingCreated)}
                        setTickObject={() => {}}
                        timeSignature={project.time_signature}
                        zoom={zoom}
                    />
                )}
            </>
        </div>
    );
};
