import { createContext, useCallback, useEffect, useRef, useState } from "react";

/**
 * Make a function that can append, delete or modify an element inside the array using the
 * set array function. If index is null a new element is appended. If newItem is null the item
 * at the index is removed ortherwise the item at the index is set to newItem.
 *
 * @param array - The array to make a function from.
 * @param setArray - The setter function for the array.
 * @returns A new setter function to set individual elements.
 */
export function makeArraySetter<T>(
    array: T[],
    setArray: (array: T[]) => void,
): (index: number | null, newItem: T | null) => void {
    return (index, newItem) => {
        if (index != null) {
            if (newItem != null) {
                setArray(array.map((oldItem, i) => (i == index ? newItem : oldItem)));
            } else {
                setArray(array.filter((_, i) => i != index));
            }
        } else if (newItem) {
            setArray([...array, newItem]);
        }
    };
}

/**
 * Hook to get the width of an element.
 *
 * @param [onScreen=true] - Whether or not to get the element width's as it is on screen.
 * If this is false it will get the element actual width instead.
 * @returns A callback to be set to the element ref to get the width and the width of the element.
 */
export function useGetWidth(onScreen = true): [number, (e: HTMLDivElement) => void] {
    const [width, setWidth] = useState(0);

    const elementRef = useCallback((element: HTMLDivElement) => {
        function onResize() {
            if (element) {
                if (onScreen) {
                    const elementPosition = element.getBoundingClientRect().left;
                    setWidth(Math.max(window.innerWidth - elementPosition, 0));
                } else {
                    setWidth(element.clientWidth);
                }
            }
        }

        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return [width, elementRef];
}

/**
 * Make a function that only allows a single promise from the input function to happen at once.
 * It will take note the parameters passed in to any subsequent calls of this function
 * which will be passed into the original function once the current promise has resolved.
 *
 * @param fetchFunc - The proise function to make a lock around.
 * @returns - The locked promise function.
 */
export function usePromiseLock<A extends Array<any>>(
    fetchFunc: (...params: A) => Promise<void>,
): (...params: A) => Promise<void> {
    let saving = useRef(false);
    let nextParamsToUse = useRef<A | null>(null);

    return async (...params) => {
        // Only allow a fetch at a time
        if (!saving.current) {
            saving.current = true;

            let paramsToUse: A | null = params;
            while (paramsToUse != null) {
                await fetchFunc(...paramsToUse);
                paramsToUse = nextParamsToUse.current;
                nextParamsToUse.current = null;
            }

            saving.current = false;
        } else {
            // Set the param to be used to fetch next once the current fetch has finished
            nextParamsToUse.current = params;
        }
    };
}

/**
 * React hook to manage a dragging.
 *
 * @param calcValue - Function that calculates the resulting value for the dragging and drag end events.
 * @param draggingSetState - Function to call while dragging. The input value is calculated from calcValue.
 * @param dragEndSetState - Function to call when drag ends. The input value is calculated from calcValue.
 * @param cleanup - Will be always called when mouse up even if the mouse hand't moved.
 * @returns Callback that signifies the start of a drag, usually called in the on mouse down event.
 */
export function useDrag<T>(
    calcValue: (e: MouseEvent) => T,
    draggingSetState: (value: T) => void,
    dragEndSetState: (value: T) => void,
    cleanup = () => {},
): (e: React.MouseEvent) => void {
    const [dragging, setDragging] = useState(false);
    const mouseMoved = useRef(false);

    useEffect(() => {
        function onMouseMove(e: MouseEvent) {
            draggingSetState(calcValue(e));
            mouseMoved.current = true;
        }

        function onMouseUp(e: MouseEvent) {
            setDragging(false);
            cleanup();
            if (mouseMoved.current) {
                dragEndSetState(calcValue(e));
                mouseMoved.current = false;
            }
        }

        if (dragging) {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [dragging]);

    return (e) => {
        cleanup();
        e.stopPropagation();
        setDragging(true);
    };
}

type ClipboardContent = any & { type: string };

interface IClipboardContext {
    contents: ClipboardContent;
    setContents: (contents: ClipboardContent) => void;
}

export const ClipboardContext = createContext<IClipboardContext>(undefined!);
