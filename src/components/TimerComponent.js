import { useState, useRef, useCallback, useEffect } from "react";
import { useInterface, getLatency } from "../App.js"

export default function TimerComponent({ }) {
    const [timerElapsed, setTimerElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const runningSince = useRef(Date.now());
    const intervalId = useRef(null);

    // const timerCallback = useCallback(({alarm, elapsed, running}) => {
    //     if (intervalId.current !== null) {
    //         clearInterval(intervalId.current);
    //         intervalId.current = null;
    //     }
    //     if (running) {
    //         runningSince.current = Date.now() - getLatency();
    //         intervalId.current = setInterval(() => {
    //             const elapsedSinceLast = Date.now() - runningSince.current
    //             setTimerElapsed(elapsedSinceLast + elapsed);
    //         }, 50);
    //     }
    //     setTimerElapsed(elapsed + getLatency());
    // }, [timerElapsed]);

    useEffect(() => {
        if (isRunning) {
            const intervalId = setInterval(() => {
                setTimerElapsed(Date.now() - runningSince.current)
            }, 50);
            return () => clearInterval(intervalId);
        }
    }, [isRunning]);


    function cb({ alarm, elapsed, running }) {
        runningSince.current = Date.now() - getLatency();
        setTimerElapsed(elapsed);
        setIsRunning(running);
    }
    useInterface("getJamTimer", cb);


    return (
        <h1>{timerElapsed}</h1>
    );
}