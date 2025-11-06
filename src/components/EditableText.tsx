import { useEffect, useState } from "react";

interface Props {
    onFinish: (newText: string) => void;
    forceEdit?: boolean;
    text: string | number;
}

export const EditableText: React.FC<Props> = ({ text, forceEdit, onFinish }) => {
    const [editing, setEditing] = useState(false);

    function onChange(input: HTMLInputElement) {
        onFinish(input.value);
        setEditing(false);
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key == "Enter") {
            onChange(e.currentTarget);
        }
    }

    useEffect(() => {
        setEditing(Boolean(forceEdit));
    }, [forceEdit]);

    if (editing) {
        return (
            <input
                autoFocus
                onFocus={(e) => e.target.select()}
                onKeyDown={onKeyDown}
                onBlur={(e) => onChange(e.currentTarget)}
                defaultValue={text}
            />
        );
    }

    return (
        <p
            className="border py-1 px-2 border-transparent hover:border-neutral-500 w-full text-nowrap overflow-hidden"
            onClick={(e) => e.detail == 2 && setEditing(true)}
            title="Double click to edit"
        >
            {text}
        </p>
    );
};
