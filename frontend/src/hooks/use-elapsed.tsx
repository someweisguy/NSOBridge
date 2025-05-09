import { Clock } from "@/lib/client/api/bout";
import useBout from "./use-bout";
import { useEffect, useState } from "react";

export default function useElapsed(
  boutId: string,
  clockName: "intermission" | "game" | "jam" | "lineup" | "timeout"
) {
  const clock: Clock = useBout(boutId).timer.clocks[clockName];
  const [lap, setLap] = useState(
    clock.startTimestamp !== null
      ? new Date().getTime() - clock.startTimestamp.getTime()
      : 0
  );

  useEffect(() => {
    if (clock.startTimestamp === null) {
      setLap(0); // The clock is not running
      return;
    }

    setLap(new Date().getTime() - clock.startTimestamp.getTime());
    const intervalId = setInterval(() => {
      setLap(new Date().getTime() - clock.startTimestamp!.getTime());
    }, 10);

    return () => clearInterval(intervalId);
  }, [clock.startTimestamp]);

  return lap + clock.elapsed;
}
