import type { Project } from "../../lib/project";
import {
    getMarkerTickStep,
    ticksToBeat,
    ticksToPixel,
    formatTicksToTime,
    TIMELINE_LEFT_OFFSET,
    type TimelineZoom,
    formatTicksToBarsBeats,
} from "../../lib/timing";
import { useGetWidth } from "../../lib/utils";

interface Props {
    project: Project;
    zoom: TimelineZoom;
}

export const TimelineRuler: React.FC<Props> = ({ project, zoom }) => {
    const [width, elementRef] = useGetWidth();

    function getColor(marker: MarkerInfo) {
        return Number.isInteger(marker.bar)
            ? "text-neutral-300 border-neutral-300"
            : "text-neutral-500 border-neutral-500";
    }

    function getHeight(marker: MarkerInfo) {
        if (marker.isTime) {
            return "100%";
        } else if (Number.isInteger(marker.bar)) {
            return "25%";
        } else if (Number.isInteger(marker.beat)) {
            return "20%";
        } else {
            return "10%";
        }
    }

    return (
        <div
            className="relative flex text-sm h-10 items-end border-l"
            ref={elementRef}
            style={{ left: `${TIMELINE_LEFT_OFFSET}px` }}
        >
            {mapMarkers(zoom, project.time_signature, width, (marker) => (
                <div
                    className={`border-l pl-2 ${getColor(marker)} w-0`}
                    key={marker.tick}
                    style={{ ...marker.style, height: getHeight(marker) }}
                >
                    {marker.isTime && (
                        <>
                            <p>{formatTicksToBarsBeats(marker.tick, project.time_signature)}</p>
                            <p className="text-xs">{formatTicksToTime(marker.tick, project.bpm)}</p>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export const TimelineLines: React.FC<Props> = ({ zoom, project }) => {
    const [width, elementRef] = useGetWidth();

    function getColor(marker: MarkerInfo) {
        if (Number.isInteger(marker.bar)) {
            return "border-neutral-500";
        } else if (Number.isInteger(marker.beat)) {
            return "border-neutral-700";
        } else {
            return "border-neutral-800";
        }
    }

    return (
        <div
            className="fixed h-[90vh] flex pointer-events-none overflow-none w-full border-l"
            style={{ left: `${TIMELINE_LEFT_OFFSET}px` }}
            ref={elementRef}
        >
            {mapMarkers(zoom, project.time_signature, width, (marker) => (
                <div
                    className={`border-l ${getColor(marker)} h-full`}
                    key={marker.tick}
                    style={marker.style}
                ></div>
            ))}
        </div>
    );
};

interface MarkerInfo {
    style: React.CSSProperties;
    tick: number;
    beat: number;
    bar: number;
    isTime: boolean;
}

function mapMarkers<T>(
    zoom: TimelineZoom,
    timeSignature: [number, number],
    containerWidth: number,
    mapFunc: (marker: MarkerInfo) => T,
): T[] {
    const tickStep = getMarkerTickStep(zoom, timeSignature);
    const markerWidth = tickStep / zoom.ticksPerPixel;
    // Start the markers on the next interval of tickStep
    const snappedStartTick = Math.ceil(zoom.startTick / tickStep) * tickStep;

    return [...Array(Math.ceil(containerWidth / markerWidth))].map((_, i) => {
        const tick = i * tickStep + snappedStartTick;
        const beat = ticksToBeat(tick, timeSignature);
        const bar = beat / timeSignature[0];
        const isTime = (tick / tickStep) % (timeSignature[0] * 4) == 0;

        const style: React.CSSProperties = { width: `${markerWidth}px` };
        // Add margin for the first marker to shift the markers over by the difference between the
        // actual tick start and the snapped tick start
        if (i == 0) {
            style.marginLeft = `${ticksToPixel(snappedStartTick, zoom)}px`;
        }
        return mapFunc({ style, tick, beat, bar, isTime });
    });
}
