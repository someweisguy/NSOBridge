import useClock from "../../../hooks/useClock";
import { BoutIdType } from "../../../types/BoutIdType";

export default function usePlayState(boutId: BoutIdType) {
  const jamIsRunning = useClock<boolean>(
    boutId,
    "jam",
    (clock) => clock.isRunning
  );
  const timeoutIsRunning = useClock<boolean>(
    boutId,
    "timeout",
    (clock) => clock.isRunning
  );
  const lineupIsRunning = useClock<boolean>(
    boutId,
    "lineup",
    (clock) => clock.isRunning
  );

  if (jamIsRunning) {
    return "jam";
  } else if (timeoutIsRunning) {
    return "timeout";
  } else if (lineupIsRunning) {
    return "lineup";
  } else {
    return "stopped";
  }
}
