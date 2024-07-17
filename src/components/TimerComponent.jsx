import { useState, useEffect } from "react";
import { getLatency, sendRequest, onEvent } from "../App.jsx"

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


export function PeriodClock({ boutUuid  }) {
  const [periodClock, setPeriodClock] = useState(null);
  const [lap, setLap] = useState(0);

  // Get the initial Period clock state
  useEffect(() => {
    let ignore = false;
    sendRequest("period", { uri: { bout: boutUuid } })
      .then((newPeriod) => {
        if (!ignore) {
          // TODO: Handle halftime and pre-game timers
          newPeriod.clock.timestamp = Date.now();
          if (newPeriod.clock.running) {
            newPeriod.clock.elapsed += getLatency();
          }
          setPeriodClock(newPeriod.clock);
        }
      });

    return () => ignore = true;
  }, [boutUuid]);

  // Subscribe to any changes of the Period clock
  useEffect(() => {
    const unsubscribe = onEvent("period", (newPeriod) => {
      // TODO: Handle halftime and pre-game timers
      newPeriod.clock.timestamp = Date.now();
      if (newPeriod.clock.running) {
        newPeriod.clock.elapsed += getLatency();
      }
      setPeriodClock(newPeriod.clock);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!periodClock || !periodClock.running) {
      return;  // Don't update the Lap time if the clock isn't running
    }

    // Setup an interval to track the game clock
    const intervalId = setInterval(() => {
      if (lap + periodClock.elapsed >= periodClock.alarm) {
        clearInterval(intervalId);
      } else {
        setLap(Date.now() - periodClock.timestamp);
      }
    }, 50);

    return () => {
      clearInterval(intervalId);
      setLap(0);  // Reset the currently running Lap
    };
  }, [periodClock]);

  const totalElapsed = lap + periodClock?.elapsed;

  // Get the number of milliseconds remaining on the Period clock
  const clockMilliseconds = periodClock?.alarm > periodClock?.elapsed
    ? periodClock?.alarm - totalElapsed
    : 0;

  return (
    <span className={clockMilliseconds ? "timerComplete" : ""}>
      {formatTimeString(clockMilliseconds)}
    </span>
  );
}

export function GameClock({ boutUuid }) {
  const [jamClock, setJamClock] = useState(null);
  const [timeoutClock, setTimeoutClock] = useState(null);
  const [lap, setLap] = useState(0);

  // Get the initial Jam and Timeout state
  useEffect(() => {
    // Send requests to the get Jam clock and current Timeout
    const getJamClock = sendRequest("jam", { uri: { bout: boutUuid } })
      .then((newJam) => { return { ...newJam.clock, timestamp: Date.now() } });
    const getTimeout = sendRequest("boutTimeout", { uri: { bout: boutUuid } })
      .then((newTimeout) => {
        if (newTimeout.current === null) {
          return null;
        }
        return { ...newTimeout.current, timestamp: Date.now() }
      });

    // Update the component state at the same time to avoid clock jitter
    let ignore = false;  // Avoid race conditions
    Promise.all([getJamClock, getTimeout]).then(([newJamClock, newTimeout]) => {
      if (!ignore) {
        setJamClock(newJamClock);
        setTimeoutClock(newTimeout);
      }
    });
    return () => ignore = true;
  }, [boutUuid]);

  // Subscribe to any changes to the Jam and Timeout state
  useEffect(() => {
    const unsubscribeJam = onEvent("jam", (newJam) => {
      if (!newJam.clock.running) {
        return;  // Only use clocks that are running
      }
      newJam.clock.timestamp = Date.now();
      setJamClock(newJam.clock);
    });
    const unsubscribeTimeout = onEvent("boutTimeout", (newTimeout) => {
      if (newTimeout.current !== null) {
        newTimeout.current.timestamp = Date.now();
      }
      setTimeoutClock(newTimeout.current);
    });

    return () => {
      unsubscribeJam();
      unsubscribeTimeout()
    };
  }, [])

  useEffect(() => {
    // Get the active clock - return early if there is no active clock
    const gameClock = timeoutClock?.running ? timeoutClock : jamClock;
    if (!gameClock || !gameClock.running) {
      return;
    }

    // Calculate the clock's expiry to know when to stop the tracking interval
    const stopTime = gameClock.timestamp + gameClock.alarm - gameClock.elapsed;

    // Setup an interval to track the game clock
    const intervalId = setInterval(() => {
      const NOW = Date.now();
      if (gameClock.alarm && gameClock !== timeoutClock && NOW >= stopTime) {
        clearInterval(intervalId);
      } else {
        setLap(NOW - gameClock.timestamp);
      }
    }, 50);

    return () => {
      clearInterval(intervalId);
      setLap(0);  // Reset the current Lap
    }
  }, [jamClock, timeoutClock]);

  // Determine which clock to use and get the elapsed milliseconds
  const gameClock = timeoutClock?.running ? timeoutClock : jamClock;
  let clockMilliseconds = gameClock?.elapsed + lap;

  // Make the clock count down, if applicable
  if (gameClock !== timeoutClock && gameClock.alarm !== null) {
    clockMilliseconds = gameClock.alarm > clockMilliseconds
      ? gameClock.alarm - clockMilliseconds
      : 0;
  }

  return (
    <span className={clockMilliseconds ? "timerComplete" : ""}>
      {formatTimeString(clockMilliseconds, (gameClock !== timeoutClock))}
    </span>
  );
}
