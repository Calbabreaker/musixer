import { createContext, useEffect, useRef, useState } from "react";
import type { Project } from "../../lib/project";
import { TIMELINE_LEFT_OFFSET, wheelNewZoom, type TimelineZoom } from "../../lib/timing";
import { TimelineLines, TimelineRuler } from "./TimelineRuler";
import { DraggableTickObject } from "./DraggableTickObject";
import { Playhead } from "./Playhead";
import { NoteList } from "./NoteList";
import { makeArraySetter } from "../../lib/utils";

interface Props {
    trackIndex?: number;
    partIndex?: number;
    project: Project;
    setProject: (project: Project) => void;
    playheadTick: number;
    onClickSetPlayhead: (e: React.MouseEvent, zoom: TimelineZoom) => void;
}

export const PianoRoll: React.FC<Props> = ({
    trackIndex,
    partIndex,
    project,
    setProject,
    playheadTick,
    onClickSetPlayhead,
}) => {
    if (trackIndex == null || trackIndex >= project.tracks.length) {
        return null;
    }
    const setTrack = makeArraySetter(project.tracks, (tracks) =>
        setProject({ ...project, tracks }),
    );
    const track = project.tracks[trackIndex];

    if (partIndex == null || partIndex >= track.parts.length) {
        return null;
    }
    const part = track.parts[partIndex];
    const setPart = makeArraySetter(track.parts, (parts) =>
        setTrack(trackIndex, { ...track, parts }),
    );

    const elementRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState<TimelineZoom>({
        startTick: part.startTick,
        ticksPerPixel: part.durationTicks / (window.innerWidth - TIMELINE_LEFT_OFFSET),
    });

    useEffect(() => {
        function onWheel(e: WheelEvent) {
            e.stopPropagation();
            setZoom(wheelNewZoom(e, zoom));
        }
        // Need to set event listender manually since the event listener needs to be passive
        if (elementRef.current) {
            elementRef.current.addEventListener("wheel", onWheel, { passive: false });
        }
        return () => {
            if (elementRef.current) {
                elementRef.current.removeEventListener("wheel", onWheel);
            }
        };
    }, [zoom]);

    function onClick(e: React.MouseEvent) {
        e.stopPropagation();
        onClickSetPlayhead(e, zoom);
    }

    return (
        <div ref={elementRef} className="bg-neutral-900" onClick={onClick}>
            <Playhead zoom={zoom} ticks={playheadTick} />
            <TimelineRuler project={project} zoom={zoom} />
            <TimelineLines project={project} zoom={zoom} />
            <div className="size-full absolute" style={{ left: `${TIMELINE_LEFT_OFFSET}px` }}>
                <DraggableTickObject
                    tickObject={part}
                    setTickObject={() => {}}
                    timeSignature={project.time_signature}
                    zoom={zoom}
                    className="opacity-10 mt-px"
                />
            </div>
            <div className="overflow-scroll h-[50vh] border-t">
                <NoteList
                    {...{ part, project }}
                    setPart={(part) => setPart(partIndex, part)}
                    zoom={zoom}
                    instrumentName={track.instrumentName}
                />
            </div>
        </div>
    );
};

export interface PianoRollOpenFor {
    trackIndex: number;
    partIndex: number;
}

interface IPianoRollContext {
    openFor: PianoRollOpenFor | null;
    setOpenFor: (x: PianoRollOpenFor | null) => void;
}

export const PianoRollContext = createContext<IPianoRollContext>(undefined!);
