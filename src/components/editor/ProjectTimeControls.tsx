import type { Project } from "../../lib/project";
import { makeArraySetter } from "../../lib/utils";
import { EditableText } from "../EditableText";

interface Props {
    project: Project;
    setProject: (project: Project) => void;
}

export const ProjectTimeControls: React.FC<Props> = ({ project, setProject }) => {
    const setSignaturePart = makeArraySetter(project.time_signature, (array) =>
        setProject({ ...project, time_signature: array as [number, number] }),
    );

    return (
        <div className="flex items-center">
            <span>BPM: </span>
            <div className="w-12">
                <EditableText
                    text={project.bpm}
                    onFinish={(text) => setProject({ ...project, bpm: Number(text) || 120 })}
                />
            </div>

            <span className="mr-1">Time:</span>
            <div className="w-16 flex items-center">
                <EditableText
                    text={project.time_signature[0]}
                    onFinish={(text) => setSignaturePart(0, Number(text) || 4)}
                />
                <span>/</span>
                <EditableText
                    text={project.time_signature[1]}
                    onFinish={(text) => setSignaturePart(1, Number(text) || 4)}
                />
            </div>
        </div>
    );
};
