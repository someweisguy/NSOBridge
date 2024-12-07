import { ClockType } from "../types/ClockType";
import { DurationType } from "../types/DurationType";
import toDuration from "../utils/toDuration";
import useClock from "./useClock";

export default function usePlayClock(
  boutId: string,
  stopAtZero: boolean = true
): DurationType {
  const jamClock: ClockType = useClock(boutId, "jam", stopAtZero);
  const lineupClock: ClockType = useClock(boutId, "lineup", stopAtZero);
  const timeoutClock: ClockType = useClock(boutId, "timeout", stopAtZero);

  // Display the currently running clock or the Jam clock
  const activeClock: ClockType = timeoutClock.isRunning
    ? timeoutClock
    : lineupClock.isRunning
    ? lineupClock
    : jamClock;

  // Count down if there is an alarm set, otherwise count up.
  let timeToDisplay: number = activeClock.alarm
    ? activeClock.alarm - activeClock.elapsed
    : activeClock.elapsed;

  if (stopAtZero && timeToDisplay < 0) {
    timeToDisplay = 0;
  }

  return toDuration(timeToDisplay);
}
