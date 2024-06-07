import { useState, useRef, useCallback, useEffect } from "react";
import { useInterface, getLatency } from "../App.js"

export default function TimerComponent({ }) {
    const [runTime, setRunTime] = useState(0);
    const [maxRunTime, setMaxRunTime] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const accumulated = useRef(0);
    
    function timerCallback({ alarm, elapsed, running }) {
        setRunTime(elapsed + (running ? getLatency() : 0));
        accumulated.current = elapsed;
        setMaxRunTime(alarm);
        setIsRunning(running);
    }
    useInterface("getJamTimer", timerCallback);

    useEffect(() => {
        if (isRunning) {
            const runningSince = Date.now() - getLatency();
            const intervalId = setInterval(() => {
                setRunTime(Date.now() - runningSince)
            }, 50);
            return () => clearInterval(intervalId);
        }
    }, [isRunning]);


    let timerValue = maxRunTime - (runTime + accumulated.current);
    if (timerValue < 0) {
        timerValue = 0;
    } else if (timerValue < 10000) {
        timerValue = (timerValue / 1000).toFixed(1);
    } else {
        timerValue = (timerValue / 1000).toFixed(0);
    }

    return (
        <h1>{timerValue}</h1>
    );
}