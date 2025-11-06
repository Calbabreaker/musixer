import * as Tone from "tone";

export const instrumentNames = [
    "piano",
    "flute",
    "violin",
    "trumpet",
    "fatsine",
    "sawtooth",
    "drums",
] as const;
export type InstrumentName = (typeof instrumentNames)[number];

export interface Note {
    // Include a type property to know what type the object is in the clipboard content
    type: "note";
    name: string;
    startTick: number;
    durationTicks: number;
}

export const MIN_DURATION = 10;

export interface Part {
    type: "part";
    notes: Note[];
    startTick: number;
    durationTicks: number;
}

export interface Track {
    parts: Part[];
    name: string;
    instrumentName: InstrumentName;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    tracks: Track[];
    bpm: number;
    // Stored as [numerator, denominator]
    time_signature: [number, number];
}

const SAMPLE_PATH = `${import.meta.env.BASE_URL}samples`;

export const INSTRUMENTS: Record<InstrumentName, Tone.PolySynth> = {
    fatsine: new Tone.PolySynth(Tone.Synth, {
        oscillator: {
            type: "fatsine",
        },
    }).toDestination(),
    sawtooth: new Tone.PolySynth(Tone.Synth, {
        oscillator: {
            type: "sawtooth8",
        },
    }),
    drums: new Tone.Sampler({
        urls: {
            C1: "kick.ogg",
            Db1: "snare.ogg",
            D1: "hihat_close.ogg",
            Eb1: "hihat_open.ogg",
            E1: "tom.ogg",
            F1: "ride.ogg",
            Gb1: "crash_left.ogg",
            G1: "crash_right.ogg",
        },
        volume: 20,
        release: 20,
        baseUrl: `${SAMPLE_PATH}/drums/`,
    }) as any,
    flute: new Tone.Sampler({
        urls: {
            Ab4: "Ab4.ogg",
            B4: "B4.ogg",
            Db4: "Db4.ogg",
            F4: "F4.ogg",
        },
        release: "1s",
        baseUrl: `${SAMPLE_PATH}/flute/`,
    }) as any,
    violin: new Tone.Sampler({
        urls: {
            A4: "A4.ogg",
            C4: "C4.ogg",
            D4: "D4.ogg",
            G4: "G4.ogg",
        },
        release: "1s",
        baseUrl: `${SAMPLE_PATH}/violin/`,
    }) as any,
    trumpet: new Tone.Sampler({
        urls: {
            A4: "A4.ogg",
            B4: "B4.ogg",
            F4: "F4.ogg",
            G4: "G4.ogg",
        },
        release: "1s",
        baseUrl: `${SAMPLE_PATH}/trumpet/`,
    }) as any,
    piano: new Tone.Sampler({
        urls: { A4: "A4.ogg", C4: "C4.ogg", "D#4": "Ds4.ogg", "F#4": "Fs4.ogg" },
        release: "1s",
        baseUrl: `${SAMPLE_PATH}/piano/`,
    }) as any,
};

// Connect all the instruments to the tone transport
const panner = new Tone.Panner3D().toDestination();
[...Object.values(INSTRUMENTS).values()].forEach((instrument) => instrument.connect(panner));

/**
 * Flatten all the notes in the project and convert it to be used in a tone part while including the
 * instrument for it.
 *
 * @param project - The project to get the notes from.
 * @returns All the notes from the project.
 */
export function getToneNotes(project: Project) {
    return project.tracks.flatMap((track) =>
        track.parts.flatMap((part) =>
            part.notes
                .filter(
                    // Only only notes inside the bounds of the part
                    (note) => note.startTick >= 0 && note.startTick < part.durationTicks,
                )
                .map((note) => ({
                    note: note.name,
                    // Cut off the end of the note if it goes over the part
                    duration: `${Math.min(note.durationTicks, part.durationTicks - note.startTick)}i`,
                    time: `${note.startTick + part.startTick}i`,
                    instrument: INSTRUMENTS[track.instrumentName],
                })),
        ),
    );
}
