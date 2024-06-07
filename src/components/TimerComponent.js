import { useState, useRef, useCallback, useEffect } from "react";
import { useInterface, getLatency } from "../App.js"

function formatTimeString(millisRemaining) {
    let timeString = "";
    if (millisRemaining > 0) {
        let hours = Math.floor((millisRemaining / (1000 * 60 * 60)) % 24);
        if (hours > 0) {
            // Format the hours string
            timeString += hours + ":";
        }
        let minutes = Math.floor((millisRemaining / (1000 * 60)) % 60);
        if (minutes > 0) {
            // Format the minutes string with an optional leading zero
            if (hours > 0) {
                minutes = minutes < 10 ? "0" + minutes : minutes.toString();
            }
            timeString += minutes + ":";
        }
        // Format the seconds string with an optional leading zero
        let seconds = Math.floor((millisRemaining / 1000) % 60);
        if (millisRemaining >= 10000) {
            seconds = seconds < 10 ? "0" + seconds : seconds.toString();
            timeString += seconds;
        } else {
            let deciseconds = Math.floor((millisRemaining % 1000) / 100);
            timeString += seconds + "." + deciseconds
        }
    } else {
        timeString = "0.0";
    }
    return timeString;
}


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


    let timerMillis = 0;
    if (maxRunTime !== null) {
        // Format the time string for a count-down timer
        timerMillis = maxRunTime - (runTime + accumulated.current);
        if (isRunning && timerMillis <= 0) {
            // Stop interval to reduce CPU load
            setIsRunning(false);
        }
    } else {
        timerMillis = runTime + accumulated.current;
    }

    const timeString = formatTimeString(timerMillis);

    return (
        <h1>{timeString}</h1>
    );
}