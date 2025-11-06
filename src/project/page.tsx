import { StrictMode, useEffect, useState } from "react";
import { TIMELINE_LEFT_OFFSET, wheelNewZoom, xPosToTicks, type TimelineZoom } from "@/lib/timing";
import { NavBar } from "@/components/NavBar";
import { apiGetProject, apiSaveProject } from "@/lib/localstorage";
import { TimelineLines, TimelineRuler } from "@/components/editor/TimelineRuler";
import { TrackListView } from "@/components/editor/TrackListView";
import { PlayControls } from "@/components/editor/PlayControls";
import type { Project } from "@/lib/project";
import { Playhead } from "@/components/editor/Playhead";
import { ProjectTimeControls } from "@/components/editor/ProjectTimeControls";
import { usePromiseLock } from "@/lib/utils";
import { EditableText } from "@/components/EditableText";
import { Panel } from "@/components/Panel";
import { PianoRoll, PianoRollContext, type PianoRollOpenFor } from "@/components/editor/PianoRoll";
import { createRoot } from "react-dom/client";
import { App } from "../App";
import { Loader } from "@/components/Loader";

interface Props {
    project: Project;
}

const ProjectEditor: React.FC<Props> = (props) => {
    const [project, setProject] = useState<Project>(props.project);
    const [savingText, setSavingText] = useState("");
    const [zoom, setZoom] = useState<TimelineZoom>({ startTick: 0, ticksPerPixel: 10 });
    const [playing, setPlaying] = useState(false);
    const [playheadTick, setPlayheadTick] = useState(0);
    const [openFor, setOpenFor] = useState<PianoRollOpenFor | null>(null);

    const saveProject = usePromiseLock(async (project: Project) => {
        setSavingText("Saving...");
        try {
            await apiSaveProject(project);
            setSavingText("Saved!");
        } catch (_) {
            setSavingText("Failed to save :(");
        }
    });

    async function updateProject(project: Project) {
        setPlaying(false);
        setProject(project);
        saveProject(project);
    }

    useEffect(() => {
        const onWheel = (e: WheelEvent) => setZoom(wheelNewZoom(e, zoom));
        window.addEventListener("wheel", onWheel, { passive: false });
        return () => window.removeEventListener("wheel", onWheel);
    }, [zoom]);

    function onClickSetPlayhead(e: React.MouseEvent, zoom: TimelineZoom) {
        if (e.clientX >= TIMELINE_LEFT_OFFSET) {
            setPlaying(false);
            setPlayheadTick(xPosToTicks(e.clientX, zoom, project.time_signature, !e.ctrlKey));
        }
    }

    return (
        <div onClick={(e) => onClickSetPlayhead(e, zoom)}>
            <title>{`${project.name} - Musixer`}</title>
            <header className="sticky top-0 z-20 bg-neutral-900 border-b">
                <NavBar>
                    <span className="text-sm text-neutral-400 grow">{savingText}</span>
                    <div className="w-64 text-right">
                        <EditableText
                            text={project.name}
                            onFinish={(name) => updateProject({ ...project, name })}
                        />
                    </div>
                    <div className="text-neutral-400 text-sm w-1/2">
                        <EditableText
                            text={project.description}
                            onFinish={(description) => updateProject({ ...project, description })}
                        />
                    </div>
                </NavBar>
                <Playhead ticks={playheadTick} zoom={zoom} />
                <TimelineRuler project={project} zoom={zoom} />
            </header>
            <TimelineLines {...{ zoom, project }} />
            <PianoRollContext.Provider value={{ setOpenFor, openFor }}>
                <TrackListView project={project} setProject={updateProject} zoom={zoom} />
            </PianoRollContext.Provider>
            <div className="fixed bottom-0 w-full z-20">
                <Panel title="Piano Roll" open={openFor != null} onClose={() => setOpenFor(null)}>
                    <PianoRoll
                        {...openFor}
                        {...{ playheadTick, setProject, project, onClickSetPlayhead }}
                    />
                </Panel>
                <footer className="h-10 bg-neutral-800 border-t flex justify-between items-center px-4 relative z-30">
                    <PlayControls
                        {...{ playing, setPlaying, project, playheadTick, setPlayheadTick }}
                    />
                    <ProjectTimeControls setProject={updateProject} project={project} />
                </footer>
            </div>
        </div>
    );
};

createRoot(document.body).render(
    <StrictMode>
        <App>
            <Loader
                load={() => apiGetProject(new URLSearchParams(location.search).get("id") || "")}
                render={(project) => <ProjectEditor project={project} />}
            />
        </App>
    </StrictMode>,
);
