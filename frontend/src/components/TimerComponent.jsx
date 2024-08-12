import { useState, useEffect } from "react";
import { getLatency, } from "../client.js"

export const PERIOD_CLOCK = "period";
export const INTERMISSION_CLOCK = "intermission";
export const LINEUP_CLOCK = "lineup";
export const JAM_CLOCK = "jam";
export const TIMEOUT_CLOCK = "timeout";
export const GAME_CLOCK = "game";

export function formatTimeString(millisRemaining, showMillis = true) {
  // FIXME: show negative numbers
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

export function useClock(bout, virtualType, stopAtZero = true) {
  const [lap, setLap] = useState(0);
  const [clock, setClock] = useState(null);
  const [type, setType] = useState(null);

  // Determine which clock to use
  useEffect(() => {
    if (bout == null) {
      return;
    }

    // Translate virtual clock types
    let concreteType = virtualType;
    if (concreteType == GAME_CLOCK) {
      if (bout.clocks.timeout.running) {
        concreteType = TIMEOUT_CLOCK;
      } else if (bout.clocks.lineup.running) {
        concreteType = LINEUP_CLOCK;
      } else {
        concreteType = JAM_CLOCK;
      }
    }
    if (!Object.hasOwn(bout.clocks, concreteType)) {
      throw Error("unknown clock type");
    }

    // Set the new clock and set the initial lap
    const newClock = bout.clocks[concreteType];
    setClock(newClock);
    setLap(0);

    // Update the clock type
    if (concreteType != type) {
      setType(concreteType);
    }
  }, [bout, virtualType]);

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
      }
      setLap(newLap);
    }, 50);

    return () => clearInterval(intervalId);
  }, [clock, stopAtZero]);

  // Render the number of milliseconds elapsed/remaining
  let elapsed = 0;
  let remaining = null;
  if (clock != null) {
    elapsed = clock.elapsed;
    if (clock.running) {
      elapsed += lap;
    }
    if (clock.alarm != null) {
      remaining = clock.alarm - elapsed;
      if (stopAtZero && remaining < 0) {
        remaining = 0;
      }
    }
  }

  return { elapsed, remaining, alarm: clock?.alarm, type };
}
