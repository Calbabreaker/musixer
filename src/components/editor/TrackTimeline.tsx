import { useContext } from "react";
import type { Note, Part, Project, Track } from "../../lib/project";
import { CustomContextMenuContext } from "../CustomContextMenu";
import { faFileUpload, faPaste, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ClipboardContext, makeArraySetter } from "../../lib/utils";
import { getMarkerTickStep, xPosToTicks, type TimelineZoom } from "../../lib/timing";
import { DraggableTickObject } from "./DraggableTickObject";
import { PianoRollContext } from "./PianoRoll";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

interface Props {
    trackIndex: number;
    setTrack: (index: number, track: Track | null) => void;
    zoom: TimelineZoom;
    project: Project;
}

export const TrackTimeline: React.FC<Props> = ({ trackIndex, setTrack, project, zoom }) => {
    const { setMenuButtons } = useContext(CustomContextMenuContext);
    const { contents } = useContext(ClipboardContext);
    const { openFor, setOpenFor } = useContext(PianoRollContext);

    const track = project.tracks[trackIndex];
    const setPart = makeArraySetter(track.parts, (parts) =>
        setTrack(trackIndex, { ...track, parts }),
    );

    function calcStartTick(e: React.MouseEvent) {
        return xPosToTicks(e.clientX, zoom, project.time_signature, !e.ctrlKey);
    }

    function newPart(e: React.MouseEvent) {
        setPart(null, {
            type: "part",
            startTick: calcStartTick(e),
            durationTicks: getMarkerTickStep(zoom, project.time_signature) * 8,
            notes: [],
        });
    }

    function paste(e: React.MouseEvent) {
        if (contents?.type == "part") {
            setPart(null, { ...contents, startTick: calcStartTick(e) });
        }
    }

    function newPartFromMidi(startTick: number, midi: Midi) {
        const tickConversion = Tone.getTransport().PPQ / midi.header.ppq;
        // Consolidate all notes from all tracks into a single note array
        const notes: Note[] = midi.tracks.flatMap((track) =>
            track.notes.map((note) => ({
                type: "note",
                durationTicks: Math.round(note.durationTicks * tickConversion),
                startTick: Math.round(note.ticks * tickConversion),
                name: note.name,
            })),
        );

        setPart(null, {
            type: "part",
            startTick,
            durationTicks: midi.durationTicks * tickConversion,
            notes,
        });
    }

    function pasteMidiFile(e: React.MouseEvent) {
        // Make a fake file input to open the file prompt for the midi file
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".midi,.mid";

        input.onchange = () => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    newPartFromMidi(calcStartTick(e), new Midi(reader.result as ArrayBuffer));
                } catch (_) {
                    alert("Failed to read midi file.");
                }
            };
            if (input.files?.[0]) {
                reader.readAsArrayBuffer(input.files[0]);
            }
        };

        input.click();
    }

    function onContextMenu(e: React.MouseEvent) {
        e.preventDefault();
        setMenuButtons([
            { icon: faPlus, text: "New", onClick: () => newPart(e) },
            { icon: faPaste, text: "Paste", onClick: () => paste(e) },
            { icon: faFileUpload, text: "Paste midi file", onClick: () => pasteMidiFile(e) },
        ]);
    }

    function updatePart(index: number, part: Part | null) {
        const oldPart = track.parts[index];
        if (
            part &&
            part.startTick != oldPart.startTick &&
            part.durationTicks != oldPart.durationTicks
        ) {
            const diff = oldPart.startTick - part.startTick;
            part.notes = part.notes.map((note) => ({
                ...note,
                startTick: note.startTick + diff,
            }));
        }
        setPart(index, part);
    }

    return (
        <div className="relative grow" onContextMenu={onContextMenu}>
            {track.parts.map((part, i) => (
                <DraggableTickObject
                    key={i}
                    tickObject={part}
                    setTickObject={(part) => updatePart(i, part)}
                    zoom={zoom}
                    timeSignature={project.time_signature}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (e.detail == 2) {
                            setOpenFor({ partIndex: i, trackIndex });
                        }
                    }}
                    className={`${openFor?.trackIndex == trackIndex && openFor?.partIndex == i ? "border-white" : ""}`}
                >
                    {part.notes?.length} notes
                </DraggableTickObject>
            ))}
        </div>
    );
};
