import { useState, useRef, useCallback, useEffect } from "react";
import { useInterface, getLatency, sendRequest } from "../App.js"

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


export default function TimerComponent({ timerType, direction = "down" }) {
  const [currentType, setCurrentType] = useState(timerType);
  const [runTime, setRunTime] = useState(0);
  const [maxRunTime, setMaxRunTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const accumulated = useRef(0);

  function timerCallback({ type, alarm, elapsed, running }) {
    if (timerType === "action") {
      if (!running || !(["jam", "lineup", "timeout"].includes(type))) {
        return;  // Not the running action timer
      }
      setCurrentType(type);
    } else if (timerType !== type) {
      return;  // Incorrect timer type
    }

    accumulated.current = elapsed;
    setRunTime(running ? getLatency() : 0);
    setMaxRunTime(alarm);
    setIsRunning(running);
  }
  useInterface("timer", timerCallback, { timerType: timerType });

  useEffect(() => {
    if (isRunning) {
      const runningSince = Date.now() - getLatency();
      const intervalId = setInterval(() => {
        setRunTime(Date.now() - runningSince)
      }, 50);
      return () => clearInterval(intervalId);
    }
  }, [isRunning, currentType]);

  let timerMillis = 0;
  let alarmFired = false;
  if (maxRunTime !== null && direction === "down") {
    // Format the time string for a count-down timer
    timerMillis = maxRunTime - (runTime + accumulated.current);
    if (isRunning && timerMillis <= 0) {
      // Stop interval to reduce CPU load
      setIsRunning(false);
      alarmFired = true;
    }
  } else {
    timerMillis = runTime + accumulated.current;
  }

  // Format the time string
  const timeString = formatTimeString(timerMillis);

  return (
    <span className={alarmFired ? "timerComplete" : ""}>
      {timeString}
    </span>
  );
}
