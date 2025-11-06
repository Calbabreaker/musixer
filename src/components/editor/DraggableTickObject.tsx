import { useContext, useEffect, useRef, useState } from "react";
import { ticksToPixel, xPosToTicks, type TimelineZoom } from "../../lib/timing";
import { CustomContextMenuContext } from "../CustomContextMenu";
import { faCopy, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ClipboardContext, useDrag } from "../../lib/utils";
import { MIN_DURATION } from "../../lib/project";

interface TickObject {
    startTick: number;
    durationTicks: number;
}

interface Props<T extends TickObject = any> extends React.ComponentProps<"div"> {
    tickObject: T;
    setTickObject: (newObject: T | null) => void;
    timeSignature: [number, number];
    zoom: TimelineZoom;
}

export const DraggableTickObject: React.FC<React.PropsWithChildren<Props>> = (props) => {
    const { tickObject, setTickObject, zoom, timeSignature, ...otherProps } = props;

    const centerDragOffset = useRef(0);
    const { setMenuButtons } = useContext(CustomContextMenuContext);
    const { setContents } = useContext(ClipboardContext);

    // Keep our own tick object data so we can modify the UI without updating the object itself
    const [localTickObject, setLocalTickObject] = useState(tickObject);

    useEffect(() => {
        setLocalTickObject(tickObject);
    }, [tickObject]);

    const left = ticksToPixel(localTickObject.startTick, zoom);
    const width = localTickObject.durationTicks / zoom.ticksPerPixel;

    function leftCalcTicks(e: MouseEvent): TickObject {
        const startTick = Math.max(xPosToTicks(e.clientX, zoom, timeSignature, !e.ctrlKey), 0);
        const diffTicks = localTickObject.startTick - startTick;
        return {
            ...localTickObject,
            startTick,
            durationTicks: Math.max(localTickObject.durationTicks + diffTicks, MIN_DURATION),
        };
    }

    function centerCalcTicks(e: MouseEvent): TickObject {
        const x = e.clientX - centerDragOffset.current;
        return {
            ...localTickObject,
            startTick: Math.max(xPosToTicks(x, zoom, timeSignature, !e.ctrlKey), 0),
        };
    }

    function rightCalcTicks(e: MouseEvent): TickObject {
        const ticks = xPosToTicks(e.clientX, zoom, timeSignature, !e.ctrlKey);
        return {
            ...localTickObject,
            durationTicks: Math.max(ticks - localTickObject.startTick, MIN_DURATION),
        };
    }

    const leftDragStart = useDrag(leftCalcTicks, setLocalTickObject, setTickObject);
    const centerDragStart = useDrag(centerCalcTicks, setLocalTickObject, setTickObject);
    const rightDragStart = useDrag(rightCalcTicks, setLocalTickObject, setTickObject);

    function onContextMenu(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setMenuButtons([
            { icon: faCopy, text: "Copy", onClick: () => setContents(tickObject) },
            { icon: faTrash, text: "Delete", onClick: () => setTickObject(null) },
        ]);
    }

    if (left + width > 0) {
        return (
            <div
                {...otherProps}
                className={`absolute h-full flex bg-blue-500 rounded w-fit border-2 border-blue-400 ${props.className}`}
                style={{ left: `${left}px`, width: `${width}px` }}
                onContextMenu={onContextMenu}
            >
                <div className="absolute size-full grid place-items-center pointer-events-none select-none overflow-hidden">
                    {props.children}
                </div>
                <div className="cursor-col-resize w-4" onMouseDown={leftDragStart} />
                <div
                    className="cursor-grab w-full"
                    onMouseDown={(e) => {
                        // Get the offset of the mouse cursor from the start of the object
                        // so we can offset it latter when we're dragging
                        const parentRect = e.currentTarget.parentElement!.getBoundingClientRect();
                        centerDragOffset.current = e.clientX - parentRect.left;
                        centerDragStart(e);
                    }}
                ></div>
                <div className="cursor-col-resize w-4" onMouseDown={rightDragStart} />
            </div>
        );
    }
};
