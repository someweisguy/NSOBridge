import { ClockType } from "../types/ClockType";
import { DurationType } from "../types/DurationType";
import toDuration from "../utils/toDuration";
import useClock from "./useClock";

export default function usePlayClock(boutId: string): DurationType {
  const jamClock: ClockType = useClock(boutId, "jam");
  const lineupClock: ClockType = useClock(boutId, "lineup");
  const timeoutClock: ClockType = useClock(boutId, "timeout");

  // Display the currently running clock or the Jam clock
  const activeClock: ClockType = timeoutClock.isRunning ? timeoutClock
    : lineupClock.isRunning ? lineupClock : jamClock;

  // Count down if there is an alarm set, otherwise count up.
  const timeToDisplay: number = activeClock.alarm ?
    activeClock.alarm - activeClock.elapsed : activeClock.elapsed;

  return toDuration(timeToDisplay);
}