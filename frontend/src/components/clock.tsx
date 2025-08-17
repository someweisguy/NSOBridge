import useServerOffset from "@/hooks/use-server-offset";
import { getServerTime } from "@/lib/sync";
import { useEffect, useState } from "react";

interface ClockProps {
  startTimestamp: Date | null;
  stopTimestamp?: Date | null;
  elapsed?: number;
  alarm?: number;
  formatter?: (millis: number, displayMillis: boolean) => string;
  displaymillis?: (millis: number) => boolean;
}

function formatMilliseconds(millis: number, displayMillis: boolean): string {
  const isNegative = millis < 0;
  millis = Math.abs(millis);
  let m = String(Math.floor((millis % 3600000) / 60000));
  let s = String(Math.floor((millis / 1000) % 60));

  let output: string;
  if (millis >= 3600000) {
    const h = Math.floor(millis / 3600000);
    m = String(m).padStart(2, "0");
    s = String(s).padStart(2, "0");
    output = `${h}:${m}:${s}`;
  } else if (millis >= 60000) {
    s = String(s).padStart(2, "0");
    output = `${m}:${s}`;
  } else {
    output = s;
  }

  // Render tenths of a seconds
  if (displayMillis) {
    const ds = String(Math.floor((millis % 1000) / 100)).padStart(1, "0");
    output += `.${ds}`;
  }

  // Render a negative sign if the format string is not zero
  if (isNegative && ((displayMillis && millis >= 100) || millis >= 1000)) {
    output = "-" + output;
  }

  return output;
}

function getClockMillis(
  startTimestamp: Date | null,
  stopTimestamp: Date,
  elapsed: number,
  alarm?: number
): number {
  if (startTimestamp !== null) {
    if (stopTimestamp < startTimestamp) {
      stopTimestamp = startTimestamp;
    }
    elapsed += stopTimestamp.getTime() - startTimestamp.getTime();
  }

  if (alarm !== undefined) {
    elapsed = alarm - elapsed;
  }

  return elapsed;
}

export default function Clock({
  startTimestamp,
  stopTimestamp,
  elapsed = 0,
  alarm,
  formatter = formatMilliseconds,
}: ClockProps) {
  const { offset } = useServerOffset();

  const [clockMillis, setClockMillis] = useState<number>(
    getClockMillis(
      startTimestamp,
      stopTimestamp ?? getServerTime(offset),
      elapsed,
      alarm
    )
  );

  useEffect(() => {
    if (startTimestamp === null || stopTimestamp != null) {
      return; // Clock is not running
    }
    if (alarm !== undefined && clockMillis <= 0) {
      return; // Clock has elapsed
    }

    // Refresh the Clock every 1/10 of a second
    const timeoutPeriod = 50 - (clockMillis % 50);

    const timeoutId = setTimeout(() => {
      setClockMillis(
        getClockMillis(
          startTimestamp,
          stopTimestamp ?? getServerTime(offset),
          elapsed,
          alarm
        )
      );
    }, timeoutPeriod);

    return () => clearTimeout(timeoutId);
  }, [startTimestamp, stopTimestamp, elapsed, alarm, clockMillis, offset]);

  return <>{formatter(clockMillis, true)}</>;
}
