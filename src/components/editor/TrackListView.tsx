import { type Project } from "../../lib/project";
import { TrackControls } from "./TrackControls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { TrackTimeline } from "./TrackTimeline";
import { makeArraySetter } from "../../lib/utils";
import { TIMELINE_LEFT_OFFSET, type TimelineZoom } from "../../lib/timing";

interface Props {
    project: Project;
    setProject: (project: Project) => void;
    zoom: TimelineZoom;
}

export const TrackListView: React.FC<Props> = ({ project, setProject, zoom }) => {
    const setTrack = makeArraySetter(project.tracks, (tracks) =>
        setProject({ ...project, tracks }),
    );

    return (
        <section>
            {project.tracks.map((track, i) => (
                <div key={i} className="flex border-b">
                    <div
                        className="flex z-10 bg-neutral-900"
                        style={{ width: `${TIMELINE_LEFT_OFFSET}px` }}
                    >
                        <div className="border-r grid place-items-center text-neutral-400 w-8 flex-none">
                            {i}
                        </div>
                        <TrackControls track={track} setTrack={(track) => setTrack(i, track)} />
                    </div>
                    <TrackTimeline trackIndex={i} {...{ track, zoom, project, setTrack }} />
                </div>
            ))}
            <button
                className="text-neutral-400 btn-with-bg text-sm border-b"
                onClick={() =>
                    setTrack(null, { parts: [], name: "New track", instrumentName: "piano" })
                }
                style={{ width: `${TIMELINE_LEFT_OFFSET}px` }}
            >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add New Track
            </button>
        </section>
    );
};
