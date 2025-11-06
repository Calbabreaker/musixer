import { ticksToPixel, TIMELINE_LEFT_OFFSET, type TimelineZoom } from "../../lib/timing";

interface Props {
    ticks: number;
    zoom: TimelineZoom;
}

export const Playhead: React.FC<Props> = ({ ticks, zoom }) => {
    const x = ticksToPixel(ticks, zoom);
    if (x >= 0) {
        return (
            <div
                className="absolute border border-teal-600 h-[91vh] z-20 pointer-events-none"
                style={{ left: `${x + TIMELINE_LEFT_OFFSET}px` }}
            ></div>
        );
    }
};
