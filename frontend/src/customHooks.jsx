import useGenericStore, { getLatency } from "./client";
import { useState, useEffect } from "react";

// Clock constants
export const PERIOD_CLOCK = "period";
export const INTERMISSION_CLOCK = "intermission";
export const LINEUP_CLOCK = "lineup";
export const JAM_CLOCK = "jam";
export const TIMEOUT_CLOCK = "timeout";
export const GAME_CLOCK = "game"
export const ACTION_CLOCK = "action";


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
      if (bout.clocks.intermission.isRunning) {
        concreteType = INTERMISSION_CLOCK;
      } else {
        concreteType = PERIOD_CLOCK;
      }
    } else if (concreteType == ACTION_CLOCK) {
      if (bout.clocks.timeout.isRunning) {
        concreteType = TIMEOUT_CLOCK;
      } else if (bout.clocks.lineup.isRunning) {
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
    if (clock == null || !clock.isRunning) {
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
  }, [bout, clock, stopAtZero]);

  // Render the number of milliseconds elapsed/remaining
  let elapsed = 0;
  let remaining = null;
  if (clock != null) {
    elapsed = clock.elapsed;
    if (clock.isRunning) {
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

export function useSeries() {
  return useGenericStore("series");
}

export function useBout(boutUuid) {
  const uri = { bout: boutUuid };
  return useGenericStore("bout", { uri })
}

export function useJam(uri) {
  return useGenericStore("jam", { uri })
}

export function useJamNavigation(uri) {
  const [previousUri, setPreviousUri] = useState(null);
  const [nextUri, setNextUri] = useState(null);
  const bout = useBout(uri.bout);

  useEffect(() => {
    if (bout == null || uri == null) {
      setPreviousUri(null);
      return;
    }

    const newUri = { ...uri };
    newUri.jam -= 1;

    // Ensure the previous Jam exists
    if (newUri.jam < 0) {
      if (newUri.period == 0) {
        setPreviousUri(null);
        return;  // Already on the zeroeth Period
      }
      newUri.period -= 1;
      newUri.jam = bout.periods[newUri.period].jamCount;
    }

    setPreviousUri(newUri);
  }, [bout, uri]);


  useEffect(() => {
    if (bout == null || uri == null) {
      setNextUri(null);
      return;
    }

    const newUri = { ...uri };
    newUri.jam += 1;

    // Ensure the next Jam exists
    if (newUri.jam >= bout.periods[newUri.period].jamCount) {
      if (newUri.period > 0) {
        setNextUri(null);
        return;  // Can't have more than 2 Periods
      }
      newUri.period += 1;
      if (bout.periods[newUri.period].jamCount < 1) {
        setNextUri(null);
        return;  // There are no Jams in the next Period
      }
      newUri.jam = 0;
    }

    setNextUri(newUri);
  }, [bout, uri]);


  return [previousUri, nextUri];
}