import * as Tone from "tone";

// Left offset of when the timeline should begin on the screen in pixels
export const TIMELINE_LEFT_OFFSET = parseFloat(getComputedStyle(document.body).fontSize) * 16;

export interface TimelineZoom {
    startTick: number;
    ticksPerPixel: number;
}

/**
 * Get a new timeline zoom based on the mouse wheel event.
 *
 * @param e - Wheel event object from the wheel event.
 * @param zoom - The current timeline zoom.
 * @returns New zoom object.
 */
export function wheelNewZoom(e: WheelEvent, zoom: TimelineZoom): TimelineZoom {
    // Scroll the timeline if scrolling horizontally or shift is pressed
    if (e.deltaX || e.shiftKey) {
        // Increase scroll based on zoom level
        const delta = (e.deltaX || e.deltaY) * (zoom.ticksPerPixel / 5);
        const startTick = Math.max(zoom.startTick + delta, 0);
        return { ...zoom, startTick };
    } else if (e.ctrlKey && e.deltaY) {
        e.preventDefault();
        let delta = -e.deltaY / 100;
        // Divide the zoom level instead of multiple if zooming in
        if (delta > 0) {
            delta = 1 / delta;
        }
        const ticksPerPixel = zoom.ticksPerPixel * Math.abs(delta);
        return { ...zoom, ticksPerPixel: Math.max(Math.min(ticksPerPixel, 1000), 0.2) };
    }
    return zoom;
}

/**
 * Convert ticks to the pixel position based on the zoom.
 *
 * @param ticks - Ticks to convert.
 * @param zoom - The timeline zoom.
 * @returns - Converted position.
 */
export function ticksToPixel(ticks: number, zoom: TimelineZoom): number {
    return (ticks - zoom.startTick) / zoom.ticksPerPixel;
}

/**
 * Convert pixel position to ticks based on the zoom.
 *
 * @param pixels - Pixels to convert.
 * @param zoom - The timeline zoom.
 * @returns - Converted ticks.
 */
export function pixelToTicks(pixels: number, zoom: TimelineZoom): number {
    return Math.round(pixels * zoom.ticksPerPixel + zoom.startTick);
}

/**
 * Convert the x position on screen to the number of that position is ticks.
 * Will factor for the timeline offset.
 *
 * @param x - The position.
 * @param zoom - The timeline zoom.
 * @param timeSignature - Time signature tuple.
 * @param [snap=true] - Whether or not to snap the ticks to the closest marker.
 * @returns - Converted ticks.
 */
export function xPosToTicks(
    x: number,
    zoom: TimelineZoom,
    timeSignature: [number, number],
    snap = true,
): number {
    let ticks = pixelToTicks(x - TIMELINE_LEFT_OFFSET, zoom);
    if (snap) {
        const tickStep = getMarkerTickStep(zoom, timeSignature);
        ticks = Math.round(ticks / tickStep) * tickStep;
    }
    return ticks;
}

/**
 * Converts ticks to the beat number based on the time signature.
 *
 * @param ticks - Input absolute ticks.
 * @param timeSignature - Time signature tuple.
 * @returns Converted beats.
 */
export function ticksToBeat(ticks: number, timeSignature: [number, number]): number {
    // PPQ is how many ticks there are in a beat in 4/4 time.
    // We convert this to uniary time and divide by the denominator of time signature
    // to make a beat worth less ticks in higher time signatures.
    return ticks / ((Tone.getTransport().PPQ * 4) / timeSignature[1]);
}

/**
 * Converts the beat number to ticks based on the time signature.
 *
 * @param beats - Input beats.
 * @param timeSignature - Time signature tuple.
 * @returns Converted ticks.
 */
export function beatToTicks(beats: number, timeSignature: [number, number]): number {
    return beats * ((Tone.getTransport().PPQ * 4) / timeSignature[1]);
}

/**
 * Convert ticks to a its time representation in minutes and seconds.
 *
 * @param ticks - Ticks to convert.
 * @param bpm - Current beats per minute.
 * @returns String representation of the time in mm:ss format.
 */
export function formatTicksToTime(ticks: number, bpm: number): string {
    const minutes = ticks / Tone.getTransport().PPQ / bpm;
    const seconds = (minutes * 60) % 60;
    let secondsStr = seconds.toFixed(3);
    if (seconds.toString().length == 1) {
        secondsStr = "0" + secondsStr;
    }
    return `${Math.floor(minutes)}:${secondsStr}`;
}

/**
 * Convert ticks to representation of bars and beats.
 *
 * @param ticks - Ticks to convert.
 * @param timeSignature - Time signature tuple.
 * @returns String representation of the bars and beats in bars.beats format.
 */
export function formatTicksToBarsBeats(ticks: number, timeSignature: [number, number]): string {
    const beat = Math.floor(ticksToBeat(ticks, timeSignature));
    const bar = Math.floor(beat / timeSignature[0]);
    return `${bar}.${beat % timeSignature[0]}`;
}

/**
 * Gets the tick step that markers should be seperated by based on the zoom level.
 * The tick step ensures that the number of beats will always be a power of two and
 * the spacing between markers shouldn't be too close together.
 *
 * @returns The beat step.
 */
export function getMarkerTickStep(
    zoom: TimelineZoom,
    timeSignature: [number, number],
    absoluteMinBeatStep = 0.25,
): number {
    // The minimum spacing required for a marker to show up
    const MIN_MARKER_SPACING = parseFloat(getComputedStyle(document.body).fontSize) / 1.5;

    // Find the beat increment that is the next power of two from the smallest allowable beat increment
    const beatsPerPixel = ticksToBeat(zoom.ticksPerPixel, timeSignature);
    const minBeatStep = Math.max(beatsPerPixel * MIN_MARKER_SPACING, absoluteMinBeatStep);
    const beatStep = Math.pow(2, Math.ceil(Math.log(minBeatStep) / Math.log(2))) || 1;
    return beatToTicks(beatStep, timeSignature);
}
