import * as Tone from "tone";
import { TIMELINE_LEFT_OFFSET, type TimelineZoom } from "../../lib/timing";
import { INSTRUMENTS, type InstrumentName, type Part, type Project } from "../../lib/project";
import { NoteTimeline } from "./NoteTimeline";

const MIDI_NOTE_START = Tone.Frequency("C1").toMidi();
const MIDI_NOTE_END = Tone.Frequency("C8").toMidi();
const NOTE_NAMES = [...new Array(MIDI_NOTE_END - MIDI_NOTE_START)].map((_, i) =>
    Tone.Midi(i + MIDI_NOTE_START).toNote(),
);

interface Props {
    part: Part;
    setPart: (part: Part) => void;
    zoom: TimelineZoom;
    project: Project;
    instrumentName: InstrumentName;
}

export const NoteList: React.FC<Props> = ({ part, setPart, zoom, project, instrumentName }) => {
    function playNote(noteName: string) {
        INSTRUMENTS[instrumentName].triggerAttackRelease(noteName, "0.1s");
    }

    function getNoteColorClass(noteName: string) {
        return noteName.includes("#")
            ? "bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700"
            : "bg-neutral-400 text-black hover:bg-neutral-500 active:bg-neutral-600";
    }

    return (
        <section className="flex flex-col-reverse overflow-x-hidden">
            {NOTE_NAMES.map((noteName) => (
                <div
                    key={noteName}
                    className="flex border-b z-10"
                    onClick={() => playNote(noteName)}
                >
                    <div
                        className={`text-sm p-1 z-10 text-xs cursor-pointer ${getNoteColorClass(noteName)}`}
                        style={{ width: `${TIMELINE_LEFT_OFFSET}px` }}
                    >
                        {noteName}
                    </div>
                    <NoteTimeline {...{ part, setPart, project, zoom, noteName }} />
                </div>
            ))}
        </section>
    );
};
