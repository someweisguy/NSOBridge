import { useState, useRef, useCallback, useEffect } from "react";
import { useSocketGetter, getLatency, sendRequest, onEvent } from "../App.jsx"

const NULL_TIMER = {
  alarm: 0,
  elapsed: 0,
  running: false
};

function formatTimeString(millisRemaining, showMillis = true) {
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
    } else if (showMillis) {
      let deciseconds = Math.floor((millisRemaining % 1000) / 100);
      timeString += seconds + "." + deciseconds
    }
  } else {
    timeString = "0.0";
  }
  return timeString;
}


export function PeriodClock({ boutId = 0 }) {
  const [state, setState] = useState(NULL_TIMER);
  const [lap, setLap] = useState(0);

  useEffect(() => {
    if (boutId === null) {
      return;
    }
    let ignore = false;
    sendRequest("period", { id: null })
      .then((newPeriod) => {
        if (!ignore) {
          // TODO: Handle halftime and pre-game timers
          setState(newPeriod.clock);
        }
      });

    const unsubscribe = onEvent("period", (newPeriod) => {
      setState(newPeriod.clock);
    });

    return () => {
      ignore = true;
      unsubscribe();
    }
  }, [boutId]);

  useEffect(() => {
    if (!state.running) {
      return;
    }
    const start = Date.now();
    const intervalId = setInterval(() => {
      if (lap + state.elapsed >= state.alarm) {
        clearInterval(intervalId);
      } else {
        setLap(Date.now() - start);
      }
    }, 50);
    return () => {
      clearInterval(intervalId);
      setLap(0);  // Reset the currently running Lap
    };
  }, [state]);

  const totalElapsed = lap + state.elapsed;

  // Get the number of milliseconds remaining on the Period clock
  const clockMilliseconds = state.alarm > state.elapsed
    ? state.alarm - totalElapsed
    : 0;

  return (
    <span className={clockMilliseconds ? "timerComplete" : ""}>
      {formatTimeString(clockMilliseconds)}
    </span>
  );
}

export function GameClock({ boutId = 0 }) {
  const [state, setState] = useState(NULL_TIMER);
  const [lap, setLap] = useState(0);

  // TODO: allow the lineup timer to count up

  useEffect(() => {
    if (boutId === null) {
      return;
    }
    let ignore = false;
    sendRequest("jam", { id: null })
      .then((newJam) => {
        if (!ignore) {
          // The initial state must always be set
          if (newJam.countdown.running) {
            setState(newJam.countdown);
          } else {
            setState(newJam.clock);
          }
        }
      });

    const unsubscribe = onEvent("jam", (newJam) => {
      // Only update the state if a clock is running
      if (newJam.countdown.running) {
        setState(newJam.countdown);
      } else if (newJam.clock.running) {
        setState(newJam.clock);
      }
    });

    return () => {
      ignore = true;
      unsubscribe();
    }
  }, [boutId]);

  useEffect(() => {
    if (!state.running) {
      return;
    }
    const start = Date.now();
    const intervalId = setInterval(() => {
      if (lap + state.elapsed >= state.alarm) {
        clearInterval(intervalId);
      } else {
        setLap(Date.now() - start);
      }
    }, 50);
    return () => {
      clearInterval(intervalId);
      setLap(0);  // Reset the currently running Lap
    };
  }, [state]);

  const totalElapsed = lap + state.elapsed;

  // Get the number of milliseconds remaining on the Period clock
  const clockMilliseconds = state.alarm > state.elapsed
    ? state.alarm - totalElapsed
    : 0;

  return (
    <span className={clockMilliseconds ? "timerComplete" : ""}>
      {formatTimeString(clockMilliseconds)}
    </span>
  );
}

