import { useEffect, useRef } from "react";
import defaultTimeStringFormatter from "../utils/DefaultTimeStringFormatter";
import useServerTime from "../hooks/use-server-time";

interface ClockProps {
  startTimestamp: Date | null;
  stopTimestamp?: Date | null;
  elapsed?: number;
  alarm?: number;
  freeze?: boolean;
  formatter?: (milliseconds: number) => string;
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

  // Calculate the number of milliseconds that have elapsed
  const milliseconds = useRef<number>(elapsed);
  if (startTimestamp !== null) {
    if (stopTimestamp != null) {
      milliseconds.current +=
        stopTimestamp.getTime() - startTimestamp.getTime();
    } else {
      milliseconds.current += startTimestamp.getTime() - serverTime.getTime();
    }
  }

  // If an alarm is defined display the component as a count-down
  if (alarm !== undefined) {
    milliseconds.current = alarm - milliseconds.current;
  }

  useEffect(() => {
    if (freeze || (alarm !== undefined && milliseconds.current < -2500)) {
      // Do not update component
      return;
    }

    const intervalId = setInterval(() => {
      refreshServerTime();
    }, 16);

    return () => clearInterval(intervalId);
  }, [freeze, alarm, refreshServerTime]);

  return (
    <label className="tabular-nums">{formatter(milliseconds.current)}</label>
  );
}
