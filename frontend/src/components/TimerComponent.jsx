import { useState, useEffect } from "react";
import { getLatency, } from "../client.js"

const PERIOD = "period";
const INTERMISSION = "intermission";
const LINEUP = "lineup";
const JAM = "jam";
const TIMEOUT = "timeout";
const GAME = "game";
const ACTION = "action";


export function formatTimeString(millisRemaining, showMillis = true) {
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
    } else if (millisRemaining < 10000) {
      timeString += seconds
      if (showMillis) {
        let deciseconds = Math.floor((millisRemaining % 1000) / 100);
        timeString += "." + deciseconds;
      }
    }
  } else {
    timeString = "0";
    if (showMillis) {
      timeString += ".0";
    }
  }
  return timeString;
}

export function useClock(bout, virtualType, showRemaining = true, stopAtZero = true) {
  const [lap, setLap] = useState(0);
  const [clock, setClock] = useState(null);
  const [type, setType] = useState(null);

  // Determine which clock to use
  useEffect(() => {
    if (bout == null) {
      return;
    }

    // Translate virtual clock types and set the clock
    if (virtualType == GAME) {
      if (bout.clocks.intermission.running) {
        setClock(bout.clocks.intermission);
        virtualType = INTERMISSION;
      } else {
        setClock(bout.clocks.period);
        virtualType = PERIOD;
      }
    } else if (virtualType == ACTION) {
      if (bout.clocks.timeout.running) {
        setClock(bout.clocks.timeout);
        virtualType = TIMEOUT;
      } else if (bout.clocks.lineup.running) {
        setClock(bout.clocks.lineup);
        virtualType = LINEUP;
      } else {
        setClock(bout.clocks.jam);
        virtualType = JAM;
      }
    }
    const newClock = bout.clocks[virtualType];
    setClock(newClock);

    // Set the initial lap for the new clock and update the type
    if (stopAtZero && newClock.alarm != null
      && newClock.elapsed >= newClock.alarm) {
      setLap(newClock.alarm - newClock.elapsed);
    } else {
      setLap(0);
    }
    if (virtualType != type) {
      setType(virtualType);
    }

  }, [bout, virtualType, stopAtZero]);

  // Update the clock if it is running
  useEffect(() => {
    if (clock == null || !clock.running) {
      return;
    }

    const lastUpdate = Date.now() - getLatency();

    const intervalId = setInterval(() => {
      const newLap = Date.now() - lastUpdate;
      if (stopAtZero && clock.alarm != null
        && clock.elapsed + newLap >= clock.alarm) {
        clearInterval(intervalId);
        setLap(clock.alarm - clock.elapsed);
      } else {
        setLap(newLap);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [clock, stopAtZero]);

  // Render the number of milliseconds elapsed/remaining
  let milliseconds = 0;
  if (clock != null) {
    milliseconds = clock.elapsed;
    if (clock.running) {
      milliseconds += lap;
    }
    if (showRemaining && clock.alarm != null) {
      milliseconds = clock.alarm - milliseconds;
    }
  }

  return { milliseconds, type };
}
