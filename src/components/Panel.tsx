import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Panel: React.FC<Props> = ({ open, onClose, children, title }) => {
    if (!open) {
        return null;
    }

    return (
        <div className="w-full bg-neutral-800">
            <div className="border-b flex items-center p-2 justify-between">
                <FontAwesomeIcon icon={faClose} className="btn-icon close" onClick={onClose} />
                <div>{title}</div>
                <div />
            </div>
            {children}
        </div>
    );
};
