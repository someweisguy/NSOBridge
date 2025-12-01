import { useEffect } from "react";
import useServerTime from "../hooks/use-server-time";
import defaultTimeStringFormatter from "../utils/time-string-formatters";

interface ClockProps {
  startTimestamp: Date | null;
  stopTimestamp?: Date | null;
  elapsed?: number;
  alarm?: number;
  freeze?: boolean;
  formatter?: (milliseconds: number, alarm?: number) => string;
}

export default function Clock({
  startTimestamp,
  stopTimestamp,
  elapsed = 0,
  alarm,
  freeze = false,
  formatter = defaultTimeStringFormatter,
}: ClockProps) {
  const [serverTime, refreshServerTime] = useServerTime();

  useEffect(() => {
    if (freeze) {
      // Do not update component if manually frozen
      return;
    }

    // Refresh the component every 16ms (60Hz)
    const intervalId = setInterval(refreshServerTime, 16);
    return () => clearInterval(intervalId);
  }, [freeze, alarm, refreshServerTime]);

  // Calculate the number of milliseconds that have elapsed
  let milliseconds = elapsed;
  if (startTimestamp !== null) {
    if (stopTimestamp != null) {
      milliseconds += stopTimestamp.getTime() - startTimestamp.getTime();
    } else {
      milliseconds += serverTime.getTime() - startTimestamp.getTime();
    }
  }

  return (
    <label className="tabular-nums">{formatter(milliseconds, alarm)}</label>
  );
}
