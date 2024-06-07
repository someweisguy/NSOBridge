import { useState, useRef, useCallback, useEffect } from "react";
import { useInterface, getLatency } from "../App.js"

export default function TimerComponent({ }) {
    const [timerElapsed, setTimerElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const accumulatedMilliseconds = useRef(0);
    const runningSince = useRef(Date.now());

    useEffect(() => {
        if (isRunning) {
            const intervalId = setInterval(() => {
                setTimerElapsed(Date.now() - runningSince.current + accumulatedMilliseconds.current)
            }, 50);
            return () => clearInterval(intervalId);
        }
    }, [isRunning]);


    function cb({ alarm, elapsed, running }) {
        console.log(elapsed)
        runningSince.current = Date.now() - getLatency();
        accumulatedMilliseconds.current = elapsed;
        setTimerElapsed(elapsed + (running ? getLatency() : 0));
        setIsRunning(running);
    }
    useInterface("getJamTimer", cb);


    return (
        <h1>{((timerElapsed + accumulatedMilliseconds.current) / 1000.0).toFixed(1)}</h1>
    );
}