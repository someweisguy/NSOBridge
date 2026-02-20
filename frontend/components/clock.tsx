import { useSuspenseServerTime } from "@/hooks/use-suspense-server-time";
import { useEffect } from "react";
import defaultTimeStringFormatter from "../utils/time-string-formatters";

const CLOCK_REFRESH_RATE = 1000 / 60; // 60Hz refresh rate

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
  const [serverTime, refreshServerTime] = useSuspenseServerTime();

  useEffect(() => {
    if (freeze || startTimestamp == null) {
      // Do not update component if manually frozen or stopped
      return;
    }

    const intervalId = setInterval(refreshServerTime, CLOCK_REFRESH_RATE);
    return () => clearInterval(intervalId);
  }, [startTimestamp, alarm, freeze, refreshServerTime]);

  // Calculate the number of milliseconds that have elapsed
  let milliseconds = elapsed;
  if (startTimestamp !== null) {
    if (stopTimestamp != null) {
      milliseconds += stopTimestamp.getTime() - startTimestamp.getTime();
    } else {
      milliseconds += serverTime.getTime() - startTimestamp.getTime();
    }
  }

  return <span className="tabular-nums">{formatter(milliseconds, alarm)}</span>;
}
