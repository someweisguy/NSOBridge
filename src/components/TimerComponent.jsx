import { useState, useEffect, useRef } from "react";
import { getLatency, sendRequest, onEvent } from "../App.jsx"

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


export function PeriodClock({ boutId = 0 }) {
  const [periodClock, setPeriodClock] = useState(NULL_TIMER);
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
          // TODO: use getLatency()
          setPeriodClock(newPeriod.clock);
        }
      });

    const unsubscribe = onEvent("period", (newPeriod) => {
      if (newPeriod.clock.running) {
        newPeriod.clock.elapsed += getLatency();
      }
      setPeriodClock(newPeriod.clock);
    });

    return () => {
      ignore = true;
      unsubscribe();
    }
  }, [boutId]);

  useEffect(() => {
    if (!periodClock.running) {
      return;
    }
    const start = Date.now();
    const intervalId = setInterval(() => {
      if (lap + periodClock.elapsed >= periodClock.alarm) {
        clearInterval(intervalId);
      } else {
        setLap(Date.now() - start);
      }
    }, 50);
    return () => {
      clearInterval(intervalId);
      setLap(0);  // Reset the currently running Lap
    };
  }, [periodClock]);

  const totalElapsed = lap + periodClock.elapsed;

  // Get the number of milliseconds remaining on the Period clock
  const clockMilliseconds = periodClock.alarm > periodClock.elapsed
    ? periodClock.alarm - totalElapsed
    : 0;

  return (
    <span className={clockMilliseconds ? "timerComplete" : ""}>
      {formatTimeString(clockMilliseconds)}
    </span>
  );
}

export function GameClock({ boutId = 0 }) {
  const [jamClock, setJamClock] = useState(null);
  const [timeoutClock, setTimeoutClock] = useState(null);
  const [lap, setLap] = useState(0);

  // Subscribe to any changes to the Jam and Timeout state
  useEffect(() => {
    const unsubscribeJam = onEvent("jam", (newJam) => {
      const clock = newJam.countdown.running ? newJam.countdown : newJam.clock;
      if (!clock.running) {
        return;
      }
      clock.timestamp = Date.now();
      setJamClock(clock);
    });

    const unsubscribeTimeout = onEvent("clockStoppage", (newTimeout) => {
      const clock = newTimeout.activeStoppage;
      if (clock !== null) {
        clock.timestamp = Date.now();
      }
      setTimeoutClock(clock);
    });

    return () => {
      unsubscribeJam();
      unsubscribeTimeout();
    };
  }, []);

  // Get the initial Jam and Timeout state
  useEffect(() => {
    if (boutId == null) {
      return;
    }

    let ignore = false;  // Avoid race conditions
    sendRequest("jam", { id: null })
      .then((newJam) => {
        if (!ignore) {
          const clock = newJam.countdown.running ? newJam.countdown : newJam.clock;
          clock.timestamp = Date.now();
          setJamClock(clock);
        }
      });
    sendRequest("clockStoppage", { id: boutId })
      .then((newTimeout) => {
        if (!ignore) {
          const clock = newTimeout.activeStoppage;
          if (clock !== null) {
            clock.timestamp = Date.now();
          }
          setTimeoutClock(clock);
        }
      });

    return () => ignore = true;
  }, [boutId]);

  useEffect(() => {
    // Get the active clock and calculate its expiry
    const clock = timeoutClock && timeoutClock.running ? timeoutClock : jamClock;
    if (!clock || !clock.running) {
      return;
    }
    const stopTime = clock.timestamp + clock.alarm - clock.elapsed;

    const intervalId = setInterval(() => {
      if (clock.alarm && clock !== timeoutClock && Date.now() >= stopTime) {
        // Timeout clocks should not expire
        clearInterval(intervalId);
      } else {
        setLap(Date.now() - clock.timestamp);
      }
    }, 50);

    return () => {
      clearInterval(intervalId);
      setLap(0);
    }
  }, [jamClock, timeoutClock]);

  // Get the number of milliseconds remaining on the Period clock
  const clock = timeoutClock && timeoutClock.running ? timeoutClock : jamClock;
  let clockMilliseconds = clock?.elapsed + lap;
  if (clock !== timeoutClock && clock.alarm !== null) {
    clockMilliseconds = clock.alarm > clockMilliseconds
      ? clock.alarm - clockMilliseconds
      : 0;
  }

  return (
    <span className={clockMilliseconds ? "timerComplete" : ""}>
      {formatTimeString(clockMilliseconds, (clock !== timeoutClock))}
    </span>
  );
}
