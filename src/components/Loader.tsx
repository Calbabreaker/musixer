import { useEffect, useState } from "react";

interface Props<T> {
    load: () => Promise<T>;
    render: (data: T, setData: (data: T) => void) => React.ReactElement;
}

export function Loader<T>({ load, render }: Props<T>): React.ReactElement {
    const [data, setData] = useState<any>();
    const [error, setError] = useState("");

    async function loadData() {
        try {
            setData((await load()) ?? {});
        } catch (err) {
            setError("Failed to load!");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    if (!data) {
        return <p>Loading</p>;
    }
    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return render(data, setData);
}
