import { useState, useRef, useCallback, useEffect } from "react";
import { useInterface, getLatency } from "../App.js"

export default function TimerComponent({}) {
    const [timerElapsed, setTimerElapsed] = useState(0);
    const runningSince = useRef(null);
    const intervalId = useRef(null);

    const timerCallback = useCallback(({alarm, elapsed, running}) => {
        if (intervalId.current !== null) {
            clearInterval(intervalId.current);
            intervalId.current = null;
        }
        if (running) {
            runningSince.current = Date.now() - getLatency();
            intervalId.current = setInterval(() => {
                setTimerElapsed(Date.now() - runningSince.current + elapsed);
            }, 50);
        }
        setTimerElapsed(elapsed + getLatency());
    }, [timerElapsed]);
    useInterface("getJamTimer", timerCallback);


    return (
        <h1>{timerElapsed}</h1>
    );
}