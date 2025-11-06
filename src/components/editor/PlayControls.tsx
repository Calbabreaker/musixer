import { useEffect } from "react";
import * as Tone from "tone";
import { getToneNotes, INSTRUMENTS, type Project } from "../../lib/project";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStop } from "@fortawesome/free-solid-svg-icons";
import { formatTicksToBarsBeats, formatTicksToTime } from "../../lib/timing";

interface Props {
    playing: boolean;
    setPlaying: (playing: boolean) => void;
    project: Project;
    playheadTick: number;
    setPlayheadTick: (ticks: number) => void;
}

export const PlayControls: React.FC<Props> = ({
    project,
    playing,
    setPlaying,
    playheadTick,
    setPlayheadTick,
}) => {
    function onKeyDown(e: KeyboardEvent) {
        if (e.code == "Space" && (e.target as HTMLElement)?.tagName != "INPUT") {
            setPlaying(!playing);
            e.preventDefault();
        }
    }

    useEffect(() => {
        window.addEventListener("keypress", onKeyDown);
        return () => window.removeEventListener("keypress", onKeyDown);
    }, [playing]);

    useEffect(() => {
        let tonePart: Tone.Part;

        let interval: number;
        if (playing) {
            tonePart = new Tone.Part((time, value) => {
                value.instrument.triggerAttackRelease(value.note, value.duration, time);
            }, getToneNotes(project)).start(0);

            interval = setInterval(() => setPlayheadTick(Tone.getTransport().ticks), 50);
            Tone.getTransport().bpm.value = project.bpm;
            Tone.getTransport().timeSignature = project.time_signature;
            Tone.getTransport().ticks = playheadTick;
            Tone.getTransport().start();
        }

        return () => {
            // Make sure all sounds stop playing
            [...Object.values(INSTRUMENTS).values()].forEach((instrument) =>
                instrument.releaseAll(),
            );
            if (tonePart) {
                tonePart.dispose();
            }
            Tone.getTransport().stop();
            clearInterval(interval);
        };
    }, [playing]);

    return (
        <div className="flex gap-4">
            {!playing ? (
                <FontAwesomeIcon
                    className="btn-icon"
                    icon={faPlay}
                    onClick={() => setPlaying(true)}
                />
            ) : (
                <FontAwesomeIcon
                    icon={faStop}
                    className="btn-icon"
                    onClick={() => setPlaying(false)}
                />
            )}
            <p>
                <span>{formatTicksToBarsBeats(playheadTick, project.time_signature)}</span>
                <span className="mx-2">/</span>
                <span>{formatTicksToTime(playheadTick, project.bpm)}</span>
            </p>
        </div>
    );
};
