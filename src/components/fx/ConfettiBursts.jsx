import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function ConfettiBursts({ burstKey }) {
    const { width, height } = useWindowSize();
    const [run, setRun] = useState(true);

    useEffect(() => {
        setRun(true);
        const t = setTimeout(() => setRun(false), 2600);
        return () => clearTimeout(t);
    }, [burstKey]);

    return (
        <Confetti
            width={width}
            height={height}
            run={run}
            recycle={false}
            numberOfPieces={360}
            gravity={0.16}
            wind={0.03}
            colors={["#a855f7", "#60a5fa", "#22d3ee", "#f472b6", "#fde047", "#34d399"]}
            opacity={0.95}
        />
    );
}
